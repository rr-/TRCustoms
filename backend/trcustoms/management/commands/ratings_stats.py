from django.core.management.base import BaseCommand
from django.db.models import Count

from trcustoms.models import Level


class Command(BaseCommand):
    help = "Get level rating statistics."

    def handle(self, *args, **options):
        ratings = {}
        for item in (
            Level.objects.all()
            .values("rating_class__name")
            .annotate(total=Count("rating_class__name"))
            .order_by("rating_class__position")
        ):
            ratings[item["rating_class__name"] or "null"] = item["total"]

        for name, count in ratings.items():
            print(
                f"{name:<30s}: {count:4d}",
                "*" * (40 * count // max(ratings.values())),
            )
