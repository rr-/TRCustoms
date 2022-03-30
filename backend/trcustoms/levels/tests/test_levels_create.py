import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import (
    DifficultyFactory,
    DurationFactory,
    EngineFactory,
    GenreFactory,
    LevelFactory,
    ReviewFactory,
    TagFactory,
    UploadedFileFactory,
    UserFactory,
)
from trcustoms.levels.models import Level, LevelExternalLink
from trcustoms.uploads.models import UploadedFile


@pytest.mark.django_db
def test_level_creation_missing_fields(auth_api_client: APIClient) -> None:
    response = auth_api_client.post("/api/levels/", json={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
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
    screenshots = [
        uploaded_file_factory(
            upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT
        )
        for _ in range(3)
    ]
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
            "screenshot_ids": [screenshot.id for screenshot in screenshots],
            "file_id": file.id,
            "external_links": [
                {
                    "link_type": "sh",
                    "url": "https://example.com",
                    "position": 0,
                },
                {
                    "link_type": "ma",
                    "url": "http://example.com",
                    "position": 1,
                },
            ],
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
        screenshot.id for screenshot in screenshots
    ]
    assert list(level.files.values_list("file__id", flat=True)) == [file.id]
    assert level.last_file.file.id == file.id
    assert level.external_links.count() == 2
    assert level.external_links.all()[0].url == "https://example.com"
    assert level.external_links.all()[0].position == 0
    assert (
        level.external_links.all()[0].link_type
        == LevelExternalLink.LinkType.SHOWCASE
    )
    assert level.external_links.all()[1].url == "http://example.com"
    assert level.external_links.all()[1].position == 1
    assert (
        level.external_links.all()[1].link_type
        == LevelExternalLink.LinkType.MAIN
    )
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Level submitted"


@pytest.mark.django_db
def test_level_creation_updates_authored_level_count(
    level_factory: LevelFactory,
    user_factory: UserFactory,
) -> None:
    user = user_factory()
    level_factory(authors=[user])
    assert user.authored_levels.count() == 1


@pytest.mark.django_db
def test_level_creation_updates_reviewed_level_count(
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    user_factory: UserFactory,
) -> None:
    user = user_factory()
    review = review_factory(author=user)
    level_factory(reviews=[review])
    assert user.reviewed_levels.count() == 1
