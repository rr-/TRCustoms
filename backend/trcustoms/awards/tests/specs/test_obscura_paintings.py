import pytest

from trcustoms.awards.specs import AwardSpec, obscura_paintings
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(obscura_paintings())[0]
    spec.requirement.min_reviews = 2
    spec.requirement.min_position = 2
    spec.requirement.max_position = 3
    return spec


@pytest.mark.django_db
@pytest.mark.parametrize(
    "positions, expected_result",
    [
        ([], False),
        ([1], False),
        ([2], False),
        ([3], False),
        ([4], False),
        ([1, 1], False),
        ([1, 2], False),
        ([1, 3], False),
        ([2, 2], True),
        ([2, 3], True),
        ([2, 4], False),
        ([3, 3], True),
        ([3, 4], False),
        ([4, 4], False),
    ],
)
def test_obscura_painitings_award_spec(
    spec: AwardSpec,
    positions: list[int],
    expected_result: bool,
) -> None:
    user = UserFactory()

    for position in positions:
        level = LevelFactory()
        for n in range(position - 1):
            ReviewFactory(author=UserFactory(username=f"john{n}"), level=level)
        ReviewFactory(author=user, level=level)

    actual_result = spec.requirement(user)

    assert actual_result == expected_result
