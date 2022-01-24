from django.db import models

from trcustoms.models.util import DatesInfo


class ReviewTemplateQuestion(DatesInfo):
    position = models.IntegerField()
    weight = models.IntegerField()
    question_text = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"Review question #{self.position + 1}: {self.question_text}"

    class Meta:
        ordering = ["position"]


class ReviewTemplateAnswer(DatesInfo):
    question = models.ForeignKey(
        ReviewTemplateQuestion,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    position = models.IntegerField()
    points = models.IntegerField()
    answer_text = models.CharField(max_length=100)

    def __str__(self) -> str:
        return (
            f"Review question #{self.question.position + 1} "
            f"answer #{self.position + 1}: {self.answer_text}"
        )

    class Meta:
        ordering = ["question__position", "position"]
