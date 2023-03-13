import pytest

from trcustoms.awards.specs.amulet_of_horus import (
    AmuletOfHorusAwardSpec,
    Requirement,
)
from trcustoms.conftest import LevelFactory, ReviewFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = AmuletOfHorusAwardSpec()
    spec.max_review_position = 2
    spec.requirements = {
        1: Requirement(total=1, early=0),
        2: Requirement(total=2, early=0),
        3: Requirement(total=4, early=1),
    }
    spec.descriptions = {
        tier: f"Tier {tier} description" for tier in spec.requirements.keys()
    }
    return spec


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
    spec: AmuletOfHorusAwardSpec,
    late_reviews: int,
    early_reviews: int,
    expected_tier: int,
) -> None:
    user = UserFactory()
    for _ in range(early_reviews):
        level = LevelFactory()
        for n in range(spec.max_review_position - 1):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)
    for _ in range(late_reviews):
        level = LevelFactory()
        for n in range(spec.max_review_position):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)
    for tier in spec.supported_tiers:
        assert spec.check_eligible(user, tier) is (tier <= expected_tier)
