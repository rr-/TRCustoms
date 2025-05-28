from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    PlayedLevelsWithRatingAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def demons_heart() -> Iterable[AwardSpec]:
    min_levels = 50

    yield AwardSpec(
        code="demons_heart",
        title="Demon's Heart",
        description=(
            f"You finished {min_levels} levels with a negative rating."
        ),
        guide_description=(
            f"Mark {min_levels} negatively reviewed levels "
            "in your playlist as Finished."
        ),
        requirement=PlayedLevelsWithRatingAwardRequirement(
            min_levels=min_levels,
            max_rating=-1,
        ),
    )


def spear_of_destiny() -> Iterable[AwardSpec]:
    min_levels = 50

    yield AwardSpec(
        code="spear_of_destiny",
        title="Spear of Destiny",
        description=(
            f"You finished {min_levels} levels with a positive rating."
        ),
        guide_description=(
            f"Mark {min_levels} positively reviewed levels "
            "in your playlist as Finished."
        ),
        requirement=PlayedLevelsWithRatingAwardRequirement(
            min_levels=min_levels,
            min_rating=1,
        ),
    )
