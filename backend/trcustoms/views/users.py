from django.shortcuts import get_object_or_404
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
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
from trcustoms.serializers import UserPictureSerializer, UserSerializer
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
    ]
    search_fields = [
        "username",
        "first_name",
        "last_name",
    ]

    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, url_path=r"by_username/(?P<username>\w+)")
    def by_username(self, request, username: str):
        user = get_object_or_404(User, username=username)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.request.user)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["PATCH", "GET"],
        serializer_class=UserPictureSerializer,
        parser_classes=[MultiPartParser],
    )
    def picture(self, request, pk) -> Response:
        user = self.get_object()
        if request.method == "PATCH":
            serializer = self.serializer_class(
                user, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

        return stream_file_field(
            user.picture, [user.username], as_attachment=False
        )
