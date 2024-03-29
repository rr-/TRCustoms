from unittest.mock import patch

import pytest

from trcustoms.awards.logic import get_max_eligible_spec
from trcustoms.awards.specs import amulet_of_horus
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
@pytest.mark.parametrize(
    "late_reviews, early_reviews, expected_tier",
    [
        (0, 0, -1),
        (1, 0, 1),
        (0, 1, 1),
        (0, 2, 2),
        (1, 1, 2),
        (2, 1, 2),
        (3, 1, 3),
        (4, 0, 2),
        (4, 1, 3),
        (4, 2, 3),
    ],
)
def test_amulet_of_horus_award_spec(
    late_reviews: int,
    early_reviews: int,
    expected_tier: int,
) -> None:
    max_review_position = 2

    user = UserFactory()
    for _ in range(early_reviews):
        level = LevelFactory()
        for n in range(max_review_position - 1):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)
    for _ in range(late_reviews):
        level = LevelFactory()
        for n in range(max_review_position):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)

    with patch(
        "trcustoms.awards.specs.amulet_of_horus.SPECS",
        [
            ("tier1", 1, 0, max_review_position),
            ("tier2", 2, 0, max_review_position),
            ("tier3", 4, 1, max_review_position),
        ],
    ):
        actual_tier, _actual_spec = get_max_eligible_spec(
            user, amulet_of_horus()
        )

    assert actual_tier == expected_tier
