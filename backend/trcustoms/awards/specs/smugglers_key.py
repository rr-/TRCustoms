from collections.abc import Iterable
from datetime import timedelta

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsTimingAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def smugglers_key() -> Iterable[AwardSpec]:
    min_levels = 5
    max_hours = 24

    yield AwardSpec(
        code="smugglers_key",
        title="Smuggler's Key",
        description=(
            f"You reviewed {min_levels} levels within {max_hours} hours "
            "of release."
        ),
        guide_description=(
            f"Review {min_levels} levels within {max_hours} hours "
            "from their release."
        ),
        requirement=AuthoredReviewsTimingAwardRequirement(
            min_levels=min_levels,
            max_review_age=timedelta(hours=max_hours),
        ),
    )
