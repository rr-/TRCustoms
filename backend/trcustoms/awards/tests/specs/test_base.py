import pytest

from trcustoms.awards.specs import ALL_AWARDS_CLASSES, BaseAwardSpec
from trcustoms.conftest import UserAwardFactory, UserFactory
from trcustoms.users.models import User


@pytest.mark.django_db
def test_grant_to_user_first_time() -> None:
    user = UserFactory()

    class TestAwardSpec(BaseAwardSpec):
        code = "code"
        title = "Title"
        descriptions = {1: "Description 1", 2: "Description 2"}
        position = 1

        def check_eligible(self, user: User, tier: int | None) -> bool:
            return None

    spec = TestAwardSpec()
    spec.grant_to_user(user, tier=2)

    award = user.awards.first()

    assert user.awards.all().count() == 1
    assert award.code == "code"
    assert award.title == "Title"
    assert award.description == "Description 2"
    assert award.position == 1
    assert award.tier == 2


@pytest.mark.django_db
def test_grant_to_user_already_exists() -> None:
    user = UserFactory()
    UserAwardFactory(
        user=user,
        code="code",
        title="Old title",
        description="Old description",
        tier=1,
    )

    class TestAwardSpec(BaseAwardSpec):
        code = "code"
        title = "New title"
        descriptions = {1: "New description 1", 2: "New description 2"}
        position = 1

        def check_eligible(self, user: User, tier: int | None) -> bool:
            return None

    spec = TestAwardSpec()
    spec.grant_to_user(user, tier=2)

    award = user.awards.first()

    assert user.awards.all().count() == 1
    assert award.code == "code"
    assert award.title == "New title"
    assert award.description == "New description 2"
    assert award.position == 1
    assert award.tier == 2


def test_award_position_continuity() -> None:
    spec_classes = ALL_AWARDS_CLASSES
    spec_positions = set(spec_cls.position for spec_cls in spec_classes)
    assert len(spec_classes) > 0
    assert len(spec_positions) == len(spec_classes)
    assert set(range(1, len(spec_classes) + 1)) == spec_positions
