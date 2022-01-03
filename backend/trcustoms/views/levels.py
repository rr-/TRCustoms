from django.shortcuts import get_list_or_404
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import MultiSerializerMixin
from trcustoms.models import Level, LevelMedium
from trcustoms.serializers import LevelFullSerializer, LevelLiteSerializer
from trcustoms.utils import parse_ids, stream_file_field


def get_level_queryset():
    return (
        Level.objects.all()
        .prefetch_related(
            "engine",
            "authors",
            "genres",
            "tags",
            "duration",
            "difficulty",
            "last_file",
        )
        .filter(is_approved=True)
        .distinct()
    )


class LevelViewSet(
    MultiSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [AllowAny]
    queryset = get_level_queryset()
    serializer_class = LevelLiteSerializer
    serializer_class_by_action = {
        "retrieve": LevelFullSerializer,
    }
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = [
        "name",
        "engine",
        "created",
        "download_count",
        "last_updated",
        "last_file__new_file__size",
    ]
    search_fields = [
        "name",
        "authors__username",
        "authors__first_name",
        "authors__last_name",
    ]

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

        return queryset

    @action(detail=True, url_path=r"images/(?P<position>\d+)")
    def screenshot(self, request, pk: int, position: int) -> Response:
        image = get_list_or_404(LevelMedium, level_id=pk, position=position)[0]
        parts = [f"{pk}", image.level.name, f"screenshot{position}"]
        return stream_file_field(
            image.file.content, parts, as_attachment=False
        )
