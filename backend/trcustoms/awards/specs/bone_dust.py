from datetime import datetime

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


class BoneDustAwardSpec(BaseAwardSpec):
    required_max_date = datetime(2022, 4, 2)

    code = "bone_dust"
    title = "Bone Dust"
    descriptions = {
        0: "You have updated all your levels imported from TRLE.net."
    }
    position = 10

    def check_eligible(self, user: User, tier: int) -> bool:
        # Since level edit form can't be submitted without putting genres...
        # Check if all levels that were released by the user BEFORE 2 Apr 2022
        # have any genre.
        all_early_levels = user.authored_levels.filter(
            is_approved=True, created__lte=self.required_max_date
        )
        return (
            all_early_levels.exists()
            and not all_early_levels.filter(genres=None).exists()
        )
