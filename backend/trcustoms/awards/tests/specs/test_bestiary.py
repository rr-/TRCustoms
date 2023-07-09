import pytest

from trcustoms.awards.specs import BestiaryAwardSpec
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = BestiaryAwardSpec()
    spec.required = 3
    return spec


@pytest.mark.django_db
def test_bestiary_award_spec_success(spec: BestiaryAwardSpec) -> None:
    user = UserFactory()
    for _ in range(spec.required):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    assert spec.check_eligible(user, tier=None) is True


@pytest.mark.django_db
def test_bestiary_award_spec_unapproved_walkthroughs(
    spec: BestiaryAwardSpec,
) -> None:
    user = UserFactory()
    for _ in range(spec.required - 1):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    WalkthroughFactory(
        author=user,
        status=WalkthroughStatus.APPROVED,
        walkthrough_type=WalkthroughType.LINK,
    )
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_bestiary_award_spec_not_text_walkthroughs(
    spec: BestiaryAwardSpec,
) -> None:
    user = UserFactory()
    for _ in range(spec.required - 1):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    WalkthroughFactory(
        author=user,
        status=WalkthroughStatus.PENDING_APPROVAL,
        walkthrough_type=WalkthroughType.TEXT,
    )
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_bestiary_award_spec_not_enough_walkthroughs(
    spec: BestiaryAwardSpec,
) -> None:
    user = UserFactory()
    for _ in range(spec.required - 1):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    assert spec.check_eligible(user, tier=None) is False
