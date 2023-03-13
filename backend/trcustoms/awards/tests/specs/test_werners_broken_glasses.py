import pytest

from trcustoms.awards.specs import WernersBrokenGlassesAwardSpec
from trcustoms.conftest import LevelFactory, ReviewFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = WernersBrokenGlassesAwardSpec()
    spec.required_position = 2
    spec.required_count = 2
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
    spec: WernersBrokenGlassesAwardSpec,
    review_positions: list[int],
    expected: bool,
) -> None:
    user = UserFactory()
    for position in review_positions:
        level = LevelFactory()
        for n in range(position - 1):
            ReviewFactory(level=level, author=UserFactory(username=f"john{n}"))
        ReviewFactory(level=level, author=user)
    assert spec.check_eligible(user, tier=None) is expected
