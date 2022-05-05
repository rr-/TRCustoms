from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_bool, parse_ids
from trcustoms.walkthroughs.logic import (
    approve_walkthrough,
    reject_walkthrough,
)
from trcustoms.walkthroughs.models import Walkthrough
from trcustoms.walkthroughs.serializers import (
    WalkthroughDetailsSerializer,
    WalkthroughListingSerializer,
    WalkthroughRejectionSerializer,
)


class WalkthroughViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Walkthrough.objects.all().prefetch_related(
        "author", "author__picture", "level"
    )

    search_fields = [
        "walkthrough_type",
        "author__first_name",
        "author__last_name",
        "author__username",
        "level__name",
    ]

    ordering_fields = [
        "walkthrough_type",
        "author__username",
        "created",
        "last_updated",
        "level__name",
        "level_id",
        "trle_rating_atmosphere",
        "trle_rating_enemies",
        "trle_rating_gameplay",
        "trle_rating_lighting",
    ]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "retrieve": [AllowAny],
        "create": [HasPermission(UserPermission.POST_WALKTHROUGHS)],
        "update": [
            HasPermission(UserPermission.EDIT_WALKTHROUGHS)
            | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_WALKTHROUGHS)
            | IsAccessingOwnResource
        ],
        "destroy": [HasPermission(UserPermission.DELETE_WALKTHROUGHS)],
        "approve": [HasPermission(UserPermission.EDIT_WALKTHROUGHS)],
        "reject": [HasPermission(UserPermission.EDIT_WALKTHROUGHS)],
    }

    serializer_class = WalkthroughListingSerializer
    serializer_class_by_action = {
        "create": WalkthroughDetailsSerializer,
        "update": WalkthroughDetailsSerializer,
        "partial_update": WalkthroughDetailsSerializer,
    }

    audit_log_review_create = True

    def get_queryset(self):
        queryset = self.queryset

        disable_paging = self.request.query_params.get("disable_paging")
        self.paginator.disable_paging = False

        if walkthrough_type := self.request.query_params.get(
            "walkthrough_type"
        ):
            queryset = queryset.filter(walkthrough_type=walkthrough_type)

        if author_ids := parse_ids(self.request.query_params.get("authors")):
            for author_id in author_ids:
                queryset = queryset.filter(author_id=author_id)
            if disable_paging:
                self.paginator.disable_paging = True

        if level_ids := parse_ids(self.request.query_params.get("levels")):
            for level_id in level_ids:
                queryset = queryset.filter(level_id=level_id)
            if disable_paging:
                self.paginator.disable_paging = True

        if (
            is_approved := parse_bool(
                self.request.query_params.get("is_approved")
            )
        ) is not None:
            queryset = queryset.filter(is_approved=is_approved)

        return queryset

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=["post"])
    def approve(self, request, pk: int) -> Response:
        walkthrough = self.get_object()
        approve_walkthrough(walkthrough, request)
        return Response({})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk: int) -> Response:
        serializer = WalkthroughRejectionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        walkthrough = self.get_object()
        reason = serializer.data["reason"]
        reject_walkthrough(walkthrough, request, reason)
        return Response({})
