import pytest

from trcustoms.awards.logic import get_max_eligible_spec
from trcustoms.awards.requirements.impl import (
    AuthoredLevelsRatingCountRequirement,
)
from trcustoms.awards.specs import AwardSpec, dragon_statue
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="specs")
def fixture_specs() -> None:
    spec1 = list(dragon_statue())[0]
    spec1.requirement = AuthoredLevelsRatingCountRequirement(
        extrapolate_ratings=True, min_levels=1, min_rating=2
    ) | AuthoredLevelsRatingCountRequirement(
        extrapolate_ratings=True, min_levels=3, min_rating=1
    )

    spec2 = list(dragon_statue())[1]
    spec2.requirement = AuthoredLevelsRatingCountRequirement(
        extrapolate_ratings=True, min_levels=1, min_rating=3
    ) | AuthoredLevelsRatingCountRequirement(
        extrapolate_ratings=True, min_levels=2, min_rating=2
    )

    return [spec1, spec2]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "level_ratings, expected_tier",
    [
        ([1], -1),
        ([2], 1),
        ([1, 1], -1),
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
    specs: list[AwardSpec],
    level_ratings: list[int],
    expected_tier: int,
) -> None:
    user = UserFactory()
    for position in level_ratings:
        rating_class = RatingClassFactory(position=position)
        LevelFactory(authors=[user], rating_class=rating_class)
    assert user.authored_levels.count() == len(level_ratings)

    actual_tier, _actual_spec = get_max_eligible_spec(user, specs)

    assert actual_tier == expected_tier
