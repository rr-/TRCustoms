from datetime import timedelta
from urllib.parse import parse_qsl

import pytest
from django.conf import settings
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.downloads import sign_level_file_download
from trcustoms.levels.tests.factories import LevelFactory, LevelFileFactory
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.uploads.tests.factories import UploadedFileFactory
from trcustoms.users.tests.factories import UserFactory


def get_level_ids(api_client: APIClient) -> list[int]:
    resp = api_client.get("/api/levels/", data={"disable_paging": "1"})
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return [item["id"] for item in resp.json()["results"]]


def tomorrow():
    return timezone.localdate() + timedelta(days=1)


@pytest.mark.django_db
def test_scheduled_level_hidden_from_anonymous_list(
    api_client: APIClient,
) -> None:
    LevelFactory(release_date=tomorrow())
    released = LevelFactory(release_date=timezone.localdate())

    assert get_level_ids(api_client) == [released.pk]


@pytest.mark.django_db
def test_scheduled_level_hidden_from_other_users(
    get_auth_api_client,
) -> None:
    level = LevelFactory(release_date=tomorrow())
    api_client = get_auth_api_client(UserFactory(username="viewer"))

    assert get_level_ids(api_client) == []
    resp = api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_scheduled_level_visible_to_author(get_auth_api_client) -> None:
    author = UserFactory(username="author")
    level = LevelFactory(release_date=tomorrow(), authors=[author])
    api_client = get_auth_api_client(author)

    assert get_level_ids(api_client) == [level.pk]
    resp = api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_scheduled_level_visible_to_staff(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory(release_date=tomorrow())

    assert get_level_ids(staff_api_client) == [level.pk]
    resp = staff_api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_200_OK


def assert_not_found_page(response) -> None:
    assert response.status_code == status.HTTP_302_FOUND
    assert response.url == settings.HOST_SITE + "/404"


@pytest.fixture(name="scheduled_file")
def fixture_scheduled_file(tmp_path):
    content = tmp_path / "level.zip"
    content.write_text("level")
    author = UserFactory(username="author")
    level = LevelFactory(release_date=tomorrow(), authors=[author])
    return LevelFileFactory(
        level=level, file=UploadedFileFactory(content=str(content))
    )


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
def test_scheduled_level_files_cannot_be_downloaded_by_others(
    scheduled_file, get_auth_api_client
) -> None:
    url = f"/api/level_files/{scheduled_file.pk}/download/"

    assert_not_found_page(APIClient().get(url))
    viewer = get_auth_api_client(UserFactory(username="viewer"))
    assert_not_found_page(viewer.get(url))
    assert_not_found_page(viewer.get(url, {"token": "1:forged:token"}))
    scheduled_file.refresh_from_db()
    assert scheduled_file.download_count == 0


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
def test_scheduled_level_files_can_be_downloaded_by_author(
    scheduled_file, get_auth_api_client
) -> None:
    url = f"/api/level_files/{scheduled_file.pk}/download/"
    author = get_auth_api_client(scheduled_file.level.authors.get())

    assert author.get(url).status_code == status.HTTP_200_OK


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
def test_scheduled_level_files_can_be_downloaded_by_staff(
    scheduled_file, staff_api_client: APIClient
) -> None:
    url = f"/api/level_files/{scheduled_file.pk}/download/"

    assert staff_api_client.get(url).status_code == status.HTTP_200_OK


@pytest.mark.django_db
@pytest.mark.parametrize(
    "path", ["/api/reviews/", "/api/ratings/", "/api/walkthroughs/"]
)
def test_scheduled_level_rejects_contributions_from_others(
    path: str, get_auth_api_client
) -> None:
    level = LevelFactory(release_date=tomorrow())
    api_client = get_auth_api_client(UserFactory(username="viewer"))

    resp = api_client.post(path, format="json", data={"level_id": level.pk})

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "level_id" in resp.json()


@pytest.mark.django_db
def test_scheduled_level_cannot_be_added_to_playlists(
    get_auth_api_client,
) -> None:
    level = LevelFactory(release_date=tomorrow())
    user = UserFactory(username="viewer")
    api_client = get_auth_api_client(user)

    resp = api_client.post(
        f"/api/users/{user.pk}/playlist/",
        format="json",
        data={"level_id": level.pk, "status": "not_yet_played"},
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "level_id" in resp.json()


@pytest.mark.django_db
def test_contributions_to_scheduled_levels_are_hidden(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory(release_date=tomorrow())
    ReviewFactory(level=level)
    RatingFactory(level=level)

    for path in ("/api/reviews/", "/api/ratings/"):
        assert APIClient().get(path).json()["results"] == []
        assert len(staff_api_client.get(path).json()["results"]) == 1


def browser_download(level_file_url: str):
    path, _, query = level_file_url.removeprefix(settings.HOST_SITE).partition(
        "?"
    )
    return APIClient().get(path + "/", dict(parse_qsl(query)))


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
def test_moderators_get_signed_links_to_pending_level_files(
    tmp_path, staff_api_client: APIClient
) -> None:
    content = tmp_path / "level.zip"
    content.write_text("level")
    level = LevelFactory(is_approved=False)
    LevelFileFactory(
        level=level, file=UploadedFileFactory(content=str(content))
    )
    level.update_last_file()

    data = staff_api_client.get(f"/api/levels/{level.pk}/").json()

    assert "token=" in data["last_file"]["url"]
    assert browser_download(data["last_file"]["url"]).status_code == 200
    assert browser_download(data["files"][0]["url"]).status_code == 200


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
def test_signed_links_only_open_their_own_file(
    tmp_path, scheduled_file
) -> None:
    other_content = tmp_path / "other.zip"
    other_content.write_text("other")
    other = LevelFileFactory(
        level=LevelFactory(is_approved=False),
        file=UploadedFileFactory(content=str(other_content)),
    )
    token = sign_level_file_download(scheduled_file.pk)

    response = APIClient().get(
        f"/api/level_files/{other.pk}/download/", {"token": token}
    )

    assert_not_found_page(response)


@pytest.mark.django_db
def test_public_level_links_are_not_signed(tmp_path) -> None:
    content = tmp_path / "level.zip"
    content.write_text("level")
    level = LevelFactory()
    LevelFileFactory(
        level=level, file=UploadedFileFactory(content=str(content))
    )
    level.update_last_file()

    data = APIClient().get(f"/api/levels/{level.pk}/").json()

    assert "token" not in data["last_file"]["url"]
