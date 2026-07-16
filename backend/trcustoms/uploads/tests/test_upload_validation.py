import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile


def png_bytes() -> bytes:
    img = Image.new(size=(64, 64), mode="RGB")
    with io.BytesIO() as handle:
        img.save(handle, format="PNG")
        return handle.getvalue()


@pytest.mark.django_db
def test_upload_rejects_spoofed_content_type(
    auth_api_client: APIClient,
) -> None:
    """A non-image payload declared as image/png must be rejected."""
    response = auth_api_client.post(
        "/api/uploads/",
        data={
            "upload_type": UploadType.USER_PICTURE,
            "content": SimpleUploadedFile(
                "evil.png",
                b"<script>alert(1)</script>",
                content_type="image/png",
            ),
        },
        format="multipart",
    )
    assert response.status_code == 400
    assert not UploadedFile.objects.exists()


@pytest.mark.django_db
def test_upload_normalizes_extension(auth_api_client: APIClient) -> None:
    """A real PNG named .html must be stored with a .png extension."""
    response = auth_api_client.post(
        "/api/uploads/",
        data={
            "upload_type": UploadType.USER_PICTURE,
            "content": SimpleUploadedFile(
                "evil.html", png_bytes(), content_type="image/png"
            ),
        },
        format="multipart",
    )
    assert response.status_code == 200
    uploaded = UploadedFile.objects.get()
    assert uploaded.content.name.endswith(".png")
