from dataclasses import dataclass

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


@dataclass
class Requirement:
    total: int
    early: int

    def passes(self, total: int, early: int) -> bool:
        return total >= self.total and early >= self.early


class AmuletOfHorusAwardSpec(BaseAwardSpec):
    max_review_position = 5
    requirements = {
        1: Requirement(total=25, early=5),
        2: Requirement(total=100, early=15),
        3: Requirement(total=200, early=50),
        4: Requirement(total=400, early=100),
        5: Requirement(total=800, early=200),
    }

    code = "amulet_of_horus"
    title = "Amulet of Horus"
    descriptions = {
        1: "You have started your journey as a critic.",
        2: "You have quite a lot of level reviews under your belt.",
        3: "You are an avid critic, striving to be the first reviewer.",
        4: "You have garnered quite the reputation as a critic.",
        5: "You are a well-known critic, on top of every game.",
    }
    position = 2

    def check_eligible(self, user: User, tier: int) -> bool:
        total = user.reviewed_levels.all().count()
        early = user.reviewed_levels.filter(
            position__lte=self.max_review_position
        ).count()
        return self.requirements[tier].passes(total=total, early=early)
