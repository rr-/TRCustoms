from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import LevelEngine
from trcustoms.serializers import LevelEngineListingSerializer


class LevelEngineViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelEngine.objects.with_counts()
    serializer_class = LevelEngineListingSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]
