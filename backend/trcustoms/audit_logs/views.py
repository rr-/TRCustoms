from collections.abc import Iterable

from django.db.models import Q
from rest_framework import mixins, viewsets

from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.serializers import AuditLogListingSerializer
from trcustoms.mixins import PermissionsMixin
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_bool, parse_id


def split_terms(search: str) -> Iterable[str]:
    for term in search.split():
        if term:
            yield term


def filter_queryset_state(qs, state):
    model_name, text = state.split("_", maxsplit=1)
    qs = qs.filter(object_type__model=model_name, changes__icontains=text)
    return qs


def filter_queryset_search(qs, search: str | None):
    if not search:
        return qs
    for term in split_terms(search):
        if ":" in term:
            model_name, changes = term.split(":", maxsplit=1)
            q_obj = Q(pk=None)
            for change in changes.split(","):
                q_obj |= Q(changes__icontains=change)
            qs = qs.filter(object_type__model=model_name).filter(q_obj)
        else:
            qs = qs.filter(changes__icontains=term)
    return qs


def filter_queryset_user_search(qs, search: str | None):
    if not search:
        return qs
    for term in split_terms(search):
        qs = qs.filter(
            Q(change_author__username__icontains=term)
            | Q(change_author__first_name__icontains=term)
            | Q(change_author__last_name__icontains=term)
        )
    return qs


def filter_queryset_object_search(qs, search: str | None):
    if not search:
        return qs
    for term in split_terms(search):
        qs = qs.filter(
            Q(object_type__model__icontains=term)
            | Q(object_name__icontains=term)
            | Q(object_id=parse_id(term))
        )
    return qs


class AuditLogViewSet(
    PermissionsMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    serializer_class = AuditLogListingSerializer

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [HasPermission(UserPermission.REVIEW_AUDIT_LOGS)],
        "approve": [HasPermission(UserPermission.REVIEW_AUDIT_LOGS)],
    }

    def get_queryset(self):
        qs = AuditLog.objects.all()

        qs = filter_queryset_search(
            qs, self.request.query_params.get("search")
        )
        qs = filter_queryset_user_search(
            qs, self.request.query_params.get("user_search")
        )
        qs = filter_queryset_object_search(
            qs, self.request.query_params.get("object_search")
        )

        if (
            is_action_required := parse_bool(
                self.request.query_params.get("is_action_required")
            )
        ) is not None:
            qs = qs.filter(is_action_required=is_action_required)

        qs = qs.prefetch_related("change_author", "object_type")

        return qs
