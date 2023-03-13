import pytest

from trcustoms.awards.specs.dragon_statue import (
    DragonStatueAwardSpec,
    Requirement,
)
from trcustoms.conftest import LevelFactory, RatingClassFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = DragonStatueAwardSpec()
    spec.requirements = {
        1: [Requirement(count=1, rating=2), Requirement(count=3, rating=1)],
        2: [Requirement(count=1, rating=3), Requirement(count=2, rating=2)],
    }
    spec.descriptions = {
        tier: f"Tier {tier} description" for tier in spec.requirements.keys()
    }
    return spec


@pytest.mark.django_db
@pytest.mark.parametrize(
    "level_ratings, expected_tier",
    [
        ([1], 0),
        ([2], 1),
        ([1, 1], 0),
        ([1, 2], 1),
        ([1, 1, 1], 1),
        ([1, 1, 2], 1),
        ([3], 2),
        ([4], 2),
        ([2, 2], 2),
        ([2, 3], 2),
        ([2, 4], 2),
        ([2, 2, 1], 2),
        ([2, 2, 2], 2),
    ],
)
def test_dragon_statue_award_spec(
    spec: DragonStatueAwardSpec,
    level_ratings: list[int],
    expected_tier: int,
) -> None:
    user = UserFactory()
    for position in level_ratings:
        rating_class = RatingClassFactory(position=position)
        LevelFactory(authors=[user], rating_class=rating_class)
    assert user.authored_levels.count() == len(level_ratings)

    max_eligible_tier = 0
    for tier in spec.supported_tiers:
        if spec.check_eligible(user, tier):
            max_eligible_tier = tier

    assert max_eligible_tier == expected_tier
