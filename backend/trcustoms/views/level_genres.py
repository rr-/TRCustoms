from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import LevelGenre
from trcustoms.serializers import LevelGenreFullSerializer


class LevelGenreViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelGenre.objects.with_counts()
    serializer_class = LevelGenreFullSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]
