import io
from hashlib import md5

import numpy as np
import PIL
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from trcustoms.tasks.convert_images import convert_image
from trcustoms.uploads.consts import MEGABYTE
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.tests.factories import UploadedFileFactory


def img_to_bytes(img: Image, fmt: str) -> bytes:
    with io.BytesIO() as handle:
        img.save(handle, format=fmt)
        return handle.getvalue()


@pytest.fixture(name="simple_jpeg")
def fixture_simple_jpeg() -> Image:
    img = Image.new(size=(200, 200), mode="RGB")
    return img_to_bytes(img, fmt="JPEG")


@pytest.fixture(name="simple_png")
def fixture_simple_png() -> Image:
    img = Image.new(size=(200, 200), mode="RGB")
    return img_to_bytes(img, fmt="PNG")


@pytest.fixture(name="complex_png")
def fixture_complex_png() -> Image:
    img = Image.fromarray(
        np.random.randint(0, 255, (640, 480, 3), dtype=np.dtype("uint8"))
    )
    return img_to_bytes(img, fmt="JPEG") + b"\x00" * MEGABYTE


@pytest.mark.django_db
def test_convert_non_image() -> None:
    uploaded_file = UploadedFileFactory(
        content=SimpleUploadedFile("text file.txt", b"not an image"),
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
    )

    with pytest.raises(PIL.UnidentifiedImageError):
        convert_image(uploaded_file.pk)


@pytest.mark.django_db
def test_small_files_do_not_get_converted(simple_jpeg: bytes) -> None:
    uploaded_file = UploadedFileFactory(
        content=SimpleUploadedFile("image.jpeg", simple_jpeg),
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
    )
    old_name = uploaded_file.content.name

    convert_image(uploaded_file.pk)

    uploaded_file.refresh_from_db()
    assert uploaded_file.content.name == old_name
    assert uploaded_file.size == len(simple_jpeg)
    assert uploaded_file.md5sum == md5(simple_jpeg).hexdigest()
    assert uploaded_file.content.read() == simple_jpeg


@pytest.mark.django_db
def test_big_files_get_converted(complex_png: bytes) -> None:
    uploaded_file = UploadedFileFactory(
        content=SimpleUploadedFile("image.png", complex_png),
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
    )
    old_name = uploaded_file.content.name
    assert uploaded_file.size > MEGABYTE

    convert_image(uploaded_file.pk)

    uploaded_file.refresh_from_db()
    assert uploaded_file.content.name != old_name
    assert uploaded_file.content.name != "dummy.jpg"
    assert uploaded_file.size != len(complex_png)
    assert uploaded_file.md5sum != md5(complex_png).hexdigest()
    assert uploaded_file.content.read() != complex_png
    assert uploaded_file.size < MEGABYTE


@pytest.mark.django_db
def test_png_files_always_get_converted(simple_png: bytes) -> None:
    uploaded_file = UploadedFileFactory(
        content=SimpleUploadedFile("image.png", simple_png),
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
    )
    old_name = uploaded_file.content.name

    convert_image(uploaded_file.pk)

    uploaded_file.refresh_from_db()
    assert uploaded_file.content.name != old_name
    assert uploaded_file.content.name.endswith(".jpg")
    assert uploaded_file.size != len(simple_png)
    assert uploaded_file.md5sum != md5(simple_png).hexdigest()
    assert uploaded_file.content.read() != simple_png
