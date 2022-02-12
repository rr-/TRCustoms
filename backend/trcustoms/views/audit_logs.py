from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import AuditLog, Level
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers import AuditLogListingSerializer
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

        queryset = queryset.prefetch_related(
            "change_author", "reviewer", "object_type"
        )

        return queryset

    @action(detail=True, methods=["post"])
    def approve(self, request, pk: int) -> Response:
        audit_log = self.get_object()
        audit_log.is_reviewed = True
        audit_log.reviewer = self.request.user
        audit_log.save()
        return Response({})
