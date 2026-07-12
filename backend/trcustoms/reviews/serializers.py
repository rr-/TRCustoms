from rest_framework import serializers

from trcustoms.common.fields import CustomCharField
from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import (
    send_review_removal_mail,
    send_review_submission_mail,
    send_review_update_mail,
)
from trcustoms.reviews.logic import (
    can_user_vote_on_review,
    hide_review,
    remove_user_review_votes_for_level,
    unhide_review,
)
from trcustoms.reviews.models import Review, ReviewVote
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
    current_user_vote = serializers.SerializerMethodField()
    can_vote = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "level",
            "text",
            "is_hidden",
            "rejection_reason",
            "created",
            "last_updated",
            "last_user_content_updated",
            "upvote_count",
            "downvote_count",
            "current_user_vote",
            "can_vote",
        ]

    def get_current_user_vote(self, obj: Review) -> int | None:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            return None
        vote = (
            ReviewVote.objects.filter(
                review=obj,
                user=user,
            )
            .values_list("vote", flat=True)
            .first()
        )
        return vote

    def get_can_vote(self, obj: Review) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            return False
        return can_user_vote_on_review(user, obj)


class ReviewDetailsSerializer(ReviewListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )

    class Meta:
        model = Review
        fields = ReviewListingSerializer.Meta.fields + [
            "level_id",
        ]
        extra_kwargs = {
            "text": {
                "required": True,
                "allow_blank": False,
                "allow_null": False,
            }
        }

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
        remove_user_review_votes_for_level(review.author, review.level)
        review.bump_last_user_content_updated()
        review.save()
        send_review_submission_mail(review)
        update_awards.delay(review.author.pk)
        return review

    def update(self, instance, validated_data):
        was_hidden = instance.is_hidden
        old_level = instance.level
        review = super().update(instance, validated_data)
        if was_hidden:
            unhide_review(review)
        remove_user_review_votes_for_level(review.author, old_level)
        remove_user_review_votes_for_level(review.author, review.level)
        review.bump_last_user_content_updated()
        review.save()
        send_review_update_mail(review)
        update_awards.delay(review.author.pk)
        return review


class ReviewHideSerializer(serializers.Serializer):
    reason = CustomCharField(collapse_whitespace=False, max_length=500)

    def notify(self, instance: Review) -> None:
        send_review_removal_mail(instance, self.validated_data["reason"])
        hide_review(
            instance,
            self.context.get("request"),
            self.validated_data["reason"],
        )


class ReviewVoteSerializer(serializers.Serializer):
    vote = serializers.ChoiceField(choices=[-1, 1], required=True)
