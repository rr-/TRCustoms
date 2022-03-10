from django.db.models import Q
from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.settings import api_settings as jwt_settings

from trcustoms.mails import send_email_confirmation_mail
from trcustoms.mixins import MultiSerializerMixin, PermissionsMixin
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.users.logic import (
    activate_user,
    ban_user,
    confirm_user_email,
    deactivate_user,
    reject_user,
    unban_user,
)
from trcustoms.users.models import User, UserPermission
from trcustoms.users.serializers import (
    UserBanSerializer,
    UserConfirmEmailSerializer,
    UserDetailsSerializer,
    UserListingSerializer,
    UsernameSerializer,
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
        "resend_activation_email": [AllowAny],
        "confirm_email": [AllowAny],
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

        send_email_confirmation_mail(user)

        return response

    @action(detail=False, methods=["post"])
    def resend_activation_email(self, request) -> Response:
        serializer = UsernameSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(
            Q(username=serializer.data["username"])
            | Q(email=serializer.data["username"])
        ).first()
        send_email_confirmation_mail(user)
        return Response({})

    @action(detail=False, methods=["post"])
    def confirm_email(self, request) -> Response:
        serializer = UserConfirmEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        token = serializer.validated_data["token"]
        user_id = token[jwt_settings.USER_ID_CLAIM]
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise Http404("No user found with this username.")
        confirm_user_email(user, request)
        return Response({})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk: int) -> Response:
        user = self.get_object()
        activate_user(user, request)
        return Response({})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        reason = serializer.data["reason"]

        if user.is_pending_activation:
            reject_user(user, request, reason)
        else:
            deactivate_user(user, request, reason)

        return Response({})

    @action(detail=True, methods=["post"])
    def unban(self, request, pk: int) -> Response:
        user = self.get_object()
        unban_user(user, request)
        return Response({})

    @action(detail=True, methods=["post"])
    def ban(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        reason = serializer.data["reason"]
        ban_user(user, request, reason)
        return Response({})