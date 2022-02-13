from django.db import models


class RatingClass(models.Model):
    class Target(models.TextChoices):
        LEVEL = ("le", "Level")
        REVIEW = ("re", "Review")

    target = models.CharField(choices=Target.choices, max_length=2)
    position = models.IntegerField(null=True, blank=True)
    name = models.CharField(max_length=30)

    min_rating_count = models.IntegerField()
    min_rating_average = models.DecimalField(
        decimal_places=3, max_digits=5, null=True, blank=True
    )
    max_rating_average = models.DecimalField(
        decimal_places=3, max_digits=5, null=True, blank=True
    )

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Rating classes"
        ordering = ["position"]
        default_permissions = []
