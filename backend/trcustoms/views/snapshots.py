from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import Level, Snapshot
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers import SnapshotListingSerializer
from trcustoms.utils import parse_bool, parse_id


class SnapshotViewSet(
    PermissionsMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    serializer_class = SnapshotListingSerializer

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "approve": [HasPermission(UserPermission.REVIEW_SNAPSHOTS)],
    }

    def get_queryset(self):
        queryset = Snapshot.objects.all()

        disable_paging = self.request.query_params.get("disable_paging")
        self.paginator.disable_paging = False

        if level := parse_id(self.request.query_params.get("level")):
            level = get_object_or_404(Level, id=level)
            queryset = Snapshot.objects.filter_for_model(level)
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
        snapshot = self.get_object()
        snapshot.is_reviewed = True
        snapshot.reviewer = self.request.user
        snapshot.save()
        return Response({})
