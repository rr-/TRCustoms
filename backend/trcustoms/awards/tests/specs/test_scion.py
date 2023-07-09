import pytest

from trcustoms.awards.specs.scion import Requirement, ScionAwardSpec
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = ScionAwardSpec()
    spec.requirements = {
        1: Requirement(walkthroughs=1),
        2: Requirement(walkthroughs=2),
        3: Requirement(walkthroughs=3),
    }
    spec.descriptions = {
        tier: f"Tier {tier} description" for tier in spec.requirements.keys()
    }
    return spec


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
    spec: ScionAwardSpec,
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
    for tier in spec.supported_tiers:
        assert spec.check_eligible(user, tier) is (tier <= expected_tier)
