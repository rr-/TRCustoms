import pytest

from trcustoms.awards.specs import AwardSpec, werners_broken_glasses
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(werners_broken_glasses())[0]
    spec.requirement.max_position = 2
    spec.requirement.min_reviews = 2
    return spec


@pytest.mark.django_db
@pytest.mark.parametrize(
    "review_positions, expected",
    [
        pytest.param([2, 2], True, id="success"),
        pytest.param([2, 3], False, id="too late"),
        pytest.param([2], False, id="not enough reviews"),
    ],
)
def test_werners_broken_glasses_award_spec(
    spec: AwardSpec,
    review_positions: list[int],
    expected: bool,
) -> None:
    user = UserFactory()
    for position in review_positions:
        level = LevelFactory()
        for n in range(position - 1):
            ReviewFactory(level=level, author=UserFactory(username=f"john{n}"))
        ReviewFactory(level=level, author=user)
    assert spec.requirement(user) is expected
