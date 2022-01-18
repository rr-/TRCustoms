import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.models import Level, UploadedFile
from trcustoms.tests.conftest import (
    DifficultyFactory,
    DurationFactory,
    EngineFactory,
    GenreFactory,
    LevelFactory,
    TagFactory,
    UploadedFileFactory,
    UserFactory,
)


@pytest.mark.django_db
def test_level_creation_missing_fields(auth_api_client: APIClient) -> None:
    response = auth_api_client.post("/api/levels/", json={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {
        "name": ["This field is required."],
        "engine_id": ["This field is required."],
        "duration_id": ["This field is required."],
        "difficulty_id": ["This field is required."],
        "genre_ids": ["This field is required."],
        "tag_ids": ["This field is required."],
        "author_ids": ["This field is required."],
        "cover_id": ["This field is required."],
        "screenshot_ids": ["This field is required."],
        "file_id": ["This field is required."],
    }


@pytest.mark.django_db
def test_level_creation_success(
    engine_factory: EngineFactory,
    duration_factory: DurationFactory,
    difficulty_factory: DifficultyFactory,
    genre_factory: GenreFactory,
    tag_factory: TagFactory,
    uploaded_file_factory: UploadedFileFactory,
    user_factory: UserFactory,
    auth_api_client: APIClient,
) -> None:
    engine = engine_factory()
    duration = duration_factory()
    difficulty = difficulty_factory()
    genre = genre_factory()
    tag = tag_factory()
    user = user_factory()
    cover = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_COVER
    )
    screenshot = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT
    )
    file = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_FILE
    )

    response = auth_api_client.post(
        "/api/levels/",
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
            "screenshot_ids": [screenshot.id],
            "file_id": file.id,
        },
    )

    data = response.json()
    assert response.status_code == status.HTTP_201_CREATED, data

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
        screenshot.id
    ]
    assert list(level.files.values_list("file__id", flat=True)) == [file.id]
    assert level.last_file.file.id == file.id


@pytest.mark.django_db
def test_level_partial_update_success(
    level_factory: LevelFactory,
    engine_factory: EngineFactory,
    duration_factory: DurationFactory,
    difficulty_factory: DifficultyFactory,
    genre_factory: GenreFactory,
    tag_factory: TagFactory,
    uploaded_file_factory: UploadedFileFactory,
    user_factory: UserFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory()

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
    uploaded_file_factory: UploadedFileFactory,
    user_factory: UserFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory()

    engine = engine_factory()
    duration = duration_factory()
    difficulty = difficulty_factory()
    genre = genre_factory()
    tag = tag_factory()
    user = user_factory()
    cover = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_COVER
    )
    screenshot = uploaded_file_factory(
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT
    )
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
            "screenshot_ids": [screenshot.id],
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
        screenshot.id
    ]
    assert list(level.files.values_list("file__id", flat=True)) == [file.id]
    assert level.last_file.file.id == file.id
