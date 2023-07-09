import pytest

from trcustoms.awards.specs import SanglyphAwardSpec
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = SanglyphAwardSpec()
    spec.required_levels = 2
    spec.required_reviews = 2
    spec.required_walkthroughs = 2
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
    spec: SanglyphAwardSpec,
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
    assert spec.check_eligible(user, tier=None) is expected
