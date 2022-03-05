from django.db.models import Count, OuterRef, Subquery
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.genres.models import Genre
from trcustoms.genres.serializers import GenreListingSerializer
from trcustoms.levels.models import Level


class GenreViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = Genre.objects.with_counts()
    serializer_class = GenreListingSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]

    @action(detail=True)
    def stats(self, request, pk) -> Response:
        genres = (
            Genre.objects.exclude(id=pk)
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
            GenreListingSerializer(instance=genres, many=True).data
        )
