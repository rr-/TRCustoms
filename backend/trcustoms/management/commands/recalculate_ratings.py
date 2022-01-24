from collections import defaultdict

from django.core.management.base import BaseCommand

from trcustoms.models import Level, LevelReview
from trcustoms.ratings import get_level_rating_class, get_review_rating_class
from trcustoms.signals import disable_signals


class Command(BaseCommand):
    help = "Recalculate all ratings."

    def handle(self, *args, **options):
        with disable_signals():

            level_map = defaultdict(list)
            for level in Level.objects.all().prefetch_related("reviews"):
                rating_class = get_level_rating_class(level)
                rating_class_id = rating_class.id if rating_class else None
                level_map[rating_class_id].append(level.id)

            for rating_class_id, level_ids in level_map.items():
                Level.objects.filter(id__in=level_ids).update(
                    rating_class_id=rating_class_id
                )

            review_map = defaultdict(list)
            for review in LevelReview.objects.all():
                rating_class = get_review_rating_class(review)
                rating_class_id = rating_class.id if rating_class else None
                review_map[rating_class_id].append(review.id)

            for rating_class_id, review_ids in review_map.items():
                LevelReview.objects.filter(id__in=review_ids).update(
                    rating_class_id=rating_class_id
                )
