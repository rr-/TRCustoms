import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import (
    DifficultyFactory,
    DurationFactory,
    EngineFactory,
    GenreFactory,
    LevelFactory,
    ScreenshotFactory,
    TagFactory,
    UploadedFileFactory,
    UserFactory,
)
from trcustoms.levels.models import Level
from trcustoms.uploads.models import UploadedFile


@pytest.mark.django_db
def test_level_partial_update_success(
    level_factory: LevelFactory,
    engine_factory: EngineFactory,
    duration_factory: DurationFactory,
    difficulty_factory: DifficultyFactory,
    genre_factory: GenreFactory,
    tag_factory: TagFactory,
    screenshot_factory: ScreenshotFactory,
    uploaded_file_factory: UploadedFileFactory,
    user_factory: UserFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(
        authors=[auth_api_client.user],
        genres=[genre_factory()],
    )
    for _ in range(3):
        screenshot_factory(level=level)

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


@pytest.mark.django_db
def test_level_update_success(
    level_factory: LevelFactory,
    engine_factory: EngineFactory,
    duration_factory: DurationFactory,
    difficulty_factory: DifficultyFactory,
    genre_factory: GenreFactory,
    tag_factory: TagFactory,
    screenshot_factory: ScreenshotFactory,
    uploaded_file_factory: UploadedFileFactory,
    user_factory: UserFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[auth_api_client.user])
    for _ in range(3):
        screenshot_factory(level=level)

    engine = engine_factory()
    duration = duration_factory()
    difficulty = difficulty_factory()
    genre = genre_factory()
    tag = tag_factory()
    user = user_factory()
    cover = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_COVER
    )
    screenshots = [
        uploaded_file_factory(
            upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT
        )
        for _ in range(3)
    ]
    file = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_FILE
    )

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