from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.audit_logs.utils import track_model_creation
from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.models import User
from trcustoms.models.user import UserPermission
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.serializers import UserDetailsSerializer, UserListingSerializer


class UserViewSet(
    PermissionsMixin,
    MultiSerializerMixin,
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
    }

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
    serializer_class = UserListingSerializer
    serializer_class_by_action = {
        "retrieve": UserDetailsSerializer,
        "update": UserDetailsSerializer,
        "partial_update": UserDetailsSerializer,
        "create": UserDetailsSerializer,
        "by_username": UserDetailsSerializer,
        "me": UserDetailsSerializer,
    }

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, url_path=r"by_username/(?P<username>\w+)")
    def by_username(self, request, username: str):
        user = self.queryset.filter(username__iexact=username).first()
        if not user:
            raise Http404("No user found with this username.")
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        user = self.queryset.filter(id=self.request.user.id).first()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Allow acquiring inactive TRLE accounts for new users.
        kwarg_field: str = self.lookup_url_kwarg or self.lookup_field
        trle_user = User.objects.filter(
            username__iexact=request.data.get("username"),
            is_active=False,
            source=User.Source.trle,
        ).first()
        if trle_user:
            self.kwargs[kwarg_field] = trle_user.id
            response = self.update(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK:
                response.status_code = status.HTTP_201_CREATED
        else:
            response = super().create(request, *args, **kwargs)

        user = User.objects.filter(
            username__iexact=request.data.get("username")
        ).first()
        track_model_creation(user, request=request, change_author=user)
        return response
