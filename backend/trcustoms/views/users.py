"""User views."""

from rest_framework import generics, viewsets
from rest_framework.permissions import (
    AllowAny,
    DjangoModelPermissionsOrAnonReadOnly,
    IsAuthenticated,
)

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import User
from trcustoms.serializers import UserSerializer


class UserProfileView(generics.RetrieveAPIView):
    """View currently authenticated user's profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> User:
        """Return currently authenticated user."""
        return self.request.user


class UserViewSet(PermissionsMixin, viewsets.ModelViewSet):
    """Main user CRUD view set."""

    permission_classes_by_action = {
        "create": [AllowAny],
    }
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]

    queryset = User.objects.all()
    serializer_class = UserSerializer
