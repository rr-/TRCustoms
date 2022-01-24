from rest_framework import serializers

from trcustoms.models import ReviewTemplateAnswer, ReviewTemplateQuestion


class ReviewTemplateAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewTemplateAnswer
        fields = ["id", "position", "answer_text"]


class ReviewTemplateQuestionSerializer(serializers.ModelSerializer):
    answers = ReviewTemplateAnswerSerializer(read_only=True, many=True)

    class Meta:
        model = ReviewTemplateQuestion
        fields = ["id", "position", "question_text", "answers"]
