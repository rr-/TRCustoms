from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_deletion,
    track_model_update,
)
from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.models import User
from trcustoms.models.user import UserPermission
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.serializers import (
    UserBanSerializer,
    UserDetailsSerializer,
    UserListingSerializer,
)


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
        "activate": [HasPermission(UserPermission.EDIT_USERS)],
        "deactivate": [HasPermission(UserPermission.EDIT_USERS)],
        "ban": [HasPermission(UserPermission.EDIT_USERS)],
        "unban": [HasPermission(UserPermission.EDIT_USERS)],
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
        track_model_creation(
            user,
            request=request,
            change_author=user,
            is_action_required=True,
        )
        return response

    @action(detail=True, methods=["post"])
    def activate(self, request, pk: int) -> Response:
        user = self.get_object()
        with track_model_update(
            obj=user, request=request, changes=["Activated"]
        ):
            user.is_active = True
            user.is_pending_activation = False
            user.ban_reason = None
            user.save()
        clear_audit_log_action_flags(obj=user)
        return Response({})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        reason = serializer.data["reason"]

        if user.source == User.Source.trle:
            with track_model_update(
                obj=user,
                request=request,
                changes=[f"Deactivated (reason: {reason})"],
            ):
                user.is_active = False
                user.is_pending_activation = False
                user.email = ""
                user.first_name = ""
                user.last_name = ""
                user.set_unusable_password()
                user.ban_reason = reason
                user.save()
        elif user.is_pending_activation:
            track_model_deletion(
                obj=user,
                request=request,
                changes=[f"Rejected (reason: {reason})"],
            )
            user.delete()
        else:
            with track_model_update(
                obj=user,
                request=request,
                changes=[f"Deactivated (reason: {reason})"],
            ):
                user.is_active = False
                user.ban_reason = reason
                user.save()

        clear_audit_log_action_flags(obj=user)
        return Response({})

    @action(detail=True, methods=["post"])
    def unban(self, request, pk: int) -> Response:
        user = self.get_object()
        with track_model_update(
            obj=user, request=request, changes=["Unbanned"]
        ):
            user.is_banned = False
            user.ban_reason = None
            user.save()
        clear_audit_log_action_flags(obj=user)
        return Response({})

    @action(detail=True, methods=["post"])
    def ban(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        reason = serializer.data["reason"]
        with track_model_update(
            obj=user, request=request, changes=[f"Banned (reason: {reason})"]
        ):
            user.is_banned = True
            user.ban_reason = reason
            user.save()
        clear_audit_log_action_flags(obj=user)
        return Response({})
