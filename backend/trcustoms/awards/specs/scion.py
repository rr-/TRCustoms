from dataclasses import dataclass

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus


@dataclass
class Requirement:
    walkthroughs: int

    def passes(self, walkthroughs) -> bool:
        return walkthroughs >= self.walkthroughs


class ScionAwardSpec(BaseAwardSpec):
    requirements = {
        1: Requirement(walkthroughs=50),
        2: Requirement(walkthroughs=100),
        3: Requirement(walkthroughs=250),
        4: Requirement(walkthroughs=500),
        5: Requirement(walkthroughs=1000),
    }

    code = "scion"
    title = "Scion"
    descriptions = {
        1: (
            "A baseline of quality guides has been set, "
            "will you be able to surpass it?"
        ),
        2: "Your work as a guide is proving to be more than just a hobby.",
        3: "Your dedication to the community is impressive.",
        4: "You have saved others countless hours.",
        5: "Being a guide is simply your way of life.",
    }
    position = 3

    def check_eligible(self, user: User, tier: int) -> bool:
        walkthroughs = user.authored_walkthroughs.filter(
            status=WalkthroughStatus.APPROVED,
        ).count()
        return self.requirements[tier].passes(walkthroughs=walkthroughs)
