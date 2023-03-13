from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


class DualPistolsAwardSpec(BaseAwardSpec):
    required = 10

    code = "dual_pistols"
    title = "Dual Pistols"
    descriptions = {
        0: f"You released {required} levels that are up to standard."
    }
    position = 4

    def check_eligible(self, user: User, tier: int) -> bool:
        # User has released X or more approved levels with at least mixed
        # rating.
        return (
            user.authored_levels.filter(
                is_approved=True,
                rating_class__position__gte=0,
            ).count()
            >= self.required
        )
