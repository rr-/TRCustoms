from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.audit_logs.utils import track_model_creation
from trcustoms.common.serializers import EmptySerializer
from trcustoms.mails import (
    send_email_confirmation_mail,
    send_password_reset_mail,
)
from trcustoms.mixins import (
    AuditLogModelWatcherUpdateMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.users.consts import UserSource
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
    UserCompletePasswordResetSerializer,
    UserConfirmEmailSerializer,
    UserDetailsSerializer,
    UserListingSerializer,
    UsernameSerializer,
    UserRequestPasswordResetSerializer,
)
from trcustoms.users.tokens import get_user_from_token
from trcustoms.utils import parse_int


@extend_schema_view(
    resend_activation_email=extend_schema(
        request=UsernameSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    confirm_email=extend_schema(
        request=UserConfirmEmailSerializer,
        responses={status.HTTP_200_OK: UserDetailsSerializer},
    ),
    activate=extend_schema(
        request=EmptySerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    deactivate=extend_schema(
        request=UserBanSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    ban=extend_schema(
        request=UserBanSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    unban=extend_schema(
        request=EmptySerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    request_password_reset=extend_schema(
        request=UserRequestPasswordResetSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
    complete_password_reset=extend_schema(
        request=UserCompletePasswordResetSerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    ),
)
class UserViewSet(
    AuditLogModelWatcherUpdateMixin,
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
        "me": [IsAuthenticated],
        "retrieve": [
            HasPermission(UserPermission.VIEW_USERS) | IsAccessingOwnResource
        ],
        "list": [HasPermission(UserPermission.LIST_USERS)],
        "by_username": [AllowAny],
        "update": [
            HasPermission(UserPermission.EDIT_USERS) | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_USERS) | IsAccessingOwnResource
        ],
        "activate": [HasPermission(UserPermission.MANAGE_USERS)],
        "deactivate": [HasPermission(UserPermission.MANAGE_USERS)],
        "ban": [HasPermission(UserPermission.MANAGE_USERS)],
        "unban": [HasPermission(UserPermission.MANAGE_USERS)],
        "resend_activation_email": [AllowAny],
        "confirm_email": [AllowAny],
        "request_password_reset": [AllowAny],
        "complete_password_reset": [AllowAny],
    }

    ordering = ["-pk"]
    ordering_fields = [
        "username",
        "first_name",
        "last_name",
        "date_joined",
        "last_login",
        "authored_level_count_all",
        "authored_level_count_approved",
        "rated_level_count",
        "reviewed_level_count",
    ]
    search_fields = [
        "username",
        "first_name",
        "last_name",
    ]

    queryset = User.objects.all()
    serializer_class = UserListingSerializer
    serializer_class_by_action = {
        "retrieve": UserDetailsSerializer,
        "update": UserDetailsSerializer,
        "partial_update": UserDetailsSerializer,
        "create": UserDetailsSerializer,
        "by_username": UserDetailsSerializer,
        "me": UserDetailsSerializer,
    }

    def log_addition(self, request, obj, message):
        track_model_creation(
            obj, request=request, changes=[f"Created ({obj.email})"]
        )

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()

        country_code = self.request.query_params.get("country_code")
        if country_code is not None:
            if country_code == "":
                queryset = queryset.filter(country__isnull=True)
            else:
                queryset = queryset.filter(
                    country__iso_3166_1_alpha2=country_code
                )

        if (
            authored_min := parse_int(
                self.request.query_params.get("authored_levels_min")
            )
        ) is not None:
            queryset = queryset.filter(
                authored_level_count_approved__gte=authored_min
            )

        if (
            ratings_min := parse_int(
                self.request.query_params.get("ratings_min")
            )
        ) is not None:
            queryset = queryset.filter(rated_level_count__gte=ratings_min)

        if (
            reviews_min := parse_int(
                self.request.query_params.get("reviews_min")
            )
        ) is not None:
            queryset = queryset.filter(reviewed_level_count__gte=reviews_min)

        if parse_int(self.request.query_params.get("hide_inactive_reviewers")):
            queryset = queryset.filter(
                reviewed_levels__created__gte=(
                    timezone.now() - timedelta(days=365 / 2)
                )
            ).distinct()

        return queryset

    @action(detail=False, url_path=r"by_username/(?P<username>\w+)")
    def by_username(self, request, username: str):
        user = get_object_or_404(self.queryset, username__iexact=username)
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
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
            source=UserSource.trle,
        ).first()
        if trle_user:
            self.kwargs[kwarg_field] = trle_user.id
            response = self.update(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK:
                response.status_code = status.HTTP_201_CREATED
        else:
            response = super().create(request, *args, **kwargs)

        return response

    @action(detail=False, methods=["post"])
    def resend_activation_email(self, request) -> Response:
        serializer = UsernameSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(
            Q(username=serializer.data["username"])
            | Q(email__iexact=serializer.data["username"])
        ).first()
        send_email_confirmation_mail(user)
        return Response({}, status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def confirm_email(self, request) -> Response:
        serializer = UserConfirmEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = get_user_from_token(serializer.validated_data["token"])
        confirm_user_email(user, request)
        return Response(
            UserDetailsSerializer(
                self.queryset.filter(id=user.id).get(),
                context={"request": request},
            ).data,
            status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk: int) -> Response:
        user = self.get_object()
        activate_user(user, request)
        return Response({}, status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        reason = serializer.data["reason"]

        if user.is_superuser:
            return Response(
                "Cannot deactivate a superuser", status.HTTP_400_BAD_REQUEST
            )

        if user.is_pending_activation:
            reject_user(user, request, reason)
        else:
            deactivate_user(user, request, reason)

        return Response({}, status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def unban(self, request, pk: int) -> Response:
        user = self.get_object()
        unban_user(user, request)
        return Response({}, status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def ban(self, request, pk: int) -> Response:
        serializer = UserBanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = self.get_object()
        if user.is_superuser:
            return Response(
                "Cannot ban a superuser", status.HTTP_400_BAD_REQUEST
            )
        reason = serializer.data["reason"]
        ban_user(user, request, reason)
        return Response({}, status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def request_password_reset(self, request) -> Response:
        serializer = UserRequestPasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"]
        ).first()
        if user:
            send_password_reset_mail(user)
        return Response({}, status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def complete_password_reset(self, request) -> Response:
        serializer = UserCompletePasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        user = get_user_from_token(serializer.validated_data["token"])
        user.set_password(serializer.validated_data["password"])
        user.save()
        return Response({}, status.HTTP_200_OK)
