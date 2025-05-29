from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsAwardRequirement,
    AuthoredReviewsPositionAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec

SPECS: list[tuple[str, int, int, int, str]] = [
    ("You have started your journey as a critic.", 25, 5, 5),
    ("You have quite a lot of level reviews under your belt.", 100, 15, 5),
    ("You are an avid critic, striving to be the first reviewer.", 200, 50, 5),
    ("You have garnered quite the reputation as a critic.", 400, 100, 5),
    ("You are a well-known critic, on top of every game.", 800, 200, 5),
]


def amulet_of_horus() -> Iterable[AwardSpec]:
    for tier, (
        description,
        min_total_reviews,
        min_early_reviews,
        max_early_review_position,
    ) in enumerate(SPECS, 1):
        yield AwardSpec(
            code="amulet_of_horus",
            title="Amulet of Horus",
            tier=tier,
            description=description,
            guide_description=(
                f"Obtained by writing {min_total_reviews} reviews "
                f"and being the first reviewer on {min_early_reviews} levels."
            ),
            requirement=(
                AuthoredReviewsAwardRequirement(min_reviews=min_total_reviews)
                & AuthoredReviewsPositionAwardRequirement(
                    min_reviews=min_early_reviews,
                    max_position=max_early_review_position,
                )
            ),
        )
