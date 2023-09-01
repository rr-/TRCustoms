from unittest.mock import patch

import pytest

from trcustoms.awards.logic import update_awards
from trcustoms.awards.specs import AwardSpec
from trcustoms.awards.tests.factories import UserAwardFactory
from trcustoms.users.tests.factories import UserFactory


class TestAwardSpec(AwardSpec):
    code = "test-award"

    def __init__(self, grant: bool, **kwargs) -> None:
        super().__init__(
            code=self.code,
            title="Test Award",
            description="Test Award description",
            requirement=lambda user: grant,
            **kwargs,
        )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "all_award_specs, existing_awards, expected_awards",
    [
        pytest.param(
            [TestAwardSpec(tier=-1, grant=True)],
            [],
            [],
            id="not granting an one-shot award",
        ),
        pytest.param(
            [TestAwardSpec(tier=0, grant=True)],
            [],
            [(TestAwardSpec.code, 0)],
            id="granting an one-shot award if it doesn't exist",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, grant=True),
                TestAwardSpec(tier=2, grant=False),
            ],
            [],
            [(TestAwardSpec.code, 1)],
            id="granting an updatable award if it doesn't exist",
        ),
        pytest.param(
            [TestAwardSpec(tier=0, grant=True)],
            [(TestAwardSpec.code, 1)],
            [(TestAwardSpec.code, 1)],
            id="updating existing tier to a new tier",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, grant=True),
                TestAwardSpec(tier=2, grant=False),
            ],
            [(TestAwardSpec.code, 1)],
            [(TestAwardSpec.code, 1)],
            id="ignoring the same existing tier",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, grant=False),
                TestAwardSpec(tier=2, grant=True),
            ],
            [(TestAwardSpec.code, 1)],
            [(TestAwardSpec.code, 2)],
            id="ignoring the same higher tier",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=2, grant=True),
                TestAwardSpec(tier=1, grant=True),
            ],
            [(TestAwardSpec.code, 1)],
            [(TestAwardSpec.code, 2)],
            id="choosing maximum tier",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, can_be_removed=True, grant=False),
                TestAwardSpec(tier=2, can_be_removed=True, grant=False),
            ],
            [(TestAwardSpec.code, 1)],
            [],
            id="revoking an updatable award",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, grant=True),
                TestAwardSpec(tier=2, grant=False),
            ],
            [(TestAwardSpec.code, 1)],
            [(TestAwardSpec.code, 1)],
            id="skipping revoking an updatable award",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=1, can_be_removed=True, grant=True),
                TestAwardSpec(tier=2, can_be_removed=True, grant=False),
            ],
            [(TestAwardSpec.code, 2)],
            [(TestAwardSpec.code, 1)],
            id="downgrading an updatable award",
        ),
        pytest.param(
            [
                TestAwardSpec(tier=0, can_be_removed=True, grant=False),
            ],
            [(TestAwardSpec.code, 0)],
            [],
            id="revoking an one-shot award",
        ),
    ],
)
def test_update_awards_skips_existing_higher_tier(
    all_award_specs: list[AwardSpec],
    existing_awards: list[tuple[str, int]],
    expected_awards: list[tuple[str, int]],
) -> None:
    user = UserFactory()
    for existing_award_code, existing_award_tier in existing_awards:
        UserAwardFactory(code=existing_award_code, tier=existing_award_tier)

    with patch("trcustoms.awards.logic.ALL_AWARD_SPECS", all_award_specs):
        update_awards(user=user, update_rarity=False)

    assert list(user.awards.values_list("code", "tier")) == expected_awards
