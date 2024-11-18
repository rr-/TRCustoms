from pathlib import Path

import boto3
from botocore.config import Config
from django.conf import settings
from django.db import models
from django.http import HttpResponseRedirect
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from storages.utils import clean_name

from trcustoms.common.serializers import EmptySerializer
from trcustoms.levels.filters import filter_levels_queryset
from trcustoms.levels.logic import (
    approve_level,
    get_category_ratings,
    reject_level,
)
from trcustoms.levels.models import Level, LevelFile
from trcustoms.levels.serializers import (
    LevelDetailsSerializer,
    LevelListingSerializer,
    LevelRatingStatsSerializer,
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
from trcustoms.ratings.consts import RatingType
from trcustoms.users.models import UserPermission
from trcustoms.utils import slugify, stream_file_field


@extend_schema_view(
    approve=extend_schema(
        request=EmptySerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    reject=extend_schema(
        request=LevelRejectionSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
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
        "rating_stats": [AllowAny],
    }
    audit_log_review_create = True

    queryset = Level.objects.prefetch_related(
        "engine",
        "authors",
        "authors__picture",
        "uploader",
        "uploader__picture",
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
        queryset = filter_levels_queryset(queryset, self.request.query_params)
        return queryset

    @action(detail=True, methods=["post"])
    def approve(self, request, pk: int) -> Response:
        level = self.get_object()
        approve_level(level, request)
        return Response({}, status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk: int) -> Response:
        serializer = LevelRejectionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        level = self.get_object()
        reason = serializer.data["reason"]
        reject_level(level, request, reason)
        return Response({})

    @action(detail=True, methods=["get"])
    def rating_stats(self, request, pk: int) -> Response:
        level = self.get_object()

        data = {
            "trc_rating_count": level.ratings.filter(
                rating_type=RatingType.TRC
            ).count(),
            "trle_rating_count": level.ratings.filter(
                rating_type=RatingType.TRLE
            ).count(),
            "categories": get_category_ratings(level),
        }

        serializer = LevelRatingStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


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
                    clean_name(file_field.name)
                ),
                **parameters,
            },
        )

        return HttpResponseRedirect(redirect_to=url)
