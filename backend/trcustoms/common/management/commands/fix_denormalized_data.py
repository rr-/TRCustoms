import logging
from collections import defaultdict

from django.core.management.base import BaseCommand
from tqdm import tqdm

from trcustoms.levels.models import Level
from trcustoms.ratings import get_level_rating_class, get_review_rating_class
from trcustoms.reviews.models import Review
from trcustoms.signals import disable_signals
from trcustoms.users.models import User


class Command(BaseCommand):
    help = "Make sure any denormalized data is correct."

    def handle(self, *args, **options):
        logging.disable(logging.WARNING)

        with disable_signals():
            self.fix_levels()
            self.fix_users()
            self.fix_level_ratings()
            self.fix_review_ratings()

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
                progress.update()

    def fix_level_ratings(self) -> None:
        with tqdm(
            desc="Level ratings", total=Level.objects.count()
        ) as progress:
            level_map = defaultdict(list)
            for level in Level.objects.all().prefetch_related("reviews"):
                rating_class = get_level_rating_class(level)
                rating_class_id = rating_class.id if rating_class else None
                level_map[rating_class_id].append(level.id)
                progress.update()

        for rating_class_id, level_ids in level_map.items():
            Level.objects.filter(id__in=level_ids).update(
                rating_class_id=rating_class_id
            )

    def fix_review_ratings(self) -> None:
        with tqdm(
            desc="Review ratings", total=Review.objects.count()
        ) as progress:
            review_map = defaultdict(list)
            for review in Review.objects.all():
                rating_class = get_review_rating_class(review)
                rating_class_id = rating_class.id if rating_class else None
                review_map[rating_class_id].append(review.id)
                progress.update()

        for rating_class_id, review_ids in review_map.items():
            Review.objects.filter(id__in=review_ids).update(
                rating_class_id=rating_class_id
            )
