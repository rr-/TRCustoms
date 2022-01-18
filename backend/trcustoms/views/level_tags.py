from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.models import LevelTag
from trcustoms.permissions import AllowNone
from trcustoms.serializers import (
    LevelTagDetailsSerializer,
    LevelTagListingSerializer,
)


class LevelTagViewSet(
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LevelTag.objects.with_counts()
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "create": [IsAuthenticated],
        "list": [AllowAny],
        "retrieve": [IsAuthenticated],
    }

    serializer_class = LevelTagListingSerializer
    serializer_class_by_action = {
        "create": LevelTagDetailsSerializer,
    }
