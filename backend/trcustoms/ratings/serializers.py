from rest_framework import serializers

from trcustoms.common.serializers import RatingClassNestedSerializer
from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.mails import (
    send_rating_submission_mail,
    send_rating_update_mail,
)
from trcustoms.permissions import get_permissions
from trcustoms.ratings.consts import RatingType
from trcustoms.ratings.models import (
    Rating,
    RatingTemplateAnswer,
    RatingTemplateQuestion,
)
from trcustoms.tasks import update_awards
from trcustoms.users.models import UserPermission
from trcustoms.users.serializers import UserNestedSerializer


class RatingAuthorSerializer(UserNestedSerializer):
    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "rated_level_count",
        ]


class RatingListingSerializer(serializers.ModelSerializer):
    author = RatingAuthorSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )
    level = LevelNestedSerializer(read_only=True)
    rating_class = RatingClassNestedSerializer(read_only=True)
    last_user_content_updated = serializers.ReadOnlyField()
    rating_type = serializers.ReadOnlyField()

    class Meta:
        model = Rating
        fields = [
            "id",
            "author",
            "level",
            "created",
            "rating_type",
            "last_updated",
            "rating_class",
            "last_user_content_updated",
        ]


class RatingDetailsSerializer(RatingListingSerializer):
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="level", queryset=Level.objects.all()
    )
    answers = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    answer_ids = serializers.PrimaryKeyRelatedField(
        queryset=RatingTemplateAnswer.objects.all(), write_only=True, many=True
    )

    class Meta:
        model = Rating
        fields = RatingListingSerializer.Meta.fields + [
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
                and UserPermission.EDIT_RATINGS
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
            and level.ratings.filter(author=author)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {"detail": "This user has already rated this level."}
            )
        if level and level.authors.filter(id=author.id).exists():
            raise serializers.ValidationError(
                {"detail": "Cannot rate own level."}
            )

        # validate that for each question there is exactly one answer.
        answers = validated_data.get("answer_ids", None)
        if answers is not None:
            answer_ids = set(answer.id for answer in answers)
            for (
                template_question
            ) in RatingTemplateQuestion.objects.all().prefetch_related(
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

    def handle_m2m(self, rating_factory, validated_data):
        answers = validated_data.pop("answer_ids", None)

        rating = rating_factory()
        rating.rating_type = RatingType.TRC
        rating.save()

        if answers is not None:
            rating.answers.set(answers)

        return rating

    def create(self, validated_data):
        func = super().create

        def rating_factory():
            rating = func(validated_data)
            rating.bump_last_user_content_updated()
            return rating

        rating = self.handle_m2m(rating_factory, validated_data)
        send_rating_submission_mail(rating)
        update_awards.delay(rating.author.pk)
        return rating

    def update(self, instance, validated_data):
        func = super().update

        def rating_factory():
            rating = func(instance, validated_data)
            rating.bump_last_user_content_updated()
            return rating

        rating = self.handle_m2m(rating_factory, validated_data)
        send_rating_update_mail(rating)
        update_awards.delay(rating.author.pk)
        return rating


class RatingTemplateAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingTemplateAnswer
        fields = ["id", "position", "answer_text"]


class RatingTemplateQuestionSerializer(serializers.ModelSerializer):
    answers = RatingTemplateAnswerSerializer(read_only=True, many=True)

    class Meta:
        model = RatingTemplateQuestion
        fields = ["id", "position", "question_text", "answers", "category"]
