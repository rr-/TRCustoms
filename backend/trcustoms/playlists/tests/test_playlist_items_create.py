import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_playlist_item_creation_requires_login(api_client: APIClient) -> None:
    user = UserFactory()
    resp = api_client.post(
        f"/api/users/{user.pk}/playlist/",
        format="json",
        data={},
    )

    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }


@pytest.mark.django_db
def test_playlist_item_creation_fails_on_missing_fields(
    auth_api_client: APIClient,
) -> None:
    resp = auth_api_client.post(
        f"/api/users/{auth_api_client.user.pk}/playlist/",
        format="json",
        data={},
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {
        "level_id": ["This field is required."],
        "status": ["This field is required."],
    }


@pytest.mark.django_db
def test_playlist_item_creation_rejects_duplicate_submissions(
    auth_api_client: APIClient,
) -> None:
    playlist_item = PlaylistItemFactory(
        user=auth_api_client.user,
    )

    resp = auth_api_client.post(
        f"/api/users/{auth_api_client.user.pk}/playlist/",
        format="json",
        data={
            "level_id": playlist_item.level.pk,
            "status": "on_hold",
        },
    )
    playlist_item_count = PlaylistItem.objects.all().count()

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {
        "level_id": ["This level already appears in this playlist."]
    }
    assert playlist_item_count == 1


@pytest.mark.django_db
def test_playlist_item_creation_rejects_invalid_status(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()

    resp = auth_api_client.post(
        f"/api/users/{auth_api_client.user.pk}/playlist/",
        format="json",
        data={
            "level_id": level.pk,
            "status": "nonsense",
        },
    )
    playlist_item_count = PlaylistItem.objects.all().count()

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"status": ['"nonsense" is not a valid choice.']}
    assert playlist_item_count == 0


@pytest.mark.django_db
def test_playlist_item_creation_rejects_alien_user(
    auth_api_client: APIClient,
) -> None:
    spoofed_user = UserFactory(username="spoofed")
    level = LevelFactory()

    resp = auth_api_client.post(
        f"/api/users/{spoofed_user.pk}/playlist/",
        format="json",
        data={
            "level_id": level.pk,
            "status": "on_hold",
        },
    )
    playlist_item_count = PlaylistItem.objects.all().count()

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {
        "detail": ["Cannot assign a different user to this playlist item."]
    }
    assert playlist_item_count == 0


@pytest.mark.django_db
def test_playlist_item_creation_accepts_alien_user_for_staff(
    staff_api_client: APIClient,
) -> None:
    spoofed_user = UserFactory(username="spoofed")
    level = LevelFactory()

    resp = staff_api_client.post(
        f"/api/users/{spoofed_user.pk}/playlist/",
        format="json",
        data={
            "level_id": level.pk,
            "status": "on_hold",
        },
    )
    playlist_item = PlaylistItem.objects.first()

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    assert "id" in resp.json()
    assert playlist_item
    assert playlist_item.user.pk == spoofed_user.pk


@pytest.mark.django_db
def test_playlist_item_creation_success(
    auth_api_client: APIClient,
    any_object,
    any_datetime,
    fake: Generic,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])

    resp = auth_api_client.post(
        f"/api/users/{auth_api_client.user.pk}/playlist/",
        format="json",
        data={
            "level_id": level.pk,
            "status": "on_hold",
        },
    )
    playlist_item = PlaylistItem.objects.first()

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
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
    assert playlist_item.user
    assert playlist_item.user.pk == auth_api_client.user.pk
    assert playlist_item.level.pk == level.pk
    assert playlist_item.status == PlaylistStatus.ON_HOLD


@pytest.mark.django_db
def test_playlist_item_creation_updates_played_level_count() -> None:
    user = UserFactory()
    PlaylistItemFactory(user=user, status=PlaylistStatus.FINISHED)
    user.refresh_from_db()
    assert user.played_level_count == 1
