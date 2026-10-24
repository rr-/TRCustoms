from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField
from trcustoms.direct_messages.logic import (
    can_message,
    can_reply,
    get_administrator,
    get_daily_limit,
    get_sent_today,
)
from trcustoms.direct_messages.models import Message, Thread
from trcustoms.permissions import has_permission
from trcustoms.users.models import User, UserPermission, UserSettings
from trcustoms.users.serializers import UserNestedSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserNestedSerializer(read_only=True)
    receiver = UserNestedSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "receiver", "text", "created", "is_read"]


class OtherUserMixin(serializers.Serializer):
    other_user = serializers.SerializerMethodField()

    @extend_schema_field(UserNestedSerializer(allow_null=True))
    def get_other_user(self, instance: Thread) -> dict | None:
        other = instance.get_other_participant(self.context["mailbox_owner"])
        return UserNestedSerializer(other).data if other else None


class ThreadListingSerializer(OtherUserMixin, serializers.ModelSerializer):
    last_message_text = serializers.CharField(read_only=True)
    last_message_is_own = serializers.BooleanField(read_only=True)
    has_unread = serializers.BooleanField(read_only=True)

    class Meta:
        model = Thread
        fields = [
            "id",
            "other_user",
            "last_message_text",
            "last_message_at",
            "last_message_is_own",
            "has_unread",
        ]


class ThreadDetailsSerializer(OtherUserMixin, serializers.ModelSerializer):
    can_reply = serializers.SerializerMethodField()
    can_mark_unread = serializers.SerializerMethodField()
    replies_as_administrator = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            "id",
            "other_user",
            "can_reply",
            "can_mark_unread",
            "replies_as_administrator",
        ]

    def get_can_reply(self, instance: Thread) -> bool:
        return self.context["can_reply"]

    def get_can_mark_unread(self, instance: Thread) -> bool:
        return instance.messages.filter(
            receiver=self.context["mailbox_owner"]
        ).exists()

    def get_replies_as_administrator(self, instance: Thread) -> bool:
        return self.context["mailbox_owner"] != self.context["request"].user


class ThreadCreateSerializer(serializers.Serializer):
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    text = CustomCharField(
        collapse_whitespace=False,
        max_length=Message._meta.get_field("text").max_length,
    )
    send_as_administrator = serializers.BooleanField(default=False)

    def validate(self, data):
        user = self.context["request"].user
        receiver = data["receiver_id"]

        if data["send_as_administrator"]:
            if not has_permission(
                user, UserPermission.MESSAGE_AS_ADMINISTRATOR
            ):
                raise serializers.ValidationError(
                    {
                        "send_as_administrator": (
                            "You cannot send messages as Administration."
                        )
                    }
                )
            administrator = get_administrator()
            if administrator is None:
                raise serializers.ValidationError(
                    {
                        "send_as_administrator": (
                            "The Administration account does not exist."
                        )
                    }
                )
            if receiver == administrator:
                raise serializers.ValidationError(
                    {"receiver_id": "Administration cannot message itself."}
                )
            data["sender"] = administrator
            data["thread"] = Thread.objects.between(
                administrator, receiver
            ).first()
            return data

        data["sender"] = user
        data["thread"] = Thread.objects.between(user, receiver).first()
        if data["thread"] is not None:
            if not can_reply(user, data["thread"]):
                raise serializers.ValidationError(
                    {"receiver_id": "This user cannot be messaged."}
                )
            return data

        if not can_message(user, receiver):
            raise serializers.ValidationError(
                {"receiver_id": "This user cannot be messaged."}
            )
        if get_sent_today(user) >= get_daily_limit(user):
            raise serializers.ValidationError(
                "You have reached your daily limit of new conversations."
            )
        return data


class ThreadReplySerializer(serializers.Serializer):
    text = CustomCharField(
        collapse_whitespace=False,
        max_length=Message._meta.get_field("text").max_length,
    )


class MessageQuotaSerializer(serializers.Serializer):
    limit = serializers.IntegerField()
    used = serializers.IntegerField()
    remaining = serializers.IntegerField()

    @staticmethod
    def for_user(user: User) -> "MessageQuotaSerializer":
        limit = get_daily_limit(user)
        used = get_sent_today(user)
        return MessageQuotaSerializer(
            {"limit": limit, "used": used, "remaining": max(0, limit - used)}
        )


class MessageSettingsSerializer(serializers.ModelSerializer):
    blocked_users = UserNestedSerializer(read_only=True, many=True)
    blocked_user_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        required=False,
        source="blocked_users",
        queryset=User.objects.all(),
    )

    class Meta:
        model = UserSettings
        fields = ["allow_messages", "blocked_users", "blocked_user_ids"]
