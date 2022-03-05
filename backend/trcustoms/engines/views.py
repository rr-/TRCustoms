from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.engines.models import Engine
from trcustoms.engines.serializers import EngineListingSerializer


class EngineViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = Engine.objects.with_counts()
    serializer_class = EngineListingSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]
