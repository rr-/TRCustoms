from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsPositionAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def werners_broken_glasses() -> Iterable[AwardSpec]:
    max_position = 20
    min_reviews = 500

    yield AwardSpec(
        code="werners_broken_glasses",
        title="Werner's Broken Glasses",
        description=(
            f"You are one of the first {max_position} reviewers "
            f"for {min_reviews} levels."
        ),
        guide_description=(
            f"Obtained by being one of the first {max_position} reviewers "
            f"for {min_reviews} levels."
        ),
        requirement=AuthoredReviewsPositionAwardRequirement(
            max_position=max_position,
            min_reviews=min_reviews,
        ),
    )
