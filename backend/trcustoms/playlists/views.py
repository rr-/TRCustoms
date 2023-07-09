from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

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
    ordering_fields = ["level__name", "created", "last_updated"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
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

    def get_serializer_context(self) -> dict:
        return {
            **super().get_serializer_context(),
            "user_id": self.kwargs["user_id"],
        }
