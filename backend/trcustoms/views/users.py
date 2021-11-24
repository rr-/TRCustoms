from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    DjangoModelPermissionsOrAnonReadOnly,
    IsAuthenticated,
)
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import User
from trcustoms.serializers import UserSerializer


class UserViewSet(PermissionsMixin, viewsets.ModelViewSet):
    permission_classes_by_action = {
        "create": [AllowAny],
    }
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]

    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        user = get_object_or_404(User, pk=request.user.id)
        serializer = self.get_serializer(user)
        return Response(serializer.data)
