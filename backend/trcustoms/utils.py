import re
import uuid
from pathlib import Path

from django.db import models
from django.http import FileResponse
from django.utils.deconstruct import deconstructible
from rest_framework import status


def slugify(text: str) -> str:
    return re.sub(r"[^\w\d]", "", text)


def stream_file_field(
    field: models.FileField, parts: list[str], as_attachment: bool
) -> FileResponse:
    if not field:
        return FileResponse(
            b"",
            as_attachment=False,
            filename="-".join(map(slugify, parts)) + ".dat",
            status=status.HTTP_404_NOT_FOUND,
        )

    path = Path(field.name)
    filename = "-".join(map(slugify, parts)) + path.suffix
    return FileResponse(
        field.open("rb"), as_attachment=as_attachment, filename=filename
    )


@deconstructible
class RandomFileName:
    def __init__(self, path: str) -> None:
        self.path = Path(path)

    def __call__(self, _, filename):
        extension = Path(filename).suffix
        return str(self.path / f"{uuid.uuid4()}{extension}")
