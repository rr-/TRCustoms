import pytest

from trcustoms.awards.specs import AwardSpec, bestiary
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(bestiary())[0]
    spec.requirement.min_walkthroughs = 3
    return spec


@pytest.mark.django_db
def test_bestiary_award_spec_success(spec: AwardSpec) -> None:
    user = UserFactory()
    for _ in range(spec.requirement.min_walkthroughs):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_bestiary_award_spec_unapproved_walkthroughs(spec: AwardSpec) -> None:
    user = UserFactory()
    for _ in range(spec.requirement.min_walkthroughs - 1):
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
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_bestiary_award_spec_not_text_walkthroughs(spec: AwardSpec) -> None:
    user = UserFactory()
    for _ in range(spec.requirement.min_walkthroughs - 1):
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
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_bestiary_award_spec_not_enough_walkthroughs(spec: AwardSpec) -> None:
    user = UserFactory()
    for _ in range(spec.requirement.min_walkthroughs - 1):
        WalkthroughFactory(
            author=user,
            status=WalkthroughStatus.APPROVED,
            walkthrough_type=WalkthroughType.TEXT,
        )
    assert spec.requirement(user) is False
