import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_playlist_item_deletion_requires_login(
    api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory()
    resp = api_client.delete(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.id}/"
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_deletion_rejects_non_owner(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(user__username="unique user")
    resp = auth_api_client.delete(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.id}/"
    )
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_deletion_accepts_owner(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(user=auth_api_client.user)
    resp = auth_api_client.delete(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.id}/"
    )
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_deletion_accepts_admin(
    staff_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory()
    resp = staff_api_client.delete(
        f"/api/users/{playlist_item.user.pk}/playlist/{playlist_item.id}/"
    )
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not PlaylistItem.objects.filter(pk=playlist_item.pk).exists()


@pytest.mark.django_db
def test_playlist_item_deletion_updates_played_level_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    playlist_item = PlaylistItemFactory(
        user=user, status=PlaylistStatus.FINISHED
    )
    user.refresh_from_db()
    assert user.played_level_count == 1
    playlist_item.delete()
    user.refresh_from_db()
    assert user.played_level_count == 0
