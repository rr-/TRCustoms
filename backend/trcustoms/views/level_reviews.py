from rest_framework import filters, mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import LevelLegacyReview
from trcustoms.serializers import LevelLegacyReviewSerializer
from trcustoms.utils import parse_ids


class LevelReviewViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelLegacyReview.objects
    serializer_class = LevelLegacyReviewSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "name",
        "author__username",
        "author__first_name",
        "author__last_name",
        "level__name",
    ]
    ordering_fields = [
        "name",
        "author__username",
        "level_id",
        "rating_gameplay",
        "rating_enemies",
        "rating_atmosphere",
        "rating_lighting",
    ]

    def get_queryset(self):
        queryset = self.queryset

        disable_paging = self.request.query_params.get("disable_paging")
        self.paginator.disable_paging = False

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

        return queryset
