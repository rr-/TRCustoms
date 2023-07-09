from django.db import models

from trcustoms.common.consts import RatingClassSubject


class DatesInfo(models.Model):
    """Base class for models expected to store creation and last update
    datetime values.
    """

    created = models.DateTimeField(auto_now_add=True, null=True)
    last_updated = models.DateTimeField(
        auto_now=True, null=True, db_index=True
    )

    class Meta:
        abstract = True


class Country(models.Model):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=64)

    class Meta:
        default_permissions = []


class RatingClass(models.Model):
    target = models.CharField(choices=RatingClassSubject.choices, max_length=2)
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
