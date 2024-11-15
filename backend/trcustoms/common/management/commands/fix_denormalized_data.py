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

    def handle(self, *args, **options):
        logging.disable(logging.WARNING)

        with disable_signals():
            self.fix_levels()
            self.fix_users()
            self.fix_rating_ratings()
            self.fix_level_ratings()

    def fix_levels(self) -> None:
        with tqdm(desc="Levels", total=Level.objects.count()) as progress:
            for level in Level.objects.iterator():
                level.update_last_file()
                progress.update()

    def fix_users(self) -> None:
        with tqdm(desc="Users", total=User.objects.count()) as progress:
            for user in User.objects.iterator():
                user.update_authored_level_count()
                user.update_reviewed_level_count()
                user.update_rated_level_count()
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
