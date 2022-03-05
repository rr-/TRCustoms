from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.models import News
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers.news import (
    NewsDetailsSerializer,
    NewsListingSerializer,
)


class NewsViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = News.objects.all()
    search_fields = ["subject", "text"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "retrieve": [AllowAny],
        "create": [HasPermission(UserPermission.EDIT_NEWS)],
        "update": [HasPermission(UserPermission.EDIT_NEWS)],
        "partial_update": [HasPermission(UserPermission.EDIT_NEWS)],
        "destroy": [HasPermission(UserPermission.EDIT_NEWS)],
    }

    serializer_class = NewsListingSerializer
    serializer_class_by_action = {
        "create": NewsDetailsSerializer,
        "update": NewsDetailsSerializer,
        "partial_update": NewsDetailsSerializer,
    }
