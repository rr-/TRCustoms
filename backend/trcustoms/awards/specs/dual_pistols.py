from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsRatingCountRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def dual_pistols() -> Iterable[AwardSpec]:
    min_levels = 10

    yield AwardSpec(
        code="dual_pistols",
        title="Dual Pistols",
        description=(
            f"You released {min_levels} levels that are up to standard."
        ),
        requirement=AuthoredLevelsRatingCountRequirement(
            min_rating=0,
            min_levels=min_levels,
            extrapolate_ratings=True,
        ),
    )
