from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredReviewsPositionAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def obscura_paintings() -> Iterable[AwardSpec]:
    positions: list[tuple[int, int]] = [
        (20, 1, 5, "First Obscura Painting"),
        (20, 6, 10, "Second Obscura Painting"),
        (20, 11, 15, "Third Obscura Painting"),
        (20, 16, 20, "Fourth Obscura Painting"),
        (20, 21, 25, "Fifth Obscura Painting"),
    ]

    for tier, (min_reviews, min_position, max_position, title) in enumerate(
        positions, 1
    ):
        yield AwardSpec(
            code=f"obscura_painting_{tier}",
            title=title,
            description=(
                f"You reviewed {min_reviews} levels with a review amount "
                f"between {min_position} and {max_position}!"
            ),
            guide_description=(
                f"Obtained by reviewing {min_reviews} levels that have "
                f"between {min_position} and {max_position} reviews."
            ),
            requirement=AuthoredReviewsPositionAwardRequirement(
                min_reviews=min_reviews,
                min_position=min_position,
                max_position=max_position,
            ),
        )
