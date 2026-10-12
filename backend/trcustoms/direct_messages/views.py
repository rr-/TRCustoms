from django.db.models import Exists, OuterRef, QuerySet
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from trcustoms.common.serializers import EmptySerializer
from trcustoms.direct_messages.logic import (
    can_reply,
    get_administrator,
    mark_thread_read,
    post_message,
    start_thread,
)
from trcustoms.direct_messages.models import Message, Thread
from trcustoms.direct_messages.serializers import (
    MessageListingSerializer,
    MessageQuotaSerializer,
    MessageSerializer,
    MessageSettingsSerializer,
    ThreadCreateSerializer,
    ThreadDetailsSerializer,
    ThreadReplySerializer,
)
from trcustoms.mixins import MultiSerializerMixin
from trcustoms.permissions import has_permission
from trcustoms.users.models import User, UserPermission, UserSettings
from trcustoms.utils import parse_bool


def can_act_as_administrator(user: User) -> bool:
    return has_permission(user, UserPermission.MESSAGE_AS_ADMINISTRATOR)


class ThreadViewSet(
    MultiSerializerMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Thread.objects.all().select_related(
        "starter", "starter__picture", "recipient", "recipient__picture"
    )
    permission_classes = [IsAuthenticated]

    serializer_class = ThreadDetailsSerializer
    serializer_class_by_action = {
        "create": ThreadCreateSerializer,
        "reply": ThreadReplySerializer,
    }

    def get_thread_mailbox_owner(self, thread: Thread) -> User:
        user = self.request.user
        if user in (thread.starter, thread.recipient):
            return user
        administrator = get_administrator()
        if administrator in (
            thread.starter,
            thread.recipient,
        ) and can_act_as_administrator(user):
            return administrator
        raise NotFound

    def details_response(
        self,
        thread: Thread,
        owner: User,
        status_code: int = status.HTTP_200_OK,
    ) -> Response:
        serializer = ThreadDetailsSerializer(
            thread,
            context={
                "request": self.request,
                "mailbox_owner": owner,
                "can_reply": can_reply(owner, thread),
            },
        )
        return Response(serializer.data, status=status_code)

    def retrieve(self, request, *args, **kwargs):
        thread = get_object_or_404(self.get_queryset(), pk=kwargs["pk"])
        owner = self.get_thread_mailbox_owner(thread)
        mark_thread_read(thread, owner)
        return self.details_response(thread, owner)

    @extend_schema(responses={201: ThreadDetailsSerializer})
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sender = serializer.validated_data["sender"]
        thread = start_thread(
            request,
            sender=sender,
            receiver=serializer.validated_data["receiver_id"],
            subject=serializer.validated_data["subject"],
            text=serializer.validated_data["text"],
        )
        return self.details_response(
            thread, sender, status_code=status.HTTP_201_CREATED
        )

    @extend_schema(responses={201: MessageSerializer})
    @action(detail=True, methods=["post"])
    def reply(self, request, pk: int) -> Response:
        thread = get_object_or_404(self.get_queryset(), pk=pk)
        owner = self.get_thread_mailbox_owner(thread)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not can_reply(owner, thread):
            raise PermissionDenied("You cannot reply to this conversation.")
        message = post_message(
            request, thread, owner, serializer.validated_data["text"]
        )
        return Response(
            MessageSerializer(message).data, status=status.HTTP_201_CREATED
        )


class MessageViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Message.objects.all().select_related(
        "thread", "sender", "sender__picture", "receiver", "receiver__picture"
    )
    permission_classes = [IsAuthenticated]
    serializer_class = MessageListingSerializer

    def get_mailbox_owner(self) -> User:
        if parse_bool(self.request.query_params.get("as_administrator")):
            if not can_act_as_administrator(self.request.user):
                raise PermissionDenied
            if (administrator := get_administrator()) is None:
                raise NotFound
            return administrator
        return self.request.user

    def get_queryset(self) -> QuerySet[Message]:
        queryset = super().get_queryset()
        if self.action != "list":
            return queryset
        owner = self.get_mailbox_owner()
        queryset = queryset.annotate(
            is_replied=Exists(
                Message.objects.filter(
                    thread=OuterRef("thread"),
                    sender=OuterRef("receiver"),
                    created__gt=OuterRef("created"),
                )
            )
        )
        if self.request.query_params.get("box") == "outbox":
            return queryset.filter(sender=owner)
        return queryset.filter(receiver=owner)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "box", OpenApiTypes.STR, enum=["inbox", "outbox"]
            ),
            OpenApiParameter("as_administrator", OpenApiTypes.BOOL),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(request=EmptySerializer, responses=EmptySerializer)
    @action(detail=True, methods=["post"])
    def mark_unread(self, request, pk: int) -> Response:
        message = get_object_or_404(Message, pk=pk)
        receiver = message.receiver
        if receiver != request.user and not (
            receiver is not None
            and receiver == get_administrator()
            and can_act_as_administrator(request.user)
        ):
            raise NotFound
        message.is_read = False
        message.save(update_fields=["is_read"])
        return Response({})

    @extend_schema(responses=MessageQuotaSerializer)
    @action(detail=False)
    def quota(self, request) -> Response:
        return Response(MessageQuotaSerializer.for_user(request.user).data)

    @extend_schema(methods=["get"], responses=MessageSettingsSerializer)
    @extend_schema(
        methods=["put"],
        request=MessageSettingsSerializer,
        responses=MessageSettingsSerializer,
    )
    @action(detail=False, methods=["get", "put"], url_path="settings")
    def message_settings(self, request) -> Response:
        user_settings, _ = UserSettings.objects.get_or_create(
            user=request.user
        )
        if request.method == "GET":
            return Response(MessageSettingsSerializer(user_settings).data)
        serializer = MessageSettingsSerializer(
            user_settings, data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
