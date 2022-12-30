from pathlib import Path

import boto3
from botocore.config import Config
from django.conf import settings
from django.db import models
from django.db.models import F
from django.http import HttpResponseRedirect
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.levels.logic import approve_level, reject_level
from trcustoms.levels.models import Level, LevelFile
from trcustoms.levels.serializers import (
    LevelDetailsSerializer,
    LevelListingSerializer,
    LevelRejectionSerializer,
)
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
from trcustoms.utils import (
    parse_bool,
    parse_int,
    parse_ints,
    slugify,
    stream_file_field,
)


class LevelViewSet(
    AuditLogModelWatcherMixin,
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
    audit_log_review_create = True

    queryset = Level.objects.prefetch_related(
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
    ).distinct()

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
        "^genres__name",
        "^tags__name",
        "=engine__name",
    ]

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()

        if sort_style := self.request.query_params.get("sort"):
            match sort_style:
                case (
                    "name"
                    | "-name"
                    | "created"
                    | "-created"
                    | "last_updated"
                    | "-last_updated"
                    | "review_count"
                    | "-review_count"
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

        if pks := parse_ints(self.request.query_params.get("authors")):
            for pk in pks:
                queryset = queryset.filter(authors__pk=pk)

        if pks := parse_ints(self.request.query_params.get("tags")):
            for pk in pks:
                queryset = queryset.filter(tags__pk=pk)

        if pks := parse_ints(self.request.query_params.get("genres")):
            for pk in pks:
                queryset = queryset.filter(genres__pk=pk)

        if pks := parse_ints(self.request.query_params.get("engines")):
            queryset = queryset.filter(engine__pk__in=pks)

        if pks := parse_ints(self.request.query_params.get("difficulties")):
            queryset = queryset.filter(difficulty__pk__in=pks)

        if (
            is_approved := parse_bool(
                self.request.query_params.get("is_approved")
            )
        ) is not None:
            queryset = queryset.filter(is_approved=is_approved)

        if (
            reviews_max := parse_int(
                self.request.query_params.get("reviews_max")
            )
        ) is not None:
            queryset = queryset.filter(review_count__lte=reviews_max)

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

        client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            config=Config(
                s3={"addressing_style": "path"},
                signature_version="s3v4",
                retries=dict(max_attempts=3),
            ),
        )

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
