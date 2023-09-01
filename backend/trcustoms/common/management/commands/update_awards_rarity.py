from django.core.management.base import BaseCommand

from trcustoms.awards.logic import get_award_rarity, update_award_rarities
from trcustoms.awards.specs import ALL_AWARD_SPECS


class Command(BaseCommand):
    help = "Update awards rarity."

    def handle(self, *args, **options):
        update_award_rarities()

        align = 30
        for spec in sorted(ALL_AWARD_SPECS, key=lambda cls: cls.position):
            rarity = get_award_rarity(spec.code, spec.tier)
            if spec.tier:
                print(f"{spec.code}({spec.tier}):".ljust(align), rarity)
            else:
                print(f"{spec.code}:".ljust(align), rarity)
