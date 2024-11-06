from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsRatingCountRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def dragon_statue() -> Iterable[AwardSpec]:
    yield AwardSpec(
        code="dragon_statue",
        title="Dragon Statue",
        tier=1,
        description="You are a fine builder, so keep it up!",
        can_be_removed=True,
        requirement=(
            AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=1, min_rating=2
            )
            | AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=3, min_rating=1
            )
        ),
    )

    yield AwardSpec(
        code="dragon_statue",
        title="Dragon Statue",
        tier=2,
        description="You are a reliable builder.",
        can_be_removed=True,
        requirement=(
            AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=1, min_rating=3
            )
            | AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=3, min_rating=2
            )
        ),
    )

    yield AwardSpec(
        code="dragon_statue",
        title="Dragon Statue",
        tier=3,
        description="You are a veteran builder.",
        can_be_removed=True,
        requirement=(
            AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=1, min_rating=4
            )
            | AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=5, min_rating=3
            )
        ),
    )

    yield AwardSpec(
        code="dragon_statue",
        title="Dragon Statue",
        tier=4,
        description="You are an exceptional builder.",
        can_be_removed=True,
        requirement=(
            AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=1, min_rating=5
            )
            | AuthoredLevelsRatingCountRequirement(
                extrapolate_ratings=True, min_levels=5, min_rating=4
            )
        ),
    )

    yield AwardSpec(
        code="dragon_statue",
        title="Dragon Statue",
        tier=5,
        description="You have proven to be an extraordinary builder.",
        can_be_removed=True,
        requirement=AuthoredLevelsRatingCountRequirement(
            extrapolate_ratings=True, min_levels=3, min_rating=5
        ),
    )
