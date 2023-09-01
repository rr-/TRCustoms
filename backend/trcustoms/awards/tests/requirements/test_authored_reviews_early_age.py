import pytest

from trcustoms.awards.requirements.base import BaseAwardRequirement
from trcustoms.awards.requirements.impl import (
    AuthoredReviewsEarlyAgeAwardRequirement,
)
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="specs")
def fixture_specs() -> list[BaseAwardRequirement]:
    return [
        AuthoredReviewsEarlyAgeAwardRequirement(
            min_total_reviews=1, min_early_reviews=0, max_review_position=2
        ),
        AuthoredReviewsEarlyAgeAwardRequirement(
            min_total_reviews=2, min_early_reviews=0, max_review_position=2
        ),
        AuthoredReviewsEarlyAgeAwardRequirement(
            min_total_reviews=4, min_early_reviews=1, max_review_position=2
        ),
    ]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "late_reviews, early_reviews, expected_tier",
    [
        (0, 0, 0),
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
    specs: list[BaseAwardRequirement],
    late_reviews: int,
    early_reviews: int,
    expected_tier: int,
) -> None:
    user = UserFactory()
    for _ in range(early_reviews):
        level = LevelFactory()
        for n in range(specs[0].max_review_position - 1):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)
    for _ in range(late_reviews):
        level = LevelFactory()
        for n in range(specs[0].max_review_position):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)

    actual_tier = 0
    for tier, spec in enumerate(specs, 1):
        if spec.check_eligible(user):
            actual_tier = max(actual_tier, tier)

    assert actual_tier == expected_tier
