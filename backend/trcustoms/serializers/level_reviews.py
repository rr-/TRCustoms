from functools import cache

from django.db.models import Count
from rest_framework import serializers

from trcustoms.models import (
    Level,
    LevelReview,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
    User,
)
from trcustoms.serializers.levels import LevelNestedSerializer
from trcustoms.serializers.rating_classes import RatingClassNestedSerializer
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer
from trcustoms.serializers.users import UserNestedSerializer


@cache
def get_reviewed_level_count(user_id: int) -> int:
    return User.objects.filter(id=user_id).aggregate(
        count=Count("reviewed_levels")
    )["count"]


class ReviewAuthorSerializer(UserNestedSerializer):
    picture = UploadedFileNestedSerializer(read_only=True)
    reviewed_level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "picture",
            "reviewed_level_count",
        ]

    def get_reviewed_level_count(self, instance: User) -> int:
        return get_reviewed_level_count(instance.id)


class LevelReviewListingSerializer(serializers.ModelSerializer):
    author = ReviewAuthorSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )
    level = LevelNestedSerializer(read_only=True)
    rating_class = RatingClassNestedSerializer(read_only=True)

    class Meta:
        model = LevelReview
        fields = [
            "id",
            "author",
            "level",
            "text",
            "created",
            "last_updated",
            "rating_class",
        ]


class LevelReviewDetailsSerializer(LevelReviewListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    text = serializers.CharField(required=True)
    answers = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    answer_ids = serializers.PrimaryKeyRelatedField(
        queryset=ReviewTemplateAnswer.objects.all(), write_only=True, many=True
    )

    class Meta:
        model = LevelReview
        fields = LevelReviewListingSerializer.Meta.fields + [
            "answers",
            "answer_ids",
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
                "This user has already reviewed this level."
            )
        if level and level.authors.filter(id=author.id).exists():
            raise serializers.ValidationError("Cannot review own level.")

        # validate that for each question there is exactly one answer.
        answers = validated_data.get("answer_ids", None)
        if answers is not None:
            answer_ids = set(answer.id for answer in answers)
            for (
                template_question
            ) in ReviewTemplateQuestion.objects.all().prefetch_related(
                "answers"
            ):
                question_answer_ids = set(
                    template_question.answers.values_list("id", flat=True)
                )
                if len(answer_ids & question_answer_ids) != 1:
                    raise serializers.ValidationError(
                        {"answer_ids": "Malformed answers."}
                    )

        return validated_data

    def handle_m2m(self, review_factory, validated_data):
        answers = validated_data.pop("answer_ids", None)

        review = review_factory()
        review.review_type = LevelReview.ReviewType.TRC
        review.save()

        if answers is not None:
            review.answers.set(answers)

        return review

    def create(self, validated_data):
        func = super().create

        def review_factory():
            return func(validated_data)

        return self.handle_m2m(review_factory, validated_data)

    def update(self, instance, validated_data):
        func = super().update

        def review_factory():
            return func(instance, validated_data)

        return self.handle_m2m(review_factory, validated_data)
