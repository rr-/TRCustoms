import pytest

from trcustoms.awards.specs import AwardSpec, iris
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(iris())[0]
    spec.requirement.min_walkthroughs = 2
    return spec


@pytest.mark.django_db
@pytest.mark.parametrize(
    "walkthroughs, expected",
    [
        pytest.param(
            [
                (WalkthroughStatus.APPROVED, WalkthroughType.LINK),
                (WalkthroughStatus.APPROVED, WalkthroughType.LINK),
            ],
            True,
            id="success",
        ),
        pytest.param(
            [
                (WalkthroughStatus.APPROVED, WalkthroughType.LINK),
            ],
            False,
            id="not enough",
        ),
        pytest.param(
            [
                (WalkthroughStatus.APPROVED, WalkthroughType.LINK),
                (WalkthroughStatus.PENDING_APPROVAL, WalkthroughType.LINK),
            ],
            False,
            id="unapproved",
        ),
        pytest.param(
            [
                (WalkthroughStatus.APPROVED, WalkthroughType.LINK),
                (WalkthroughStatus.APPROVED, WalkthroughType.TEXT),
            ],
            False,
            id="unapproved",
        ),
    ],
)
def test_iris_award_spec_success(
    spec: AwardSpec,
    walkthroughs: list[tuple[WalkthroughStatus, WalkthroughType]],
    expected: bool,
) -> None:
    user = UserFactory()
    for status, walkthrough_type in walkthroughs:
        WalkthroughFactory(
            author=user,
            status=status,
            walkthrough_type=walkthrough_type,
        )
    assert spec.requirement(user) is expected
