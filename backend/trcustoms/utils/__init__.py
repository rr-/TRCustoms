import re
from datetime import datetime
from pathlib import Path

from django.db import models
from django.http import FileResponse
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


def parse_int(source: str | None) -> int | None:
    if not source:
        return None
    try:
        return int(source)
    except ValueError:
        return None


def parse_ints(source: str | None) -> list[int]:
    if not source:
        return []
    try:
        return [int(item) for item in source.split(",")]
    except ValueError:
        return []


def parse_bool(source: str | None) -> bool | None:
    if not source:
        return None
    return source.lower() in ["1", "true", "y", "yes"]


def parse_date_range(
    source: str | None,
) -> tuple[datetime | None, datetime | None] | None:
    date_min: datetime | None = None
    date_max: datetime | None = None
    if source and (
        match := re.match(r"^(?P<year>\d{4})(?:-(?P<month>\d{1,2}))?$", source)
    ):
        year = int(match.group("year"))
        month = int(match.group("month")) if match.group("month") else None
        if month:
            date_min = datetime(year, month, 1)
            date_max = datetime(year + int(month // 12), (month % 12) + 1, 1)
        else:
            date_min = datetime(year, 1, 1)
            date_max = datetime(year + 1, 1, 1)
    if not date_min and not date_max:
        return None
    return (date_min, date_max)


def check_model_references(obj: models.Model):
    """Check whether a Django model is referenced by any other model."""
    # pylint: disable=protected-access
    # skip for new objects (i.e. those not yet saved to database)
    if not obj.pk:
        return False
    # reverse relation "fields" on the Reporter model are auto-created and
    # not concrete
    for reverse in [
        f for f in obj._meta.get_fields() if f.auto_created and not f.concrete
    ]:
        # in case the related name has been customized
        name = reverse.get_accessor_name()
        # one-to-one requires a special approach
        has_reverse_one_to_one = reverse.one_to_one and hasattr(obj, name)
        has_reverse_other = (
            not reverse.one_to_one and getattr(obj, name).count()
        )
        if has_reverse_one_to_one or has_reverse_other:
            return True
    return False
