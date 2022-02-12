from django.db import models
from django.db.models import UniqueConstraint

from trcustoms.audit_logs import registry
from trcustoms.models.level import Level
from trcustoms.models.rating_class import RatingClass
from trcustoms.models.review_template import ReviewTemplateAnswer
from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


@registry.register_model(
    name_getter=lambda instance: instance.level.name,
    meta_factory=lambda instance: {
        "level_id": instance.level.id,
        "level_name": instance.level.name,
    },
)
class LevelReview(DatesInfo):
    class ReviewType(models.TextChoices):
        TRLE = ("le", "Legacy (TRLE.net)")
        TRC = ("mo", "Modern (TRCustoms)")

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
