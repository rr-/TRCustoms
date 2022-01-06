from django.http import Http404
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import User
from trcustoms.models.user import UserPermission
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.serializers import UserSerializer
from trcustoms.utils import stream_file_field


class UserViewSet(
    PermissionsMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "create": [AllowAny],
        "retrieve": [IsAuthenticated],
        "list": [IsAuthenticated],
        "by_username": [AllowAny],
        "update": [
            HasPermission(UserPermission.EDIT_USERS) | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_USERS) | IsAccessingOwnResource
        ],
        "picture": [IsAuthenticatedOrReadOnly],
    }

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = [
        "username",
        "first_name",
        "last_name",
        "date_joined",
        "last_login",
        "authored_level_count",
        "reviewed_level_count",
    ]
    search_fields = [
        "username",
        "first_name",
        "last_name",
    ]

    queryset = User.objects.with_counts()
    serializer_class = UserSerializer

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, url_path=r"by_username/(?P<username>\w+)")
    def by_username(self, request, username: str):
        user = self.queryset.filter(username__iexact=username).first()
        if not user:
            raise Http404("No user found with this username.")
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        user = self.queryset.filter(id=self.request.user.id).first()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=True)
    def picture(self, request, pk) -> Response:
        user = self.get_object()
        return stream_file_field(
            user.picture.content, [user.username], as_attachment=False
        )
