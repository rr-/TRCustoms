from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


class BestiaryAwardSpec(BaseAwardSpec):
    required = 25

    code = "bestiary"
    title = "Bestiary"
    descriptions = {0: f"You have submitted {required} text walkthroughs."}
    position = 7

    def check_eligible(self, user: User, tier: int) -> bool:
        # User has released X or more approved text walkthroughs.
        return (
            user.authored_walkthroughs.filter(
                status=WalkthroughStatus.APPROVED,
                walkthrough_type=WalkthroughType.TEXT,
            ).count()
            >= self.required
        )
