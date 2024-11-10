import pytest
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient

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


@pytest.mark.django_db
@override_settings(MIN_SCREENSHOTS=0, MIN_GENRES=0, MIN_TAGS=0, MIN_AUTHORS=0)
def test_dragon_statue_award_spec_revoking(
    specs: list[AwardSpec], staff_api_client: APIClient
) -> None:
    user = UserFactory()
    rating_class = RatingClassFactory(position=2)
    level = LevelFactory(authors=[user], rating_class=rating_class)

    assert user.authored_levels.count() == 1
    actual_tier, _actual_spec = get_max_eligible_spec(user, specs)
    assert actual_tier == 1

    response = staff_api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={
            "author_ids": [],
        },
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data

    actual_tier, _actual_spec = get_max_eligible_spec(user, specs)
    assert actual_tier == -1
