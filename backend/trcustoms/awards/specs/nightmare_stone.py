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
            f"{min_levels} of your levels have at least {min_tags} tag."
        ),
        can_be_removed=True,
        guide_description=(
            f"Obtained by having {min_levels} of your levels include "
            f"at least {min_tags} tag."
        ),
        requirement=AuthoredLevelsTagCountRequirement(
            min_levels=min_levels,
            min_tags=min_tags,
        ),
    )
