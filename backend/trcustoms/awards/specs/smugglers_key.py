from collections.abc import Iterable
from datetime import timedelta

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsTimingAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def smugglers_key() -> Iterable[AwardSpec]:
    min_levels = 50
    max_review_age = timedelta(hours=24)

    yield AwardSpec(
        code="smugglers_key",
        title="Smuggler's Key",
        description=(
            f"You reviewed {min_levels} levels on the same "
            "or next day of release."
        ),
        requirement=AuthoredReviewsTimingAwardRequirement(
            min_levels=min_levels,
            max_review_age=max_review_age,
        ),
    )
