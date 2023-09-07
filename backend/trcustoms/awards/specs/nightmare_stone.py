from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsTagCountRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def nightmare_stone() -> Iterable[AwardSpec]:
    min_levels = 3
    min_tags = 1

    yield AwardSpec(
        code="nightmare_stone",
        title="Nightmare Stone",
        description=(
            f"{min_levels} of your levels have " f"at least {min_tags} tag."
        ),
        can_be_removed=True,
        requirement=AuthoredLevelsTagCountRequirement(
            min_levels=min_levels,
            min_tags=min_tags,
        ),
    )
