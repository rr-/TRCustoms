import pytest

from trcustoms.awards.specs import AwardSpec, scion
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="specs")
def fixture_specs() -> None:
    specs = list(scion())
    specs[0].requirement.min_walkthroughs = 1
    specs[1].requirement.min_walkthroughs = 2
    specs[2].requirement.min_walkthroughs = 3
    return specs


@pytest.mark.django_db
@pytest.mark.parametrize(
    "approved_walkthroughs, unapproved_walkthroughs, expected_tier",
    [
        (0, 0, 0),
        (0, 1, 0),
        (1, 0, 1),
        (1, 1, 1),
        (2, 0, 2),
        (2, 1, 2),
        (3, 0, 3),
        (4, 0, 3),
    ],
)
def test_scion_award_spec(
    specs: list[AwardSpec],
    approved_walkthroughs: int,
    unapproved_walkthroughs: int,
    expected_tier: int | None,
) -> None:
    user = UserFactory()
    for _ in range(approved_walkthroughs):
        WalkthroughFactory(author=user, status=WalkthroughStatus.APPROVED)
    for _ in range(unapproved_walkthroughs):
        WalkthroughFactory(
            author=user, status=WalkthroughStatus.PENDING_APPROVAL
        )
    for spec in specs:
        assert spec.requirement(user) is (spec.tier <= expected_tier)
