import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, override_settings

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.news.models import News
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.tests.factories import UserFactory


def create_uploaded_file(
    *, upload_type: str, filename: str = "preview.png"
) -> UploadedFile:
    return UploadedFile.objects.create(
        upload_type=upload_type,
        size=1,
        content=SimpleUploadedFile(filename, b"x", content_type="image/png"),
    )


@pytest.mark.django_db
@override_settings(HOST_SITE="https://trcustoms.org")
def test_level_social_preview_renders_metadata() -> None:
    author = UserFactory(username="raider")
    cover = create_uploaded_file(upload_type=UploadType.LEVEL_COVER)
    level = LevelFactory(name="Lost Temple", authors=[author], cover=cover)

    response = Client().get(
        f"/levels/{level.id}",
        HTTP_X_SOCIAL_PREVIEW="1",
    )

    assert response.status_code == 200
    content = response.content.decode()
    assert "<title>TRCustoms - Lost Temple</title>" in content
    assert "A custom Tomb Raider level by raider." in content
    assert (
        'property="og:url" content="https://trcustoms.org/levels/' in content
    )
    assert (
        'property="og:image" content="https://trcustoms.org/uploads/'
        in content
    )


@pytest.mark.django_db
@override_settings(HOST_SITE="https://trcustoms.org")
def test_nested_level_route_uses_level_page_metadata() -> None:
    author = UserFactory(username="raider_nested")
    level = LevelFactory(name="Deep Link", authors=[author])

    response = Client().get(
        f"/levels/{level.id}/reviews",
        HTTP_X_SOCIAL_PREVIEW="1",
    )

    assert response.status_code == 200
    content = response.content.decode()
    assert "<title>TRCustoms - Deep Link</title>" in content
    assert "A custom Tomb Raider level by raider_nested." in content
    assert (
        'property="og:url" content="https://trcustoms.org/levels/'
        f'{level.id}/reviews"' in content
    )


@pytest.mark.django_db
@override_settings(HOST_SITE="https://trcustoms.org")
def test_user_social_preview_uses_profile_metadata() -> None:
    picture = create_uploaded_file(
        upload_type=UploadType.USER_PICTURE,
        filename="avatar.png",
    )
    user = UserFactory(username="lara", picture=picture)

    response = Client().get(
        f"/users/{user.id}",
        HTTP_X_SOCIAL_PREVIEW="1",
    )

    assert response.status_code == 200
    content = response.content.decode()
    assert "<title>TRCustoms - lara</title>" in content
    assert "Check out lara&#x27;s profile page!" in content
    assert (
        'name="twitter:image" content="https://trcustoms.org/uploads/'
        in content
    )


@pytest.mark.django_db
@override_settings(HOST_SITE="https://trcustoms.org")
def test_news_social_preview_uses_news_copy() -> None:
    news = News.objects.create(
        subject="Site Update",
        text="We shipped a bunch of fixes for ratings and walkthroughs.",
    )

    response = Client().get(
        f"/news/{news.id}",
        HTTP_X_SOCIAL_PREVIEW="1",
    )

    assert response.status_code == 200
    content = response.content.decode()
    assert "<title>TRCustoms - Site Update</title>" in content
    assert "Read the latest news articles." in content


def test_social_preview_requires_header() -> None:
    response = Client().get("/")
    assert response.status_code == 404
