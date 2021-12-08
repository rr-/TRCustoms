from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAdminUser,
    IsAuthenticated,
)
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import User
from trcustoms.serializers import UserPictureSerializer, UserSerializer


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
        "update": [IsAuthenticated & (IsAdminUser | IsEditingOwnUser)],
    }
    permission_classes = [IsAuthenticated]
    # pylint: enable=unsupported-binary-operation

    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.request.user)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["PATCH"],
        serializer_class=UserPictureSerializer,
        parser_classes=[MultiPartParser],
    )
    def picture(self, request, pk) -> Response:
        obj = self.get_object()
        serializer = self.serializer_class(
            obj, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
