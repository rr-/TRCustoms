from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus


class SanglyphAwardSpec(BaseAwardSpec):
    code = "sanglyph"
    title = "The Sanglyph"
    descriptions = {
        0: (
            "You built levels, reviewed levels, and guided others through "
            "levels. Respect!"
        )
    }
    position = 11

    required_levels = 3
    required_reviews = 30
    required_walkthroughs = 10

    def check_eligible(self, user: User, tier: int) -> bool:
        # Built 3 levels, reviewed 30 levels, and released 10 walkthroughs.
        # With the levels and walkthroughs being approved of course.
        levels = user.authored_levels.filter(is_approved=True)
        reviews = user.reviewed_levels
        walkthroughs = user.authored_walkthroughs.filter(
            status=WalkthroughStatus.APPROVED
        )
        return (
            levels.count() >= self.required_levels
            and reviews.count() >= self.required_reviews
            and walkthroughs.count() >= self.required_walkthroughs
        )
