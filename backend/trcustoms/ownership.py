from collections.abc import Callable

from django.db import models

# Predicate answering "does this user own this object?". Registered per model
# so ownership rules live with each model instead of a central match statement.
OwnerCheck = Callable[[models.Model, models.Model], bool]

_registry: list[tuple[type[models.Model], OwnerCheck]] = []


def register_owner(is_owned_by: OwnerCheck):
    """Declare how to decide whether a user owns instances of a model."""

    def decorator(model_cls: type[models.Model]) -> type[models.Model]:
        _registry.append((model_cls, is_owned_by))
        return model_cls

    return decorator


def is_owner(obj: models.Model, user: models.Model) -> bool:
    """Return whether user owns obj, per the model's registered rule.

    Unregistered models are treated as owned by nobody (deny by default).
    """
    for model_cls, is_owned_by in _registry:
        if isinstance(obj, model_cls):
            return is_owned_by(obj, user)
    return False
