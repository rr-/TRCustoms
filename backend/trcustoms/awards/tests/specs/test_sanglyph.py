import pytest

from trcustoms.awards.specs import AwardSpec, sanglyph
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(sanglyph())[0]
    spec.requirement.lhs.lhs.min_levels = 2
    spec.requirement.lhs.rhs.min_reviews = 2
    spec.requirement.rhs.min_walkthroughs = 2
    return spec


@pytest.mark.django_db
@pytest.mark.parametrize(
    "levels, walkthroughs, reviews, unapproved_levels, "
    "unapproved_walkthroughs, expected",
    [
        pytest.param(2, 2, 2, 0, 0, True, id="success"),
        pytest.param(1, 2, 2, 0, 0, False, id="not enough levels"),
        pytest.param(2, 1, 2, 0, 0, False, id="not enough walkthroughs"),
        pytest.param(2, 2, 1, 0, 0, False, id="not enough reviews"),
        pytest.param(1, 2, 2, 1, 0, False, id="unapproved levels"),
        pytest.param(2, 1, 2, 0, 1, False, id="unapproved walkthroughs"),
    ],
)
def test_sanglyph_award_spec(
    spec: AwardSpec,
    levels: int,
    walkthroughs: int,
    reviews: int,
    unapproved_levels: int,
    unapproved_walkthroughs: int,
    expected: bool,
) -> None:
    user = UserFactory()
    for _ in range(levels):
        LevelFactory(authors=[user], is_approved=True)
    for _ in range(unapproved_levels):
        LevelFactory(authors=[user], is_approved=False)
    for _ in range(walkthroughs):
        WalkthroughFactory(author=user, status=WalkthroughStatus.APPROVED)
    for _ in range(unapproved_walkthroughs):
        WalkthroughFactory(
            author=user, status=WalkthroughStatus.PENDING_APPROVAL
        )
    for _ in range(reviews):
        ReviewFactory(author=user)
    assert spec.requirement(user) is expected
