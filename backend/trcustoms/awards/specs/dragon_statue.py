from collections import defaultdict
from dataclasses import dataclass

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


@dataclass
class Requirement:
    count: int
    rating: int


class DragonStatueAwardSpec(BaseAwardSpec):
    extrapolate_ratings = True
    requirements = {
        1: [Requirement(count=1, rating=2), Requirement(count=3, rating=1)],
        2: [Requirement(count=1, rating=3), Requirement(count=3, rating=2)],
        3: [Requirement(count=1, rating=4), Requirement(count=5, rating=3)],
        4: [Requirement(count=1, rating=5), Requirement(count=5, rating=4)],
        5: [Requirement(count=3, rating=5)],
    }

    code = "dragon_statue"
    title = "Dragon Statue"
    descriptions = {
        1: "You are a fine builder, so keep it up!",
        2: "You are a reliable builder.",
        3: "You are a veteran builder.",
        4: "You are an exceptional builder.",
        5: "You have proven to be an extraordinary builder.",
    }
    position = 1

    def check_eligible(self, user: User, tier: int) -> bool:
        authored_level_rating_counts = defaultdict(int)
        for rating_class in user.authored_levels.values_list(
            "rating_class__position", flat=True
        ):
            if not rating_class:
                continue
            if self.extrapolate_ratings:
                for num in range(1, rating_class + 1):
                    authored_level_rating_counts[num] += 1
            else:
                authored_level_rating_counts[rating_class] += 1

        requirements = self.requirements[tier]
        return any(
            authored_level_rating_counts[requirement.rating]
            >= requirement.count
            for requirement in requirements
        )
