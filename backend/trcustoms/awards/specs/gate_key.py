from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredLevelPlayersAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def gate_key() -> Iterable[AwardSpec]:
    min_players = 50

    yield AwardSpec(
        code="gate_key",
        title="Gate Key",
        description=(
            f"{min_players} users have added one of your levels "
            "to their playlist."
        ),
        guide_description=(
            f"Obtained by having {min_players} users add your level "
            "to their playlist."
        ),
        can_be_removed=True,
        requirement=AuthoredLevelPlayersAwardRequirement(
            min_players=min_players
        ),
    )
