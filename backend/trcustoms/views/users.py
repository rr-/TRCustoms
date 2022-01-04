from django.http import Http404
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAdminUser,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import User
from trcustoms.serializers import UserSerializer
from trcustoms.utils import stream_file_field


class IsEditingOwnUser(BasePermission):
    def has_permission(self, request, view):
        try:
            return view.get_object() == request.user
        except AssertionError:
            return False


class UserViewSet(
    PermissionsMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    # pylint: disable=unsupported-binary-operation
    permission_classes_by_action = {
        "create": [AllowAny],
        "by_username": [AllowAny],
        "update": [IsAuthenticated & (IsAdminUser | IsEditingOwnUser)],
        "picture": [IsAuthenticatedOrReadOnly],
    }
    permission_classes = [IsAuthenticated]
    # pylint: enable=unsupported-binary-operation
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = [
        "username",
        "first_name",
        "last_name",
        "date_joined",
        "last_login",
        "authored_level_count",
    ]
    search_fields = [
        "username",
        "first_name",
        "last_name",
    ]

    queryset = User.objects.with_counts()
    serializer_class = UserSerializer

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
