from django.db import models
from django.db.models import UniqueConstraint

from trcustoms.audit_logs import registry
from trcustoms.common.models import (
    DatesInfo,
    RatingClass,
    UserContentDatesInfo,
)
from trcustoms.levels.models import Level
from trcustoms.ratings.consts import RatingType
from trcustoms.users.models import User


class RatingTemplateQuestion(DatesInfo):
    position = models.IntegerField()
    weight = models.IntegerField()
    question_text = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"Rating question #{self.position + 1}: {self.question_text}"

    class Meta:
        ordering = ["position"]
        default_permissions = []


class RatingTemplateAnswer(DatesInfo):
    question = models.ForeignKey(
        RatingTemplateQuestion,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    position = models.IntegerField()
    points = models.IntegerField()
    answer_text = models.CharField(max_length=100)

    def __str__(self) -> str:
        return (
            f"Rating question #{self.question.position + 1} "
            f"answer #{self.position + 1}: {self.answer_text}"
        )

    class Meta:
        ordering = ["question__position", "position"]
        default_permissions = []


@registry.register_model(
    name_getter=lambda instance: instance.level.name,
    meta_factory=lambda instance: {
        "level_id": instance.level.id,
        "level_name": instance.level.name,
    },
)
class Rating(UserContentDatesInfo, DatesInfo):
    position = models.IntegerField(default=0)

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="ratings"
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="rated_levels"
    )

    rating_type = models.CharField(
        choices=RatingType.choices, max_length=2, default=RatingType.TRLE
    )

    answers = models.ManyToManyField(RatingTemplateAnswer, related_name="+")
    trle_score_gameplay = models.IntegerField(blank=True, null=True)
    trle_score_enemies = models.IntegerField(blank=True, null=True)
    trle_score_atmosphere = models.IntegerField(blank=True, null=True)
    trle_score_lighting = models.IntegerField(blank=True, null=True)

    rating_class = models.ForeignKey(
        RatingClass, blank=True, null=True, on_delete=models.SET_NULL
    )

    def __str__(self):
        return (
            f"Rating on {self.level.name} "
            f"by {self.author.username} (id={self.id})"
        )

    class Meta:
        ordering = ["-created"]
        constraints = [
            UniqueConstraint(
                "level", "author", name="rating_level_author_unique"
            ),
        ]
        default_permissions = []
