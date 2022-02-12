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
