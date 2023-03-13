from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


class IrisAwardSpec(BaseAwardSpec):
    required = 25

    code = "iris"
    title = "Iris"
    descriptions = {0: f"You have submitted {required} video walkthroughs."}
    position = 6

    def check_eligible(self, user: User, tier: int) -> bool:
        # User has released X or more approved video walkthroughs.
        return (
            user.authored_walkthroughs.filter(
                status=WalkthroughStatus.APPROVED,
                walkthrough_type=WalkthroughType.LINK,
            ).count()
            >= self.required
        )
