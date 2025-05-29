from collections.abc import Iterable
from datetime import datetime

from trcustoms.awards.requirements.impl import (
    EarlyLevelsEditedAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def bone_dust() -> Iterable[AwardSpec]:
    max_date = datetime(2022, 4, 2)

    yield AwardSpec(
        code="bone_dust",
        title="Bone Dust",
        description="You have updated all your levels imported from TRLE.net.",
        guide_description=(
            "Obtained by updating all of your levels "
            "that were imported from TRLE.net."
        ),
        can_be_removed=True,
        requirement=EarlyLevelsEditedAwardRequirement(max_date=max_date),
    )
