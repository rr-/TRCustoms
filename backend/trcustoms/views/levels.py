from typing import Optional

from django.db.models import F, OuterRef, Subquery
from django.shortcuts import get_object_or_404
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import (
    Level,
    LevelEngine,
    LevelFile,
    LevelGenre,
    LevelImage,
    LevelTag,
)
from trcustoms.serializers import (
    LevelEngineSerializer,
    LevelGenreSerializer,
    LevelSerializer,
    LevelTagSerializer,
)
from trcustoms.utils import stream_file_field


def _parse_ids(source: Optional[str]) -> list[int]:
    if not source:
        return []
    try:
        return [int(item) for item in source.split(",")]
    except ValueError:
        return []


def get_level_queryset():
    last_file_size = Subquery(
        LevelFile.objects.filter(
            level_id=OuterRef("id"),
        )
        .order_by("-version")
        .values("size")[:1]
    )

    last_file_created = Subquery(
        LevelFile.objects.filter(
            level_id=OuterRef("id"),
        )
        .order_by("-version")
        .values("created")[:1]
    )

    last_file_id = Subquery(
        LevelFile.objects.filter(
            level_id=OuterRef("id"),
        )
        .order_by("-version")
        .values("id")[:1]
    )

    return (
        Level.objects.all()
        .annotate(
            engine_name=F("engine__name"),
            last_file_id=last_file_id,
            last_file_created=last_file_created,
            last_file_size=last_file_size,
        )
        .distinct()
    )


class LevelViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    permission_classes = [AllowAny]
    queryset = get_level_queryset()
    serializer_class = LevelSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = [
        "name",
        "engine",
        "created",
        "last_updated",
        "last_file_size",
    ]
    search_fields = ["name", "authors__name", "authors__user__username"]

    def get_queryset(self):
        queryset = self.queryset
        if tag_ids := _parse_ids(self.request.query_params.get("tags")):
            for tag_id in tag_ids:
                queryset = queryset.filter(tags__id=tag_id)
        if genre_ids := _parse_ids(self.request.query_params.get("genres")):
            for genre_id in genre_ids:
                queryset = queryset.filter(genres__id=genre_id)
        if engine_ids := _parse_ids(self.request.query_params.get("engines")):
            queryset = queryset.filter(engines__id__in=engine_ids)
        return queryset

    @action(detail=True, url_path=r"images/(?P<image_id>\d+)")
    def screenshot(self, request, pk: int, image_id: int) -> Response:
        image = get_object_or_404(LevelImage, level_id=pk, pk=image_id)
        parts = [f"{pk}", image.level.name, f"screenshot{image_id}"]
        return stream_file_field(image.image, parts, as_attachment=False)


class LevelTagViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelTag.objects.all()
    serializer_class = LevelTagSerializer
    pagination_class = None


class LevelGenreViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelGenre.objects.all()
    serializer_class = LevelGenreSerializer
    pagination_class = None


class LevelEngineViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelEngine.objects.all()
    serializer_class = LevelEngineSerializer
    pagination_class = None


class LevelFileViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelFile.objects.all()
    pagination_class = None

    @action(detail=True)
    def download(self, request, pk: int) -> Response:
        file = get_object_or_404(LevelFile, pk=pk)
        parts = [f"{pk}", file.level.name]
        if file.version > 1:
            parts.append(f"V{file.version}")
        parts.extend(file.level.authors.values_list("name", flat=True))
        return stream_file_field(file.file, parts, as_attachment=True)
