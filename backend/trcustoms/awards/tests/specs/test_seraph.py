from datetime import datetime

import pytest

from trcustoms.awards.specs import AwardSpec, seraph
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    return list(seraph())[0]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "is_active, is_banned, date_joined, expected",
    [
        pytest.param(True, False, datetime(2022, 4, 2), True, id="succes"),
        pytest.param(True, False, datetime(2022, 3, 31), False, id="too old"),
        pytest.param(True, False, datetime(2023, 4, 2), False, id="too young"),
        pytest.param(False, False, datetime(2022, 4, 2), False, id="inactive"),
        pytest.param(True, True, datetime(2022, 4, 2), False, id="banned"),
    ],
)
def test_seraph_award_spec(
    spec: AwardSpec,
    is_active: bool,
    is_banned: bool,
    date_joined: datetime,
    expected: bool,
) -> None:
    user = UserFactory(is_active=is_active, is_banned=is_banned)
    user.date_joined = date_joined
    assert spec.requirement(user) is expected
