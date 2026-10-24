from django.db.models import (
    BooleanField,
    Case,
    Exists,
    OuterRef,
    Q,
    QuerySet,
    Subquery,
    Value,
    When,
)
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from trcustoms.common.pagination import CustomPagination
from trcustoms.common.serializers import EmptySerializer
from trcustoms.direct_messages.logic import (
    can_reply,
    get_administrator,
    mark_thread_read,
    post_message,
    send_message,
)
from trcustoms.direct_messages.models import Message, Thread
from trcustoms.direct_messages.serializers import (
    MessageQuotaSerializer,
    MessageSerializer,
    MessageSettingsSerializer,
    ThreadCreateSerializer,
    ThreadDetailsSerializer,
    ThreadListingSerializer,
    ThreadReplySerializer,
)
from trcustoms.mixins import MultiSerializerMixin
from trcustoms.permissions import has_permission
from trcustoms.users.models import User, UserPermission, UserSettings
from trcustoms.utils import parse_bool


def can_act_as_administrator(user: User) -> bool:
    return has_permission(user, UserPermission.MESSAGE_AS_ADMINISTRATOR)


class ConversationPagination(CustomPagination):
    def get_page_number(self, request, paginator):
        if self.page_query_param not in request.query_params:
            return paginator.num_pages
        return super().get_page_number(request, paginator)


class ThreadViewSet(
    MultiSerializerMixin,
    mixins.ListModelMixin,
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
        "list": ThreadListingSerializer,
        "create": ThreadCreateSerializer,
        "reply": ThreadReplySerializer,
    }

    def get_mailbox_owner(self) -> User:
        if parse_bool(self.request.query_params.get("as_administrator")):
            if not can_act_as_administrator(self.request.user):
                raise PermissionDenied
            if (administrator := get_administrator()) is None:
                raise NotFound
            return administrator
        return self.request.user

    def get_queryset(self) -> QuerySet[Thread]:
        queryset = super().get_queryset()
        if self.action != "list":
            return queryset
        owner = self.get_mailbox_owner()
        messages = Message.objects.filter(thread=OuterRef("pk"))
        last_message = messages.order_by("-created", "-pk")
        queryset = (
            queryset.for_participant(owner)
            .annotate(
                last_message_text=Subquery(last_message.values("text")[:1]),
                last_message_sender=Subquery(
                    last_message.values("sender")[:1]
                ),
                has_unread=Exists(
                    messages.filter(receiver=owner, is_read=False)
                ),
            )
            .annotate(
                last_message_is_own=Case(
                    When(last_message_sender=owner.pk, then=Value(True)),
                    default=Value(False),
                    output_field=BooleanField(),
                )
            )
        )
        if search := self.request.query_params.get("search"):
            queryset = queryset.filter(
                Q(starter=owner, recipient__username__icontains=search)
                | Q(recipient=owner, starter__username__icontains=search)
                | Exists(messages.filter(text__icontains=search))
            )
        return queryset

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        if self.action == "list":
            context["mailbox_owner"] = self.get_mailbox_owner()
        return context

    @extend_schema(
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR),
            OpenApiParameter("as_administrator", OpenApiTypes.BOOL),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

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
        thread = send_message(
            request,
            sender=sender,
            receiver=serializer.validated_data["receiver_id"],
            text=serializer.validated_data["text"],
            thread=serializer.validated_data["thread"],
        )
        return self.details_response(
            thread, sender, status_code=status.HTTP_201_CREATED
        )

    @extend_schema(responses=MessageSerializer(many=True))
    @action(
        detail=True,
        methods=["get"],
        url_path="messages",
        pagination_class=ConversationPagination,
    )
    def thread_messages(self, request, pk: int) -> Response:
        thread = get_object_or_404(self.get_queryset(), pk=pk)
        self.get_thread_mailbox_owner(thread)
        page = self.paginate_queryset(
            thread.messages.select_related(
                "sender", "sender__picture", "receiver", "receiver__picture"
            )
        )
        return self.get_paginated_response(
            MessageSerializer(page, many=True).data
        )

    @extend_schema(request=EmptySerializer, responses=EmptySerializer)
    @action(detail=True, methods=["post"])
    def mark_unread(self, request, pk: int) -> Response:
        thread = get_object_or_404(self.get_queryset(), pk=pk)
        owner = self.get_thread_mailbox_owner(thread)
        message = thread.messages.filter(receiver=owner).last()
        if message is None:
            raise ValidationError("There are no received messages to mark.")
        message.is_read = False
        message.save(update_fields=["is_read"])
        return Response({})

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


class MessageViewSet(viewsets.GenericViewSet):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = EmptySerializer

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
