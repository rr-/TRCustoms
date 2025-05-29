from collections.abc import Iterable
from datetime import timedelta

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsFarApartRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def chirugai() -> Iterable[AwardSpec]:
    years = 10
    min_time_apart = timedelta(days=years * 365)

    yield AwardSpec(
        code="chirugai",
        title="Chirugai",
        description="You have returned after years of inactivity.",
        can_be_removed=True,
        guide_description=(
            f"Obtained by releasing a level, and then releasing another level "
            f"after {years} years."
        ),
        requirement=AuthoredLevelsFarApartRequirement(
            min_time_apart=min_time_apart
        ),
    )
