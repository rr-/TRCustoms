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
