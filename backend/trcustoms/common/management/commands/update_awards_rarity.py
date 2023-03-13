from django.core.management.base import BaseCommand

from trcustoms.awards.logic import get_award_rarity, update_award_rarities
from trcustoms.awards.specs import ALL_AWARDS_CLASSES


class Command(BaseCommand):
    help = "Update awards rarity."

    def handle(self, *args, **options):
        update_award_rarities()

        align = 30
        for spec_cls in sorted(
            ALL_AWARDS_CLASSES, key=lambda cls: cls.position
        ):
            spec = spec_cls()
            for tier in spec.supported_tiers:
                rarity = get_award_rarity(spec.code, tier)
                if tier:
                    print(f"{spec.code}({tier}):".ljust(align), rarity)
                else:
                    print(f"{spec.code}:".ljust(align), rarity)
