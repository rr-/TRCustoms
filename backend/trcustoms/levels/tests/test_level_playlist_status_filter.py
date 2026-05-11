import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.reviews.tests.factories import ReviewFactory


def get_level_ids(api_client: APIClient, params: dict[str, str]) -> set[int]:
    resp = api_client.get(
        "/api/levels/",
        data={"disable_paging": "1", **params},
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    return {item["id"] for item in resp.json()["results"]}


@pytest.mark.django_db
def test_level_list_can_hide_finished_playlist_levels(
    auth_api_client: APIClient,
) -> None:
    finished_level = LevelFactory()
    visible_level = LevelFactory()
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=finished_level,
        status=PlaylistStatus.FINISHED,
    )

    level_ids = get_level_ids(auth_api_client, {"finished_levels": "hide"})

    assert finished_level.pk not in level_ids
    assert visible_level.pk in level_ids


@pytest.mark.django_db
def test_level_list_can_show_unrated_finished_playlist_levels(
    auth_api_client: APIClient,
) -> None:
    rated_finished_level = LevelFactory()
    unrated_finished_level = LevelFactory()
    non_playlist_level = LevelFactory()
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=rated_finished_level,
        status=PlaylistStatus.FINISHED,
    )
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=unrated_finished_level,
        status=PlaylistStatus.FINISHED,
    )
    RatingFactory(author=auth_api_client.user, level=rated_finished_level)

    level_ids = get_level_ids(
        auth_api_client,
        {"finished_levels": "unrated"},
    )

    assert rated_finished_level.pk not in level_ids
    assert unrated_finished_level.pk in level_ids
    assert non_playlist_level.pk not in level_ids


@pytest.mark.django_db
def test_level_list_can_show_unreviewed_finished_playlist_levels(
    auth_api_client: APIClient,
) -> None:
    reviewed_finished_level = LevelFactory()
    unreviewed_finished_level = LevelFactory()
    non_playlist_level = LevelFactory()
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=reviewed_finished_level,
        status=PlaylistStatus.FINISHED,
    )
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=unreviewed_finished_level,
        status=PlaylistStatus.FINISHED,
    )
    ReviewFactory(author=auth_api_client.user, level=reviewed_finished_level)

    level_ids = get_level_ids(
        auth_api_client, {"finished_levels": "unreviewed"}
    )

    assert reviewed_finished_level.pk not in level_ids
    assert unreviewed_finished_level.pk in level_ids
    assert non_playlist_level.pk not in level_ids


@pytest.mark.django_db
def test_level_list_can_hide_dropped_playlist_levels(
    auth_api_client: APIClient,
) -> None:
    dropped_level = LevelFactory()
    visible_level = LevelFactory()
    PlaylistItemFactory(
        user=auth_api_client.user,
        level=dropped_level,
        status=PlaylistStatus.DROPPED,
    )

    level_ids = get_level_ids(auth_api_client, {"dropped_levels": "hide"})

    assert dropped_level.pk not in level_ids
    assert visible_level.pk in level_ids
