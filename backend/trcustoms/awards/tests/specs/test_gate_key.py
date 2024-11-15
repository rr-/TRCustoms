from unittest.mock import patch

import pytest
from rest_framework import status

from trcustoms.awards.specs import AwardSpec, gate_key
from trcustoms.levels.models import Level
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="create_playlist_item_via_api")
def fixture_create_playlist_item_via_api(get_auth_api_client):
    def factory(user: User, level: Level) -> dict:
        response = get_auth_api_client(user).post(
            f"/api/users/{user.pk}/playlist/",
            format="json",
            data={"level_id": level.pk, "status": "playing"},
        )
        assert (
            response.status_code == status.HTTP_201_CREATED
        ), response.content
        return response.json()

    return factory


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


@pytest.mark.django_db
def test_gate_key_award_spec_revoking(
    spec: AwardSpec, create_playlist_item_via_api, get_auth_api_client
) -> None:
    with patch("trcustoms.awards.logic.ALL_AWARD_SPECS", [spec]):
        author = UserFactory()
        level = LevelFactory(authors=[author])

        player1 = UserFactory(username="unique1")
        player2 = UserFactory(username="unique2")
        create_playlist_item_via_api(player1, level)
        playlist_item2 = create_playlist_item_via_api(player2, level)

        prev_award_count = author.awards.count()

        get_auth_api_client(player2).delete(
            f"/api/users/{player2.pk}/playlist/{playlist_item2['id']}/",
        )
        current_award_count = author.awards.count()

    assert prev_award_count == 1
    assert current_award_count == 0
