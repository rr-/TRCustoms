import io
import zipfile

import pytest
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient

from trcustoms.uploads.consts import MEGABYTE, UploadStatus, UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.tests.fake_s3 import FakeS3Client
from trcustoms.users.tests.factories import UserFactory


def png_bytes() -> bytes:
    img = Image.new(size=(64, 64), mode="RGB")
    with io.BytesIO() as handle:
        img.save(handle, format="PNG")
        return handle.getvalue()


def zip_bytes() -> bytes:
    with io.BytesIO() as handle:
        with zipfile.ZipFile(handle, "w") as archive:
            archive.writestr("level.tr4", b"level data")
        return handle.getvalue()


@pytest.fixture(name="fake_s3")
def fixture_fake_s3(monkeypatch: pytest.MonkeyPatch) -> FakeS3Client:
    client = FakeS3Client()
    monkeypatch.setattr(
        "trcustoms.uploads.presign.get_s3_client", lambda: client
    )
    return client


@pytest.fixture(name="use_bucket")
def fixture_use_bucket():
    with override_settings(
        USE_AWS_STORAGE=True,
        USE_PRESIGNED_UPLOADS=True,
        AWS_STORAGE_BUCKET_NAME="test-bucket",
    ):
        yield


def presign(
    api_client: APIClient, upload_type: str, content_type: str, size: int
):
    return api_client.post(
        "/api/uploads/presign/",
        data={
            "upload_type": upload_type,
            "content_type": content_type,
            "size": size,
        },
        format="json",
    )


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_presign_reserves_a_key(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    response = presign(
        auth_api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    )

    assert response.status_code == 200
    assert response.json()["method"] == "PUT"
    assert response.json()["headers"] == {"Content-Type": "application/zip"}

    uploaded = UploadedFile.objects.get()
    assert uploaded.status == UploadStatus.PENDING
    assert uploaded.pending_key.startswith("media/levels/")
    assert uploaded.pending_key.endswith(".zip")
    assert not uploaded.content


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_presign_normalizes_windows_zip_content_type(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """Browsers on Windows report zips as application/x-zip-compressed."""
    response = presign(
        auth_api_client,
        UploadType.LEVEL_FILE,
        "application/x-zip-compressed",
        1024,
    )

    assert response.status_code == 200
    assert UploadedFile.objects.get().pending_key.endswith(".zip")


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_presign_rejects_oversized_file(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """The limit is enforced before any bytes are transferred."""
    response = presign(
        auth_api_client, UploadType.USER_PICTURE, "image/png", 10 * MEGABYTE
    )

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_presign_rejects_disallowed_content_type(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    response = presign(
        auth_api_client, UploadType.USER_PICTURE, "text/html", 1024
    )

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_presign_requires_authentication(
    api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    response = presign(
        api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_presign_reports_unavailable_without_a_bucket(
    auth_api_client: APIClient,
) -> None:
    """Local filesystem deployments tell the client to post the file."""
    response = presign(
        auth_api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    )

    assert response.status_code == 409
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_accepts_a_matching_upload(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    content = zip_bytes()
    reserved = presign(
        auth_api_client,
        UploadType.LEVEL_FILE,
        "application/zip",
        len(content),
    ).json()
    key = UploadedFile.objects.get().pending_key
    fake_s3.objects[key] = content

    response = auth_api_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 200
    uploaded = UploadedFile.objects.get()
    assert uploaded.status == UploadStatus.COMPLETE
    assert uploaded.pending_key is None
    assert uploaded.content.name == key.removeprefix("media/")
    assert uploaded.size == len(content)
    assert response.json()["md5sum"] == uploaded.md5sum


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_rejects_content_that_does_not_match_declared_type(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """A key reserved as .png must not end up holding a script."""
    payload = b"<script>alert(1)</script>"
    reserved = presign(
        auth_api_client, UploadType.USER_PICTURE, "image/png", len(payload)
    ).json()
    key = UploadedFile.objects.get().pending_key
    fake_s3.objects[key] = payload

    response = auth_api_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()
    assert key not in fake_s3.objects


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_rejects_a_type_reserved_under_the_wrong_extension(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """A real PNG stored under a key reserved for a zip is still refused."""
    reserved = presign(
        auth_api_client, UploadType.ATTACHMENT, "application/zip", 1024
    ).json()
    key = UploadedFile.objects.get().pending_key
    fake_s3.objects[key] = png_bytes()

    response = auth_api_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()
    assert key not in fake_s3.objects


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_rejects_an_oversized_upload(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """The size is rechecked against the object actually stored."""
    reserved = presign(
        auth_api_client, UploadType.USER_PICTURE, "image/png", 1024
    ).json()
    key = UploadedFile.objects.get().pending_key
    fake_s3.objects[key] = png_bytes() + b"\0" * MEGABYTE

    response = auth_api_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_rejects_an_upload_that_never_arrived(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    reserved = presign(
        auth_api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    ).json()

    response = auth_api_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 400
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_is_not_repeatable(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    content = zip_bytes()
    reserved = presign(
        auth_api_client,
        UploadType.LEVEL_FILE,
        "application/zip",
        len(content),
    ).json()
    fake_s3.objects[UploadedFile.objects.get().pending_key] = content

    assert (
        auth_api_client.post(
            f"/api/uploads/{reserved['id']}/confirm/"
        ).status_code
        == 200
    )
    assert (
        auth_api_client.post(
            f"/api/uploads/{reserved['id']}/confirm/"
        ).status_code
        == 404
    )


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_confirm_rejects_another_users_upload(
    auth_api_client: APIClient,
    get_auth_api_client,
    fake_s3: FakeS3Client,
) -> None:
    content = zip_bytes()
    reserved = presign(
        auth_api_client,
        UploadType.LEVEL_FILE,
        "application/zip",
        len(content),
    ).json()
    fake_s3.objects[UploadedFile.objects.get().pending_key] = content

    other_client = get_auth_api_client(
        UserFactory(username="jane_doe", email="jane@example.com")
    )
    response = other_client.post(f"/api/uploads/{reserved['id']}/confirm/")

    assert response.status_code == 404
    assert UploadedFile.objects.get().status == UploadStatus.PENDING


@pytest.mark.django_db
@pytest.mark.usefixtures("use_bucket")
def test_pending_upload_is_not_retrievable(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """A reservation has no content yet, so it must not be served."""
    reserved = presign(
        auth_api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    ).json()

    response = auth_api_client.get(f"/api/uploads/{reserved['id']}/")

    assert response.status_code == 404


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=True, USE_PRESIGNED_UPLOADS=False)
def test_presign_can_be_turned_off(
    auth_api_client: APIClient, fake_s3: FakeS3Client
) -> None:
    """The kill switch sends clients back to posting the file."""
    response = presign(
        auth_api_client, UploadType.LEVEL_FILE, "application/zip", 1024
    )

    assert response.status_code == 409
    assert not UploadedFile.objects.exists()
