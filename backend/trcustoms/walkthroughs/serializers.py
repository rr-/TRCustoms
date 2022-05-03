from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxLengthValidator,
    MinLengthValidator,
    URLValidator,
)
from rest_framework import serializers

from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import (
    send_walkthrough_submission_mail,
    send_walkthrough_update_mail,
)
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.serializers import UserNestedSerializer
from trcustoms.walkthroughs.consts import WalkthroughType
from trcustoms.walkthroughs.models import Walkthrough


class WalkthroughAuthorSerializer(UserNestedSerializer):
    picture = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "picture",
        ]


class WalkthroughListingSerializer(serializers.ModelSerializer):
    author = WalkthroughAuthorSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )
    level = LevelNestedSerializer(read_only=True)
    legacy_author_name = serializers.ReadOnlyField()

    is_pending_approval = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    rejection_reason = serializers.ReadOnlyField()

    class Meta:
        model = Walkthrough
        fields = [
            "id",
            "level",
            "author",
            "legacy_author_name",
            "is_pending_approval",
            "is_approved",
            "rejection_reason",
            "walkthrough_type",
            "text",
            "created",
            "last_updated",
        ]


class WalkthroughDetailsSerializer(WalkthroughListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    text = serializers.CharField(
        validators=[MinLengthValidator(0), MaxLengthValidator(50000)]
    )

    class Meta:
        model = Walkthrough
        fields = WalkthroughListingSerializer.Meta.fields + [
            "level_id",
        ]

    def validate(self, data):
        validated_data = super().validate(data)

        author = (
            self.instance.author
            if self.instance
            else self.context["request"].user
        )
        validated_data["author"] = author

        walkthrough_type = (
            validated_data.get("walkthrough_type")
            or self.instance.walkthrough_type
        )

        level = validated_data.get("level", None)
        if (
            level
            and level.walkthroughs.filter(author=author)
            .filter(walkthrough_type=walkthrough_type)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {
                    "detail": "You have already posted a walkthrough "
                    "of this type for this level."
                }
            )

        if walkthrough_type == WalkthroughType.LINK:
            validator = URLValidator()
            try:
                validator(validated_data.get("text"))
            except ValidationError:
                raise serializers.ValidationError(
                    {"text": ["Enter a valid URL."]}
                ) from None

        return validated_data

    def create(self, validated_data):
        func = super().create

        def walkthrough_factory():
            return func(validated_data)

        walkthrough = walkthrough_factory()
        walkthrough.save()
        send_walkthrough_submission_mail(walkthrough)
        return walkthrough

    def update(self, instance, validated_data):
        func = super().update

        def walkthrough_factory():
            return func(instance, validated_data)

        walkthrough = walkthrough_factory()
        walkthrough.save()
        send_walkthrough_update_mail(walkthrough)
        return walkthrough


class WalkthroughRejectionSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=200)
