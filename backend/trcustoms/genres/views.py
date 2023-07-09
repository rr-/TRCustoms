from django.db.models import Count, OuterRef, Subquery
from rest_framework import generics
from rest_framework.permissions import AllowAny

from trcustoms.genres.models import Genre
from trcustoms.genres.serializers import GenreListingSerializer
from trcustoms.levels.models import Level


class GenreListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Genre.objects.with_counts()
    serializer_class = GenreListingSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]


class GenreDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Genre.objects.with_counts()
    serializer_class = GenreListingSerializer


class GenreStatsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GenreListingSerializer
    pagination_class = None

    def get_queryset(self):
        pk = self.kwargs["pk"]
        return (
            Genre.objects.exclude(pk=pk)
            .annotate(
                level_count=Subquery(
                    Level.objects.filter(genres__pk=pk)
                    .filter(
                        genres=OuterRef("pk"),
                    )
                    .values("genres")
                    .annotate(count=Count("*"))
                    .values("count")
                )
            )
            .exclude(level_count=None)
        )
