import pytest
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.engines.tests.factories import EngineFactory
from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.models import Level
from trcustoms.levels.tests.factories import (
    DifficultyFactory,
    DurationFactory,
    LevelFactory,
    LevelFileFactory,
    ScreenshotFactory,
)
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.tags.tests.factories import TagFactory
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.tests.factories import UploadedFileFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_level_partial_update_success(auth_api_client: APIClient) -> None:
    level = LevelFactory(
        authors=[auth_api_client.user],
        genres=[GenreFactory()],
    )
    for _ in range(3):
        ScreenshotFactory(level=level)

    response = auth_api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={},
    )

    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data

    out_level = Level.objects.get(id=data["id"])
    assert out_level.name == level.name
    assert out_level.description == level.description
    assert out_level.engine == level.engine
    assert out_level.duration == level.duration
    assert out_level.difficulty == level.difficulty
    assert list(out_level.genres.values_list("id", flat=True)) == list(
        level.genres.values_list("id", flat=True)
    )
    assert list(out_level.tags.values_list("id", flat=True)) == list(
        level.tags.values_list("id", flat=True)
    )
    assert list(out_level.authors.values_list("id", flat=True)) == list(
        level.authors.values_list("id", flat=True)
    )
    assert out_level.cover == level.cover
    assert list(
        out_level.screenshots.values_list("file__id", flat=True)
    ) == list(level.screenshots.values_list("file__id", flat=True))
    assert list(out_level.files.values_list("file__id", flat=True)) == list(
        level.files.values_list("file__id", flat=True)
    )
    assert out_level.last_file == level.last_file
    assert len(mail.outbox) == 0


@pytest.mark.django_db
def test_level_update_success(auth_api_client: APIClient) -> None:
    level = LevelFactory(authors=[auth_api_client.user])
    for _ in range(3):
        ScreenshotFactory(level=level)

    engine = EngineFactory()
    duration = DurationFactory()
    difficulty = DifficultyFactory()
    genre = GenreFactory()
    tag = TagFactory()
    user = UserFactory()
    cover = UploadedFileFactory(upload_type=UploadType.LEVEL_COVER)
    screenshots = [
        UploadedFileFactory(upload_type=UploadType.LEVEL_SCREENSHOT)
        for _ in range(3)
    ]
    file = UploadedFileFactory(upload_type=UploadType.LEVEL_FILE)

    response = auth_api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={
            "name": "Test level",
            "description": "Test description",
            "engine_id": engine.id,
            "duration_id": duration.id,
            "difficulty_id": difficulty.id,
            "genre_ids": [genre.id],
            "tag_ids": [tag.id],
            "author_ids": [user.id],
            "cover_id": cover.id,
            "screenshot_ids": [screenshot.id for screenshot in screenshots],
            "file_id": file.id,
        },
    )

    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data

    level = Level.objects.get(id=data["id"])
    assert level.name == "Test level"
    assert level.description == "Test description"
    assert level.engine == engine
    assert level.duration == duration
    assert level.difficulty == difficulty
    assert list(level.genres.values_list("id", flat=True)) == [genre.id]
    assert list(level.tags.values_list("id", flat=True)) == [tag.id]
    assert list(level.authors.values_list("id", flat=True)) == [user.id]
    assert level.cover == cover
    assert list(level.screenshots.values_list("file__id", flat=True)) == [
        screenshot.id for screenshot in screenshots
    ]
    assert list(level.files.values_list("file__id", flat=True)) == [file.id]
    assert level.last_file.file.id == file.id
    assert level.last_user_content_updated is None


@pytest.mark.django_db
def test_level_update_updates_authored_level_count(
    staff_api_client: APIClient,
) -> None:
    user1 = UserFactory(username="u1")
    user2 = UserFactory(username="u2")
    user3 = UserFactory(username="u3")
    level = LevelFactory(authors=[user1, user3], genres=[GenreFactory()])
    for _ in range(3):
        ScreenshotFactory(level=level)

    user1.refresh_from_db()
    user2.refresh_from_db()
    user3.refresh_from_db()
    assert user1.authored_level_count_approved == 1
    assert user2.authored_level_count_approved == 0
    assert user3.authored_level_count_approved == 1

    response = staff_api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={"author_ids": [user2.id, user3.id]},
    )

    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data

    user1.refresh_from_db()
    user2.refresh_from_db()
    user3.refresh_from_db()
    assert user1.authored_level_count_approved == 0
    assert user2.authored_level_count_approved == 1
    assert user3.authored_level_count_approved == 1


@pytest.mark.django_db
def test_level_update_keeps_uploader_user(staff_api_client: APIClient) -> None:
    user = UserFactory(username="uploader")
    level = LevelFactory(
        uploader=user, genres=[GenreFactory()], authors=[UserFactory()]
    )
    for _ in range(3):
        ScreenshotFactory(level=level)

    response = staff_api_client.patch(
        f"/api/levels/{level.id}/", format="json", data={"name": "new title"}
    )

    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data

    level.refresh_from_db()
    assert level.name == "new title"
    assert level.uploader == user
    assert level.uploader != staff_api_client.user


@pytest.mark.django_db
def test_approving_level_updates_authored_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(authors=[user], is_approved=False)
    level.is_approved = True
    level.save()
    user.refresh_from_db()
    assert user.authored_level_count_approved == 1


@pytest.mark.django_db
def test_approving_level_updates_reviewed_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=True)
    ReviewFactory(level=level, author=user)
    level.is_approved = True
    level.save()
    user.refresh_from_db()
    assert user.reviewed_level_count == 1


@pytest.mark.django_db
def test_approving_level_updates_rated_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=True)
    RatingFactory(level=level, author=user)
    level.is_approved = True
    level.save()
    user.refresh_from_db()
    assert user.rated_level_count == 1


@pytest.mark.django_db
@override_settings(MIN_SCREENSHOTS=0, MIN_GENRES=0, MIN_TAGS=0, MIN_AUTHORS=0)
def test_submitting_new_file_updates_last_user_content_updated_date(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[auth_api_client.user])
    prev_file = LevelFileFactory(level=level)

    file = UploadedFileFactory(upload_type=UploadType.LEVEL_FILE)

    response = auth_api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={
            "file_id": file.id,
        },
    )

    data = response.json()
    level.refresh_from_db()

    assert file != prev_file.file
    assert response.status_code == status.HTTP_200_OK, data
    assert level.files.count() == 2
    assert level.last_user_content_updated is not None
    assert level.last_user_content_updated == level.last_file.created
