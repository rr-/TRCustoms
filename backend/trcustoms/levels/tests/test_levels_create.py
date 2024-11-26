import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.engines.tests.factories import EngineFactory
from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.consts import LevelLinkType
from trcustoms.levels.models import Level
from trcustoms.levels.tests.factories import (
    DifficultyFactory,
    DurationFactory,
    LevelFactory,
)
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.tags.tests.factories import TagFactory
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.tests.factories import UploadedFileFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_level_creation_missing_fields(auth_api_client: APIClient) -> None:
    response = auth_api_client.post("/api/levels/", json={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "name": ["This field is required."],
        "description": ["This field is required."],
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
def test_level_creation_success(auth_api_client: APIClient) -> None:
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
    assert level.external_links.all()[0].link_type == LevelLinkType.SHOWCASE
    assert level.external_links.all()[1].url == "http://example.com"
    assert level.external_links.all()[1].position == 1
    assert level.external_links.all()[1].link_type == LevelLinkType.MAIN
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Level submitted"
    assert level.uploader == auth_api_client.user
    assert level.last_user_content_updated is None


@pytest.mark.django_db
def test_unapproved_level_creation_updates_authored_level_count() -> None:
    user = UserFactory()
    LevelFactory(authors=[user], is_approved=False)
    user.refresh_from_db()
    assert user.authored_level_count_approved == 0
    assert user.authored_level_count_all == 1


@pytest.mark.django_db
def test_level_creation_updates_reviewed_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=False)
    ReviewFactory(author=user, level=level)
    user.refresh_from_db()
    assert user.reviewed_level_count == 0


@pytest.mark.django_db
def test_level_creation_updates_rated_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=False)
    RatingFactory(author=user, level=level)
    user.refresh_from_db()
    assert user.rated_level_count == 0


@pytest.mark.django_db
def test_approved_level_creation_updates_authored_level_count() -> None:
    user = UserFactory()
    LevelFactory(authors=[user], is_approved=True)
    user.refresh_from_db()
    assert user.authored_level_count_approved == 1
    assert user.authored_level_count_all == 1


@pytest.mark.django_db
def test_approved_level_creation_updates_reviewed_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=True)
    ReviewFactory(author=user, level=level)
    user.refresh_from_db()
    assert user.reviewed_level_count == 1


@pytest.mark.django_db
def test_approved_level_creation_updates_rated_level_count() -> None:
    user = UserFactory()
    level = LevelFactory(is_approved=True)
    RatingFactory(author=user, level=level)
    user.refresh_from_db()
    assert user.rated_level_count == 1
