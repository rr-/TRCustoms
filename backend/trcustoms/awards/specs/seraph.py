from collections.abc import Iterable
from datetime import date

from trcustoms.awards.requirements.impl import JoinDateAwardRequirement
from trcustoms.awards.specs.base import AwardSpec


def seraph() -> Iterable[AwardSpec]:
    min_date = date(2022, 4, 1)
    max_date = date(2023, 4, 1)

    yield AwardSpec(
        code="seraph",
        title="Seraph",
        description="You've joined the site in its first year.",
        requirement=JoinDateAwardRequirement(
            min_date=min_date, max_date=max_date
        ),
    )
