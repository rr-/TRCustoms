from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.models import Level, Snapshot
from trcustoms.models.user import UserPermission
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.serializers import (
    LevelDetailsSerializer,
    LevelDisapprovalSerializer,
    LevelListingSerializer,
)
from trcustoms.snapshots import make_snapshot
from trcustoms.utils import parse_bool, parse_ids


class LevelViewSet(
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
        "disapprove": [HasPermission(UserPermission.EDIT_LEVELS)],
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

    ordering_fields = [
        "name",
        "engine",
        "created",
        "download_count",
        "last_updated",
        "last_file__file__size",
    ]
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
        level.is_approved = True
        level.disapproval_reason = None
        level.save()
        make_snapshot(level, request=self.request)
        return Response({})

    @action(detail=True, methods=["post"])
    def disapprove(self, request, pk: int) -> Response:
        serializer = LevelDisapprovalSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        level = self.get_object()
        level.is_approved = False
        level.disapproval_reason = serializer.data["reason"]
        level.save()
        make_snapshot(level, request=self.request)
        return Response({})

    def perform_create(self, serializer: serializers.Serializer) -> None:
        super().perform_create(serializer)
        serializer.instance.refresh_from_db()
        make_snapshot(
            serializer.instance,
            request=self.request,
            change_type=Snapshot.ChangeType.CREATE,
        )

    def perform_update(self, serializer: serializers.Serializer) -> None:
        super().perform_update(serializer)
        serializer.instance.refresh_from_db()
        make_snapshot(serializer.instance, request=self.request)
