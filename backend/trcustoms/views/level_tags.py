from django.db.models import Count, OuterRef, Subquery
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.models import Level, LevelTag
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers import (
    LevelTagDetailsSerializer,
    LevelTagListingSerializer,
)


class LevelTagViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LevelTag.objects.with_counts()
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "retrieve": [IsAuthenticated],
        "stats": [AllowAny],
        "create": [IsAuthenticated],
        "update": [HasPermission(UserPermission.EDIT_TAGS)],
        "partial_update": [HasPermission(UserPermission.EDIT_TAGS)],
        "destroy": [HasPermission(UserPermission.EDIT_TAGS)],
    }

    serializer_class = LevelTagListingSerializer
    serializer_class_by_action = {
        "create": LevelTagDetailsSerializer,
        "update": LevelTagDetailsSerializer,
        "partial_update": LevelTagDetailsSerializer,
    }

    @action(detail=True)
    def stats(self, request, pk) -> Response:
        tags = (
            LevelTag.objects.exclude(id=pk)
            .annotate(
                level_count=Subquery(
                    Level.objects.filter(tags__id=pk)
                    .filter(
                        tags=OuterRef("id"),
                    )
                    .values("tags")
                    .annotate(count=Count("*"))
                    .values("count")
                )
            )
            .exclude(level_count=None)
        )

        return Response(
            LevelTagListingSerializer(instance=tags, many=True).data
        )
