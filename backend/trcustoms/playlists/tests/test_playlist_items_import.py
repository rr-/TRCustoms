import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_playlist_item_import_requires_login(
    api_client: APIClient,
) -> None:
    user = UserFactory()
    ReviewFactory(author=user)
    resp = api_client.post(f"/api/users/{user.pk}/playlist/import/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert not PlaylistItem.objects.filter(user_id=user.pk).exists()


@pytest.mark.django_db
def test_playlist_item_import_rejects_non_owner(
    auth_api_client: APIClient,
) -> None:
    user = UserFactory(username="unique user")
    ReviewFactory(author=user)
    resp = auth_api_client.post(f"/api/users/{user.pk}/playlist/import/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert not PlaylistItem.objects.filter(user_id=user.pk).exists()


@pytest.mark.django_db
def test_playlist_item_import_accepts_owner(
    auth_api_client: APIClient,
) -> None:
    user = auth_api_client.user
    review = ReviewFactory(author=user)
    resp = auth_api_client.post(f"/api/users/{user.pk}/playlist/import/")
    playlist_item = PlaylistItem.objects.first()
    assert resp.status_code == status.HTTP_200_OK
    assert playlist_item
    assert playlist_item.user == user
    assert playlist_item.level.pk == review.level.pk
    assert playlist_item.status == PlaylistStatus.FINISHED
    assert playlist_item.created == review.created
    assert playlist_item.last_updated == review.created


@pytest.mark.django_db
def test_playlist_item_import_accepts_admin(
    staff_api_client: APIClient,
) -> None:
    user = UserFactory()
    ReviewFactory(author=user)
    resp = staff_api_client.post(f"/api/users/{user.pk}/playlist/import/")
    assert resp.status_code == status.HTTP_200_OK
    assert not PlaylistItem.objects.filter(pk=user.pk).exists()


@pytest.mark.django_db
def test_playlist_item_import_updates_played_level_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    ReviewFactory(author=user)
    old_played_level_count = user.played_level_count

    resp = superuser_api_client.post(f"/api/users/{user.pk}/playlist/import/")
    user.refresh_from_db()
    new_played_level_count = user.played_level_count

    assert resp.status_code == status.HTTP_200_OK
    assert old_played_level_count == 0
    assert new_played_level_count == 1
