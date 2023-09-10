from collections.abc import Iterable

from django.conf import settings

from trcustoms.awards.requirements.impl import (
    AuthoredLevelsTagCountRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def magic_stones() -> Iterable[AwardSpec]:
    min_levels = 3
    min_tags = settings.MAX_TAGS

    yield AwardSpec(
        code="magic_stones",
        title="Magic Stones",
        description=f"You topped up {min_levels} of your levels with tags!",
        can_be_removed=True,
        requirement=AuthoredLevelsTagCountRequirement(
            min_levels=min_levels,
            min_tags=min_tags,
        ),
    )
