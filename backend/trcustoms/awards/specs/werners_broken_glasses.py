from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


class WernersBrokenGlassesAwardSpec(BaseAwardSpec):
    required_position = 20
    required_count = 500

    code = "werners_broken_glasses"
    title = "Werner's Broken Glasses"
    descriptions = {
        0: (
            f"You are one of the first {required_position} reviewers "
            f"for {required_count} levels."
        )
    }
    position = 9

    def check_eligible(self, user: User, tier: int) -> bool:
        # User has released X reviews that are early enough.
        return (
            user.reviewed_levels.filter(
                position__lte=self.required_position
            ).count()
            >= self.required_count
        )
