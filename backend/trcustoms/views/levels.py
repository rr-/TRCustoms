from typing import Optional

from django.db.models import F, Value
from django.db.models.functions import Coalesce, Concat
from rest_framework import filters, mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import Level, LevelEngine, LevelGenre, LevelTag
from trcustoms.serializers import (
    LevelEngineSerializer,
    LevelGenreSerializer,
    LevelSerializer,
    LevelTagSerializer,
)


def _parse_ids(source: Optional[str]) -> list[int]:
    if not source:
        return []
    try:
        return [int(item) for item in source.split(",")]
    except ValueError:
        return []


class LevelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]

    queryset = (
        Level.objects.all()
        .annotate(
            author=Coalesce(
                "author_name",
                "author_user__username",
                Concat(
                    "author_user__first_name",
                    Value(" "),
                    "author_user__last_name",
                ),
            ),
            engine_name=F("engine__name"),
        )
        .distinct()
    )
    serializer_class = LevelSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ["name", "author", "engine", "created", "last_updated"]
    search_fields = ["name", "author_name", "author_user__username"]

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
