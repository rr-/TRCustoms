import logging
from collections import defaultdict

from django.core.management.base import BaseCommand
from tqdm import tqdm

from trcustoms.levels.models import Level
from trcustoms.ratings.models import Rating
from trcustoms.scoring import get_object_rating_class
from trcustoms.signals import disable_signals
from trcustoms.users.models import User


class Command(BaseCommand):
    help = "Make sure any denormalized data is correct."

    def add_arguments(self, parser):
        parser.add_argument("-u", "--users", action="store_true")
        parser.add_argument("-l", "--levels", action="store_true")
        parser.add_argument("--level-ratings", action="store_true")
        parser.add_argument("--rating-ratings", action="store_true")
        parser.add_argument("-a", "--all", action="store_true")

    def handle(self, *args, **options):
        logging.disable(logging.WARNING)

        fix_funcs = {
            "levels": self.fix_levels,
            "users": self.fix_users,
            "level_ratings": self.fix_level_ratings,
            "rating_ratings": self.fix_rating_ratings,
        }

        if not options["all"] and not any(
            options[key] for key in fix_funcs.keys()
        ):
            self.stderr.write(
                self.style.ERROR(
                    "Must select target what to fix (use -a to fix everything)"
                )
            )
            return

        with disable_signals():
            for key, func in fix_funcs.items():
                if options["all"] or options[key]:
                    func()

    def fix_levels(self) -> None:
        with tqdm(desc="Levels", total=Level.objects.count()) as progress:
            for level in Level.objects.iterator():
                level.update_last_file()
                level.update_review_count()
                level.update_rating_count()
                progress.update()

    def fix_users(self) -> None:
        with tqdm(desc="Users", total=User.objects.count()) as progress:
            for user in User.objects.iterator():
                user.update_authored_level_count(save=False)
                user.update_rated_level_count(save=False)
                user.update_reviewed_level_count(save=False)
                user.update_authored_walkthrough_count(save=False)
                user.update_played_level_count(save=False)
                user.save()
                progress.update()

    def fix_level_ratings(self) -> None:
        with tqdm(
            desc="Level ratings", total=Level.objects.count()
        ) as progress:
            level_map = defaultdict(list)
            for level in Level.objects.all().prefetch_related("reviews"):
                rating_class = get_object_rating_class(level)
                rating_class_id = rating_class.id if rating_class else None
                level_map[rating_class_id].append(level.id)
                progress.update()

        for rating_class_id, level_ids in level_map.items():
            Level.objects.filter(id__in=level_ids).update(
                rating_class_id=rating_class_id
            )

    def fix_rating_ratings(self) -> None:
        with tqdm(
            desc="Rating ratings", total=Rating.objects.count()
        ) as progress:
            rating_map = defaultdict(list)
            for rating in Rating.objects.all():
                rating_class = get_object_rating_class(rating)
                rating_class_id = rating_class.id if rating_class else None
                rating_map[rating_class_id].append(rating.id)
                progress.update()

        for rating_class_id, rating_ids in rating_map.items():
            Rating.objects.filter(id__in=rating_ids).update(
                rating_class_id=rating_class_id
            )
