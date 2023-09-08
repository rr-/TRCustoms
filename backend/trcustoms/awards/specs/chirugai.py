from collections.abc import Iterable
from datetime import timedelta

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsFarApartRequirement,
)
from trcustoms.awards.specs import AwardSpec


def chirugai() -> Iterable[AwardSpec]:
    min_time_apart = timedelta(days=10 * 365)

    yield AwardSpec(
        code="chirugai",
        title="Chirugai",
        description="You have returned after years of inactivity.",
        requirement=AuthoredLevelsFarApartRequirement(
            min_time_apart=min_time_apart
        ),
    )
