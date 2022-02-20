from django.db.models import Count, OuterRef, Subquery
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import Level, LevelGenre
from trcustoms.serializers.level_genres import LevelGenreListingSerializer


class LevelGenreViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelGenre.objects.with_counts()
    serializer_class = LevelGenreListingSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]

    @action(detail=True)
    def stats(self, request, pk) -> Response:
        genres = (
            LevelGenre.objects.exclude(id=pk)
            .annotate(
                level_count=Subquery(
                    Level.objects.filter(genres__id=pk)
                    .filter(
                        genres=OuterRef("id"),
                    )
                    .values("genres")
                    .annotate(count=Count("*"))
                    .values("count")
                )
            )
            .exclude(level_count=None)
        )

        return Response(
            LevelGenreListingSerializer(instance=genres, many=True).data
        )
