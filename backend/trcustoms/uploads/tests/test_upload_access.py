from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory, LevelFileFactory
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.tests.factories import UploadedFileFactory
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory


def scheduled_level_upload(**kwargs):
    upload = UploadedFileFactory(upload_type=UploadType.LEVEL_FILE, **kwargs)
    level = LevelFactory(
        release_date=timezone.localdate() + timedelta(days=1),
        authors=[UserFactory(username="author")],
    )
    LevelFileFactory(level=level, file=upload)
    return upload


def get_upload(api_client: APIClient, upload) -> int:
    return api_client.get(f"/api/uploads/{upload.pk}/").status_code


@pytest.mark.django_db
def test_hidden_level_uploads_are_not_found_for_others(
    get_auth_api_client,
) -> None:
    upload = scheduled_level_upload()

    assert get_upload(APIClient(), upload) == status.HTTP_404_NOT_FOUND
    viewer = get_auth_api_client(UserFactory(username="viewer"))
    assert get_upload(viewer, upload) == status.HTTP_404_NOT_FOUND
    resp = viewer.get(f"/api/uploads/{upload.pk}/file/")
    assert resp.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_hidden_level_uploads_are_available_to_authors(
    get_auth_api_client,
) -> None:
    upload = scheduled_level_upload()
    author = get_auth_api_client(User.objects.get(username="author"))

    assert get_upload(author, upload) == status.HTTP_200_OK


@pytest.mark.django_db
def test_hidden_level_uploads_are_available_to_uploader_and_staff(
    get_auth_api_client, staff_api_client: APIClient
) -> None:
    uploader = UserFactory(username="uploader")
    upload = scheduled_level_upload(uploader=uploader)

    assert get_upload(staff_api_client, upload) == status.HTTP_200_OK
    uploader_client = get_auth_api_client(uploader)
    assert get_upload(uploader_client, upload) == status.HTTP_200_OK


@pytest.mark.django_db
def test_public_level_uploads_and_images_stay_public() -> None:
    level_upload = UploadedFileFactory(upload_type=UploadType.LEVEL_FILE)
    LevelFileFactory(level=LevelFactory(), file=level_upload)
    cover = UploadedFileFactory(upload_type=UploadType.LEVEL_COVER)

    assert get_upload(APIClient(), level_upload) == status.HTTP_200_OK
    assert get_upload(APIClient(), cover) == status.HTTP_200_OK
