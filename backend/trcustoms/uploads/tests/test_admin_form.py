import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.forms import UploadedFileForm


def png_bytes() -> bytes:
    img = Image.new(size=(64, 64), mode="RGB")
    with io.BytesIO() as handle:
        img.save(handle, format="PNG")
        return handle.getvalue()


def make_form(payload: bytes, name: str, upload_type: str) -> UploadedFileForm:
    return UploadedFileForm(
        data={"upload_type": upload_type},
        files={
            "content": SimpleUploadedFile(
                name, payload, content_type="image/png"
            )
        },
    )


@pytest.mark.django_db
def test_admin_form_rejects_spoofed_content_type() -> None:
    form = make_form(
        b"<script>alert(1)</script>", "evil.png", UploadType.USER_PICTURE
    )

    assert not form.is_valid()
    assert "content" in form.errors


@pytest.mark.django_db
def test_admin_form_rejects_oversized_file() -> None:
    form = make_form(
        png_bytes() + b"\0" * 400 * 1024, "big.png", UploadType.USER_PICTURE
    )

    assert not form.is_valid()
    assert "content" in form.errors


@pytest.mark.django_db
def test_admin_form_normalizes_extension() -> None:
    form = make_form(png_bytes(), "evil.html", UploadType.USER_PICTURE)

    assert form.is_valid(), form.errors
    assert form.cleaned_data["content"].name.endswith(".png")
