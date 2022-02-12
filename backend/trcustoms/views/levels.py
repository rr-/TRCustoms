from django.db.models import F
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_update,
)
from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.models import Level
from trcustoms.models.user import UserPermission
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.serializers import (
    LevelDetailsSerializer,
    LevelListingSerializer,
    LevelRejectionSerializer,
)
from trcustoms.utils import parse_bool, parse_ids


class LevelViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
        "create": [HasPermission(UserPermission.UPLOAD_LEVELS)],
        "update": [
            HasPermission(UserPermission.EDIT_LEVELS) | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_LEVELS) | IsAccessingOwnResource
        ],
        "approve": [HasPermission(UserPermission.EDIT_LEVELS)],
        "reject": [HasPermission(UserPermission.EDIT_LEVELS)],
    }

    queryset = (
        Level.objects.all()
        .prefetch_related(
            "engine",
            "authors",
            "genres",
            "tags",
            "duration",
            "difficulty",
            "last_file",
            "last_file__file",
            "screenshots",
            "screenshots__file",
            "external_links",
            "cover",
            "rating_class",
        )
        .distinct()
    )

    serializer_class = LevelListingSerializer
    serializer_class_by_action = {
        "retrieve": LevelDetailsSerializer,
        "update": LevelDetailsSerializer,
        "partial_update": LevelDetailsSerializer,
        "create": LevelDetailsSerializer,
    }

    ordering_fields = []
    search_fields = [
        "name",
        "authors__username",
        "authors__first_name",
        "authors__last_name",
    ]

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = self.queryset

        disable_paging = self.request.query_params.get("disable_paging")
        self.paginator.disable_paging = False

        if sort_style := self.request.query_params.get("sort"):
            match sort_style:
                case (
                    "name"
                    | "-name"
                    | "created"
                    | "-created"
                    | "download_count"
                    | "-download_count"
                ):
                    queryset = queryset.order_by(sort_style)
                case "engine":
                    queryset = queryset.order_by("engine__name")
                case "-engine":
                    queryset = queryset.order_by("-engine__name")
                case "rating":
                    queryset = queryset.order_by(
                        F("rating_class__position").asc(nulls_first=True)
                    )
                case "-rating":
                    queryset = queryset.order_by(
                        F("rating_class__position").desc(nulls_last=True)
                    )
                case "size":
                    queryset = queryset.order_by(
                        F("last_file__file__size").asc(nulls_first=True)
                    )
                case "-size":
                    queryset = queryset.order_by(
                        F("last_file__file__size").desc(nulls_last=True)
                    )

        if author_ids := parse_ids(self.request.query_params.get("authors")):
            for author_id in author_ids:
                queryset = queryset.filter(authors__id=author_id)
            if disable_paging:
                self.paginator.disable_paging = True

        if tag_ids := parse_ids(self.request.query_params.get("tags")):
            for tag_id in tag_ids:
                queryset = queryset.filter(tags__id=tag_id)

        if genre_ids := parse_ids(self.request.query_params.get("genres")):
            for genre_id in genre_ids:
                queryset = queryset.filter(genres__id=genre_id)

        if engine_ids := parse_ids(self.request.query_params.get("engines")):
            queryset = queryset.filter(engine__id__in=engine_ids)

        if (
            is_approved := parse_bool(
                self.request.query_params.get("is_approved")
            )
        ) is not None:
            queryset = queryset.filter(is_approved=is_approved)

        return queryset

    @action(detail=True, methods=["post"])
    def approve(self, request, pk: int) -> Response:
        level = self.get_object()
        with track_model_update(
            obj=level, request=request, changes=["Approved"]
        ):
            level.is_approved = True
            level.rejection_reason = None
            level.save()
        clear_audit_log_action_flags(obj=level)
        return Response({})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk: int) -> Response:
        serializer = LevelRejectionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        level = self.get_object()
        reason = serializer.data["reason"]
        with track_model_update(
            obj=level,
            request=request,
            changes=[f"Rejected (reason: {reason})"],
        ):
            level.is_approved = False
            level.rejection_reason = reason
            level.save()
        clear_audit_log_action_flags(obj=level)
        return Response({})

    def perform_create(self, serializer: serializers.Serializer) -> None:
        super().perform_create(serializer)
        track_model_creation(
            serializer.instance, request=self.request, is_action_required=True
        )
