from collections.abc import Iterable

from trcustoms.awards.requirements.impl import PlayedLevelsAwardRequirement
from trcustoms.awards.specs.base import AwardSpec


def playlist_artefacts() -> Iterable[AwardSpec]:
    yield AwardSpec(
        code="wraith_stone",
        title="Wraith Stone",
        description="You completed 20 levels in your playlist.",
        requirement=PlayedLevelsAwardRequirement(min_levels=20),
        can_be_removed=True,
    )

    yield AwardSpec(
        code="excalibur",
        title="Excalibur",
        description="You completed 100 levels in your playlist.",
        requirement=PlayedLevelsAwardRequirement(min_levels=100),
        can_be_removed=True,
    )

    yield AwardSpec(
        code="mjolnir",
        title="Mjölnir",
        description="You completed 250 levels in your playlist.",
        requirement=PlayedLevelsAwardRequirement(min_levels=250),
        can_be_removed=True,
    )
