from django.db import models
from django.db.models import UniqueConstraint

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo, RatingClass
from trcustoms.levels.models import Level
from trcustoms.reviews.consts import ReviewType
from trcustoms.users.models import User


class ReviewTemplateQuestion(DatesInfo):
    position = models.IntegerField()
    weight = models.IntegerField()
    question_text = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"Review question #{self.position + 1}: {self.question_text}"

    class Meta:
        ordering = ["position"]
        default_permissions = []


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
        default_permissions = []


@registry.register_model(
    name_getter=lambda instance: instance.level.name,
    meta_factory=lambda instance: {
        "level_id": instance.level.id,
        "level_name": instance.level.name,
    },
)
class LevelReview(DatesInfo):
    position = models.IntegerField(default=0)

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="reviews"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviewed_levels",
    )

    review_type = models.CharField(
        choices=ReviewType.choices, max_length=2, default=ReviewType.TRLE
    )

    trle_rating_gameplay = models.IntegerField(blank=True, null=True)
    trle_rating_enemies = models.IntegerField(blank=True, null=True)
    trle_rating_atmosphere = models.IntegerField(blank=True, null=True)
    trle_rating_lighting = models.IntegerField(blank=True, null=True)

    answers = models.ManyToManyField(ReviewTemplateAnswer, related_name="+")

    rating_class = models.ForeignKey(
        RatingClass, blank=True, null=True, on_delete=models.SET_NULL
    )

    text = models.TextField(max_length=5000, null=True, blank=True)

    def __str__(self):
        return (
            f"Review on {self.level.name} "
            f"by {self.author.username} (id={self.id})"
        )

    class Meta:
        ordering = ["-created"]
        constraints = [
            UniqueConstraint(
                "level", "author", name="review_level_author_unique"
            ),
        ]
        default_permissions = []
