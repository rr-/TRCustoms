from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsSameBuilderAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def werners_notebook() -> Iterable[AwardSpec]:
    min_reviews = 5

    yield AwardSpec(
        code="werners_notebook",
        title="Werner's Notebook",
        description=(
            f"You reviewed {min_reviews} levels belonging to one author."
        ),
        guide_description=(
            f"Obtained by reviewing {min_reviews} levels "
            "belonging to one author."
        ),
        requirement=AuthoredReviewsSameBuilderAwardRequirement(min_reviews),
    )
