from rest_framework import mixins, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import AuditLog, Level
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers.audit_logs import AuditLogListingSerializer
from trcustoms.utils import parse_bool, parse_id


class AuditLogViewSet(
    PermissionsMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    serializer_class = AuditLogListingSerializer

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "approve": [HasPermission(UserPermission.REVIEW_AUDIT_LOGS)],
    }
    search_fields = [
        "object_name",
        "change_author__username",
        "change_author__first_name",
        "change_author__last_name",
    ]

    def get_queryset(self):
        queryset = AuditLog.objects.all()

        disable_paging = self.request.query_params.get("disable_paging")
        self.paginator.disable_paging = False

        if level := parse_id(self.request.query_params.get("level")):
            level = get_object_or_404(Level, id=level)
            queryset = AuditLog.objects.filter_for_model(level)
            if disable_paging:
                self.paginator.disable_paging = True

        if (
            is_reviewed := parse_bool(
                self.request.query_params.get("is_reviewed")
            )
        ) is not None:
            queryset = queryset.filter(is_reviewed=is_reviewed)

        queryset = queryset.prefetch_related("change_author", "object_type")

        return queryset
