from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, URLValidator
from django.utils import timezone
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField
from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import send_walkthrough_update_mail
from trcustoms.tasks import update_awards
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.serializers import UserNestedSerializer
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
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

    status = serializers.ReadOnlyField()
    rejection_reason = serializers.ReadOnlyField()
    last_user_content_updated = serializers.ReadOnlyField()

    class Meta:
        model = Walkthrough
        fields = [
            "id",
            "level",
            "author",
            "legacy_author_name",
            "status",
            "rejection_reason",
            "walkthrough_type",
            "text",
            "created",
            "last_updated",
            "last_user_content_updated",
        ]


class WalkthroughDetailsSerializer(WalkthroughListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    text = CustomCharField(
        validators=[MinLengthValidator(0)], collapse_whitespace=False
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
            walkthrough = func(validated_data)
            walkthrough.last_user_content_updated = walkthrough.created
            return walkthrough

        walkthrough = walkthrough_factory()
        walkthrough.save()
        update_awards.delay(walkthrough.author.pk)
        return walkthrough

    def update(self, instance, validated_data):
        func = super().update

        def walkthrough_factory():
            walkthrough = func(instance, validated_data)
            if walkthrough.status == WalkthroughStatus.APPROVED:
                walkthrough.last_user_content_updated = timezone.now()
            return walkthrough

        walkthrough = walkthrough_factory()
        walkthrough.save()

        if walkthrough.status == WalkthroughStatus.APPROVED:
            send_walkthrough_update_mail(walkthrough)
        update_awards.delay(walkthrough.author.pk)
        return walkthrough


class WalkthroughRejectionSerializer(serializers.Serializer):
    reason = CustomCharField(collapse_whitespace=False, max_length=500)
