from django.db.models import Count, OuterRef, Subquery
from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.models import Level, LevelTag, Snapshot
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers import (
    LevelTagDetailsSerializer,
    LevelTagListingSerializer,
)
from trcustoms.snapshots import make_snapshot


class LevelTagViewSet(
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
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
        "stats": [AllowAny],
        "destroy": [HasPermission(UserPermission.EDIT_TAGS)],
    }

    serializer_class = LevelTagListingSerializer
    serializer_class_by_action = {
        "create": LevelTagDetailsSerializer,
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

    def perform_create(self, serializer: serializers.Serializer) -> None:
        super().perform_create(serializer)
        serializer.instance.refresh_from_db()
        make_snapshot(
            serializer.instance,
            request=self.request,
            change_type=Snapshot.ChangeType.CREATE,
        )

    def perform_update(self, serializer: serializers.Serializer) -> None:
        super().perform_update(serializer)
        serializer.instance.refresh_from_db()
        make_snapshot(serializer.instance, request=self.request)

    def perform_destroy(self, instance) -> None:
        make_snapshot(
            instance,
            request=self.request,
            change_type=Snapshot.ChangeType.DELETE,
        )
        super().perform_destroy(instance)
