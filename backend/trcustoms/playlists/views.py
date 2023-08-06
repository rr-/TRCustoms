from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.playlists.models import PlaylistItem
from trcustoms.playlists.serializers import PlaylistItemSerializer
from trcustoms.users.models import UserPermission


class PlaylistItemViewSet(
    PermissionsMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = PlaylistItem.objects.all().prefetch_related("level", "user")
    search_fields = ["level__name"]
    ordering_fields = ["level__name", "status", "created", "last_updated"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
        "by_level_id": [AllowAny],
        "create": [
            HasPermission(UserPermission.EDIT_PLAYLISTS)
            | IsAccessingOwnResource
        ],
        "destroy": [
            HasPermission(UserPermission.EDIT_PLAYLISTS)
            | IsAccessingOwnResource
        ],
        "update": [
            HasPermission(UserPermission.EDIT_PLAYLISTS)
            | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_PLAYLISTS)
            | IsAccessingOwnResource
        ],
    }

    serializer_class = PlaylistItemSerializer

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return self.queryset.filter(user_id=user_id)

    def get_serializer_context(self) -> dict:
        return {
            **super().get_serializer_context(),
            "user_id": self.kwargs["user_id"],
        }

    @action(detail=False)
    def by_level_id(self, request, user_id: int, level_id: str):
        item = get_object_or_404(
            self.queryset, user_id=user_id, level_id=level_id
        )
        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
