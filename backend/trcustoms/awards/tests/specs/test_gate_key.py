import pytest

from trcustoms.awards.specs import AwardSpec, gate_key
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(gate_key())[0]
    spec.requirement.min_players = 2
    return spec


@pytest.mark.django_db
def test_gate_key_award_spec_success(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    PlaylistItemFactory(user__username="unique1", level__authors=[user])
    PlaylistItemFactory(user__username="unique2", level__authors=[user])
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_gate_key_award_spec_success_unapproved_levels(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    PlaylistItemFactory(user__username="unique1", level__authors=[user])
    PlaylistItemFactory(
        user__username="unique2",
        level__authors=[user],
        level__is_approved=False,
    )
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_gate_key_award_spec_success_not_enough_players(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    PlaylistItemFactory(user__username="unique1", level__authors=[user])
    PlaylistItemFactory(user__username="unique1", level__authors=[user])
    assert spec.requirement(user) is False
