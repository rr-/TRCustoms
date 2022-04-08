import io

from django.core.files.base import ContentFile
from PIL import Image

from trcustoms.celery import app, logger
from trcustoms.uploads.consts import MEGABYTE
from trcustoms.uploads.models import UploadedFile

RECOMMENDED_SIZE = MEGABYTE
MAX_QUALITY = 95
MIN_QUALITY = 85


@app.task
def convert_image(file_id: int) -> None:
    uploaded_file = UploadedFile.objects.get(id=file_id)

    img = Image.open(uploaded_file.content)
    img = img.convert("RGB")

    is_png = uploaded_file.content.name.lower().endswith(".png")
    if uploaded_file.size <= RECOMMENDED_SIZE and not is_png:
        return

    logger.info(f"converting upload {file_id} to JPEG")
    quality = MAX_QUALITY
    while quality >= MIN_QUALITY:
        with io.BytesIO() as handle:
            img.save(handle, format="JPEG", quality=quality)
            jpeg_content = handle.getvalue()
        logger.info(f"  trying quality {quality}: {len(jpeg_content)} bytes")
        quality -= 1
        if len(jpeg_content) <= RECOMMENDED_SIZE:
            break

    uploaded_file.content = ContentFile(jpeg_content, name="dummy.jpg")
    uploaded_file.save()
