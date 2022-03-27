from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models import F
from django.http import HttpResponseRedirect
from rest_framework import mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_deletion,
)
from trcustoms.levels.logic import approve_level, reject_level
from trcustoms.levels.models import Level, LevelFile
from trcustoms.levels.serializers import (
    LevelDetailsSerializer,
    LevelListingSerializer,
    LevelRejectionSerializer,
)
from trcustoms.mixins import (
    AuditLogModelWatcherUpdateMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_bool, parse_ids, slugify, stream_file_field


class LevelViewSet(
    AuditLogModelWatcherUpdateMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
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
        "destroy": [HasPermission(UserPermission.DELETE_LEVELS)],
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
        approve_level(level, request)
        return Response({})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk: int) -> Response:
        serializer = LevelRejectionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        level = self.get_object()
        reason = serializer.data["reason"]
        reject_level(level, request, reason)
        return Response({})

    def perform_create(self, serializer: serializers.Serializer) -> None:
        super().perform_create(serializer)
        track_model_creation(
            serializer.instance, request=self.request, is_action_required=True
        )

    def perform_destroy(self, instance) -> None:
        clear_audit_log_action_flags(obj=instance)
        track_model_deletion(instance, request=self.request)
        super().perform_destroy(instance)


class LevelFileViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelFile.objects.all()
    pagination_class = None
    download_count = models.IntegerField(default=0)

    @action(detail=True)
    def download(self, request, pk: int) -> Response:
        file = get_object_or_404(LevelFile, pk=pk)
        parts = [f"{pk}", file.level.name]
        if file.version > 1:
            parts.append(f"V{file.version}")
        parts.extend(file.level.authors.values_list("username", flat=True))

        file.download_count += 1
        file.save()

        if not settings.USE_AWS_STORAGE:
            return stream_file_field(
                file.file.content, parts, as_attachment=True
            )

        file_field = file.file.content

        path = Path(file_field.name)
        filename = "-".join(map(slugify, parts)) + path.suffix

        parameters = {
            "ResponseContentDisposition": (f"attachment; filename={filename}"),
        }

        # url = file_field.storage.url(file_field.name, parameters=parameters)

        client = file_field.storage.connection.meta.client
        url = client.generate_presigned_url(
            ClientMethod="get_object",
            ExpiresIn=60,
            Params={
                "Bucket": file_field.storage.bucket_name,
                "Key": file_field.storage._normalize_name(
                    file_field.storage._clean_name(file_field.name)
                ),
                **parameters,
            },
        )

        return HttpResponseRedirect(redirect_to=url)
