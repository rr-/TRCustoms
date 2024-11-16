from django.utils import timezone
from rest_framework import serializers

from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import (
    send_review_submission_mail,
    send_review_update_mail,
)
from trcustoms.reviews.models import Review
from trcustoms.tasks import update_awards
from trcustoms.users.serializers import UserNestedSerializer


class ReviewAuthorSerializer(UserNestedSerializer):
    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "reviewed_level_count",
        ]


class ReviewListingSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )
    level = LevelNestedSerializer(read_only=True)
    last_user_content_updated = serializers.ReadOnlyField()

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "level",
            "text",
            "created",
            "last_updated",
            "last_user_content_updated",
        ]


class ReviewDetailsSerializer(ReviewListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    text = serializers.CharField(required=True)

    class Meta:
        model = Review
        fields = ReviewListingSerializer.Meta.fields + [
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

        level = validated_data.get("level", None)
        if (
            level
            and level.reviews.filter(author=author)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {"detail": "This user has already reviewed this level."}
            )
        if level and level.authors.filter(id=author.id).exists():
            raise serializers.ValidationError(
                {"detail": "Cannot review own level."}
            )

        return validated_data

    def create(self, validated_data):
        review = super().create(validated_data)
        review.last_user_content_updated = review.created
        review.save()
        send_review_submission_mail(review)
        update_awards.delay(review.author.pk)
        return review

    def update(self, instance, validated_data):
        review = super().update(instance, validated_data)
        review.last_user_content_updated = timezone.now()
        review.save()
        send_review_update_mail(review)
        update_awards.delay(review.author.pk)
        return review
