from rest_framework import serializers

from trcustoms.common.serializers import RatingClassNestedSerializer
from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import (
    send_review_submission_mail,
    send_review_update_mail,
)
from trcustoms.permissions import get_permissions
from trcustoms.reviews.consts import ReviewType
from trcustoms.reviews.models import (
    Review,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
)
from trcustoms.tasks import update_awards
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.models import UserPermission
from trcustoms.users.serializers import UserNestedSerializer


class ReviewAuthorSerializer(UserNestedSerializer):
    picture = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "picture",
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
    rating_class = RatingClassNestedSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "author",
            "level",
            "text",
            "created",
            "last_updated",
            "rating_class",
        ]


class ReviewDetailsSerializer(ReviewListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    text = serializers.CharField(required=True)
    answers = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    answer_ids = serializers.PrimaryKeyRelatedField(
        queryset=ReviewTemplateAnswer.objects.all(), write_only=True, many=True
    )

    class Meta:
        model = Review
        fields = ReviewListingSerializer.Meta.fields + [
            "answers",
            "answer_ids",
            "level_id",
        ]

    def to_representation(self, obj):
        ret = super().to_representation(obj)

        request = self.context["request"]
        if (
            not request.user
            or not obj.author
            or (
                request.user.id != obj.author.id
                and UserPermission.EDIT_REVIEWS
                not in get_permissions(request.user)
            )
        ):
            ret.pop("answers", None)
            ret.pop("answer_ids", None)

        return ret

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
        review.review_type = ReviewType.TRC
        review.save()

        if answers is not None:
            review.answers.set(answers)

        return review

    def create(self, validated_data):
        func = super().create

        def review_factory():
            return func(validated_data)

        review = self.handle_m2m(review_factory, validated_data)
        send_review_submission_mail(review)
        update_awards.delay(review.author.pk)
        return review

    def update(self, instance, validated_data):
        func = super().update

        def review_factory():
            return func(instance, validated_data)

        review = self.handle_m2m(review_factory, validated_data)
        send_review_update_mail(review)
        update_awards.delay(review.author.pk)
        return review


class ReviewTemplateAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewTemplateAnswer
        fields = ["id", "position", "answer_text"]


class ReviewTemplateQuestionSerializer(serializers.ModelSerializer):
    answers = ReviewTemplateAnswerSerializer(read_only=True, many=True)

    class Meta:
        model = ReviewTemplateQuestion
        fields = ["id", "position", "question_text", "answers"]
