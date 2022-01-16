from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import LevelTag
from trcustoms.serializers import LevelTagFullSerializer


class LevelTagViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelTag.objects.with_counts()
    serializer_class = LevelTagFullSerializer
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]
