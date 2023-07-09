import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, PlaylistItemFactory, UserFactory
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem


@pytest.mark.django_db
def test_playlist_item_update_requires_login(
    api_client: APIClient,
) -> None:
    user = UserFactory()
    playlist_item = PlaylistItemFactory()
    resp = api_client.patch(
        f"/api/users/{user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={},
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }


@pytest.mark.django_db
def test_playlist_item_update_rejects_edits_from_non_owner(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(
        user=UserFactory(username="unique user")
    )
    resp = auth_api_client.patch(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={},
    )
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_update_allows_edits_from_owner(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(user=auth_api_client.user)
    resp = auth_api_client.patch(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={},
    )
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert "id" in resp.json()
    assert PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_update_allows_edits_from_admin(
    admin_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(
        user=UserFactory(username="unique user")
    )
    resp = admin_api_client.patch(
        f"/api/users/{admin_api_client.user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={},
    )
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert "id" in resp.json()
    assert PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_update_rejects_invalid_text(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(user=auth_api_client.user)
    resp = auth_api_client.patch(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={
            "status": "nonsense",
        },
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"status": ['"nonsense" is not a valid choice.']}


@pytest.mark.django_db
def test_playlist_item_update_success(
    any_object, any_integer, any_datetime, auth_api_client: APIClient
) -> None:
    old_level = LevelFactory(authors=[UserFactory(username="example")])
    new_level = LevelFactory(authors=[UserFactory(username="example")])
    playlist_item = PlaylistItemFactory(
        user=auth_api_client.user,
        level=old_level,
        status=PlaylistStatus.NOT_YET_PLAYED,
    )

    resp = auth_api_client.patch(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.pk}/",
        format="json",
        data={
            "level_id": new_level.pk,
            "status": "playing",
        },
    )
    playlist_item = PlaylistItem.objects.first()

    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {
        "id": playlist_item.pk,
        "level": {
            "id": playlist_item.level.pk,
            "name": playlist_item.level.name,
            "cover": any_object(),
        },
        "user": {
            "id": playlist_item.user.pk,
            "username": playlist_item.user.username,
            "first_name": playlist_item.user.first_name,
            "last_name": playlist_item.user.last_name,
        },
        "status": playlist_item.status,
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
    }

    assert playlist_item
    assert playlist_item.level.pk == new_level.pk
    assert playlist_item.status == PlaylistStatus.PLAYING
