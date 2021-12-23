import re
import uuid
from collections.abc import Iterable
from pathlib import Path
from typing import Any

from django.db import models
from django.http import FileResponse
from django.utils.deconstruct import deconstructible
from rest_framework import status


def slugify(text: str) -> str:
    return re.sub(r"[^\w\d]", "", text)


class UnboundedRange:
    def __init__(self, start: int) -> None:
        self.start = start
        self.current = start

    def __next__(self) -> int:
        yield self.current
        self.current += 1

    def __contains__(self, other: Any) -> int:
        return isinstance(other, int) and other >= self.start


def unbounded_range(start: int) -> Iterable[int]:
    return UnboundedRange(start)


def id_range(source: str) -> Iterable[Iterable[int]]:
    """Take a string and convert it to a list of iterable ranges.

    Example:

    1,2:    [[1], [2]]
    1..100: [range(1, 101)]
    ..200:  [range(1, 201)]
    200..:  [range(200, infinity)]
    """
    items = re.sub(r"\s+", "", source).split(",")
    for item in items:
        if match := re.fullmatch(r"(\d+)", item):
            yield [int(match.group(1))]
        elif match := re.fullmatch(r"(\d+)\.\.\.?(\d+)", item):
            yield range(int(match.group(1)), int(match.group(2)) + 1)
        elif match := re.fullmatch(r"\.\.\.?(\d+)", item):
            yield range(1, int(match.group(1)) + 1)
        elif match := re.fullmatch(r"(\d+)\.\.\.?", item):
            yield unbounded_range(int(match.group(1)))
        else:
            raise ValueError(f"Bad range: {item}")


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


def parse_ids(source: str | None) -> list[int]:
    if not source:
        return []
    try:
        return [int(item) for item in source.split(",")]
    except ValueError:
        return []
