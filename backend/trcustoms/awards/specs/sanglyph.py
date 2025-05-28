from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsAwardRequirement,
    AuthoredReviewsAwardRequirement,
    AuthoredWalkthroughsAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def sanglyph() -> Iterable[AwardSpec]:
    min_levels = 3
    min_reviews = 30
    min_walkthroughs = 10

    yield AwardSpec(
        code="sanglyph",
        title="The Sanglyph",
        description=(
            "You built levels, reviewed levels, and guided others through "
            "levels. Respect!"
        ),
        can_be_removed=True,
        guide_description=(
            f"Build {min_levels} levels, review {min_reviews} levels, "
            f"and release {min_walkthroughs} walkthroughs."
        ),
        requirement=AuthoredLevelsAwardRequirement(
            min_levels=min_levels,
        )
        & AuthoredReviewsAwardRequirement(
            min_reviews=min_reviews,
        )
        & AuthoredWalkthroughsAwardRequirement(
            min_walkthroughs=min_walkthroughs,
        ),
    )
