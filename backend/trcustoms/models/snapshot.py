import dataclasses
import enum
from dataclasses import dataclass
from json import JSONEncoder
from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.db import models

from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


class DiffType(enum.IntEnum):
    added = enum.auto()
    deleted = enum.auto()
    updated = enum.auto()


@dataclass
class DiffItem:
    diff_type: DiffType
    path: list[str]
    old: Any
    new: Any


class SnapshotJSONEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, DiffItem):
            return dataclasses.asdict(o)
        return o.__dict__


class SnapshotManager(models.Manager):
    def filter_for_model(self, model: models.Model) -> models.QuerySet:
        return self.filter(
            object_type=ContentType.objects.get_for_model(model),
            object_id=model.id,
        ).order_by("-created")


class Snapshot(DatesInfo):
    objects = SnapshotManager()

    ChangeType = models.TextChoices("ChangeType", "CREATE UPDATE DELETE")

    object_id = models.CharField(max_length=64)
    object_name = models.CharField(max_length=64)
    object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_desc = models.JSONField()
    diff = models.JSONField(encoder=SnapshotJSONEncoder)

    change_type = models.CharField(choices=ChangeType.choices, max_length=10)

    change_author = models.ForeignKey(
        User,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    is_reviewed = models.BooleanField(default=False)
    reviewer = models.ForeignKey(
        User,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    previous = models.ForeignKey(
        "Snapshot",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    def __str__(self) -> str:
        return (
            f"{self.change_type.title()} of "
            f"{self.object_type.model.title()} #{self.object_id} "
            f"by {self.change_author.username}"
        )
