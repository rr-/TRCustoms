from datetime import timedelta

from django.db import models
from django.utils import timezone

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


class UserContentDatesInfo(models.Model):
    last_user_content_updated = models.DateTimeField(null=True, blank=True)

    def bump_last_user_content_updated(self, save: bool = False) -> None:
        self.last_user_content_updated = timezone.now()

        one_day = timedelta(hours=24)
        if (
            self.created is not None
            and self.last_user_content_updated is not None
            and (self.last_user_content_updated - self.created) < one_day
        ):
            self.last_user_content_updated = None

        if save:
            self.save(update_fields=["last_user_content_updated"])

    class Meta:
        abstract = True


class Country(models.Model):
    name = models.CharField(max_length=64)
    iso_3166_1_alpha2 = models.CharField(max_length=2)
    iso_3166_1_numeric = models.CharField(max_length=3, null=True)

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
