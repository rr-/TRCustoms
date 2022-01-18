import functools
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.db import models
from rest_framework import serializers
from rest_framework.request import Request

from trcustoms.models.snapshot import DiffItem, DiffType, Snapshot


def transform_for_diff(obj: Any, ignore_fields: list[str]) -> Any:
    if isinstance(obj, list):
        return [
            transform_for_diff(item, ignore_fields=ignore_fields)
            for item in obj
        ]
    if isinstance(obj, dict):
        return {
            key: transform_for_diff(value, ignore_fields=ignore_fields)
            for key, value in obj.items()
            if key not in ignore_fields
        }
    return obj


def collect_diff_list(
    obj1: Any, obj2: Any, path: list[str] | None
) -> Iterable[DiffItem]:
    obj1t = [(item, transform_for_diff(item, ["position"])) for item in obj1]
    obj2t = [(item, transform_for_diff(item, ["position"])) for item in obj2]

    # find deleted or updated items
    for idx, (item1, item1t) in enumerate(obj1t):
        if item1 not in obj2:
            for item2, item2t in obj2t:
                if item1t == item2t:
                    yield from collect_diff_object(
                        item1,
                        item2,
                        path=(path or []) + [str(idx)],
                    )
                    break
            else:
                yield DiffItem(
                    diff_type=DiffType.deleted,
                    path=(path or []) + [str(idx)],
                    old=item1,
                    new=None,
                )

    # find added items
    for idx, (item2, item2t) in enumerate(obj2t):
        if item2 not in obj1:
            for item1, item1t in obj1t:
                if item1t == item2t:
                    # handled in the first loop above
                    break
            else:
                yield DiffItem(
                    diff_type=DiffType.added,
                    path=(path or []) + [str(idx)],
                    old=None,
                    new=item2,
                )


def collect_diff_dict(
    obj1: Any, obj2: Any, path: list[str] | None
) -> Iterable[DiffItem]:
    for key, value in obj1.items():
        if key not in obj2:
            yield DiffItem(
                diff_type=DiffType.deleted,
                path=(path or []) + [key],
                old=value,
                new=None,
            )
    for key, value in obj2.items():
        if key not in obj1:
            yield DiffItem(
                diff_type=DiffType.added,
                path=(path or []) + [key],
                old=None,
                new=value,
            )
    for key in obj1.keys() & obj2.keys():
        yield from collect_diff_object(
            obj1[key],
            obj2[key],
            path=(path or []) + [key],
        )


def collect_diff_object(
    obj1: Any, obj2: Any, path: list[str] | None
) -> Iterable[DiffItem]:
    if isinstance(obj1, list) and isinstance(obj2, list):
        yield from collect_diff_list(obj1, obj2, path=path)

    elif isinstance(obj1, dict) and isinstance(obj2, dict):
        yield from collect_diff_dict(obj1, obj2, path=path)

    elif isinstance(obj1, str) and isinstance(obj2, str):
        if obj1.replace("\r\n", "\n") != obj2.replace("\r\n", "\n"):
            yield DiffItem(
                diff_type=DiffType.updated, path=path, old=obj1, new=obj2
            )

    elif obj1 != obj2:
        yield DiffItem(
            diff_type=DiffType.updated, path=path, old=obj1, new=obj2
        )


def collect_diff(
    obj1: Any,
    obj2: Any,
    ignore_fields: list[str],
) -> Iterable[DiffItem]:
    obj1 = transform_for_diff(obj1, ignore_fields=ignore_fields)
    obj2 = transform_for_diff(obj2, ignore_fields=ignore_fields)
    yield from collect_diff_object(obj1, obj2, None)


@dataclass
class SnapshotRegistryEntry:
    model: type[models.Model]
    serializer_cls: type[serializers.ModelSerializer]
    name_getter: Callable[[models.Model], str] = field(
        default_factory=lambda: lambda entity: entity.name
    )
    ignore_fields: list[str] = field(
        default_factory=lambda: ["created", "last_updated"]
    )


registry = []


def register(function=None, **register_kwargs):
    def actual_decorator(serializer_cls):
        registry.append(
            SnapshotRegistryEntry(
                model=serializer_cls.Meta.model,
                serializer_cls=serializer_cls,
                **register_kwargs,
            )
        )

        @functools.wraps(serializer_cls)
        def wrapper(*args, **kwargs):
            return serializer_cls(*args, **kwargs)

        return wrapper

    if function:
        return actual_decorator(function)
    return actual_decorator


def get_registry_entry(obj: models.Model) -> SnapshotRegistryEntry:
    for entry in registry:
        if isinstance(obj, entry.model):
            return entry
    raise ValueError(f"Cannot make snapshot of {obj}")


def make_snapshot(
    obj: models.Model,
    request: Request,
    change_type: Snapshot.ChangeType = Snapshot.ChangeType.UPDATE,
) -> None:
    entry = get_registry_entry(obj)

    serializer = entry.serializer_cls(instance=obj)
    object_id = obj.pk
    object_name = entry.name_getter(obj)
    object_type = ContentType.objects.get_for_model(obj)
    object_desc = serializer.data

    last_snapshot = (
        Snapshot.objects.filter(object_id=object_id, object_type=object_type)
        .order_by("-created")
        .first()
    )

    diff = list(
        collect_diff(
            last_snapshot.object_desc if last_snapshot else None,
            object_desc,
            ignore_fields=entry.ignore_fields,
        )
    )

    if change_type != Snapshot.ChangeType.DELETE and not diff:
        return last_snapshot

    snapshot = Snapshot.objects.create(
        object_id=object_id,
        object_name=object_name,
        object_type=object_type,
        object_desc=object_desc,
        change_type=change_type,
        change_author=request.user,
        is_reviewed=False,
        reviewer=None,
        previous=last_snapshot,
        diff=diff,
    )

    return snapshot
