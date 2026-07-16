from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from django.db import models


@dataclass
class AuditLogModelInfo:
    model_cls: type[models.Model]
    name_getter: Callable[[models.Model], str] = field(
        default_factory=lambda: lambda entity: entity.name
    )
    meta_factory: Callable[[models.Model], Any] = field(
        default_factory=lambda: lambda entity: {}
    )
    # Frontend path for this object (e.g. "/levels/5"), given its id. None
    # for models with no public page.
    url_getter: Callable[[Any], str] | None = None


registry = []


def register_model(function=None, **register_kwargs):
    def actual_decorator(model_cls):
        registry.append(
            AuditLogModelInfo(
                model_cls=model_cls,
                **register_kwargs,
            )
        )

        return model_cls

    if function:
        return actual_decorator(function)

    return actual_decorator


def get_registered_model_info(obj: models.Model) -> AuditLogModelInfo:
    for info in registry:
        if isinstance(obj, info.model_cls):
            return info
    raise ValueError(f"Cannot make audit log of {obj}")


def get_registered_model_info_for_class(
    model_cls: type[models.Model] | None,
) -> AuditLogModelInfo | None:
    if model_cls is None:
        return None
    for info in registry:
        if issubclass(model_cls, info.model_cls):
            return info
    return None
