from collections.abc import Iterable
from datetime import timedelta

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsSustainableQualityRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def philosophers_stone() -> Iterable[AwardSpec]:
    timedelta(days=365)

    yield AwardSpec(
        code="philosophers_stone",
        title="Philosopher's Stone",
        description=(
            "You released two levels within the same year that got "
            "an overwhelmingly positive rating."
        ),
        can_be_removed=True,
        guide_description=(
            "Obtained by releasing two levels within the same year "
            "that have an overwhelmingly positive rating."
        ),
        requirement=AuthoredLevelsSustainableQualityRequirement(
            min_rating_class=4,
            max_time_apart=timedelta(days=365),
        ),
    )
