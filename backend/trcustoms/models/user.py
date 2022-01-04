from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import Count

from trcustoms.models.uploaded_file import UploadedFile


class UserManager(BaseUserManager):
    def with_counts(self):
        return self.annotate(
            authored_level_count=Count("authored_levels", distinct=True),
            reviewed_level_count=Count("reviewed_levels", distinct=True),
        )

    def get_by_natural_key(self, username: str) -> AbstractUser:
        case_insensitive_username_field = (
            f"{self.model.USERNAME_FIELD}__iexact"
        )
        return self.get(**{case_insensitive_username_field: username})


class User(AbstractUser):
    objects = UserManager()

    class Source(models.TextChoices):
        trle = "trle", "trle.net"
        trcustoms = "trcustoms", "trcustoms"

    trle_reviewer_id = models.CharField(max_length=32, blank=True, null=True)
    trle_author_id = models.CharField(max_length=32, blank=True, null=True)

    picture = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    bio = models.TextField(max_length=5000, blank=True)
    source = models.CharField(max_length=10, choices=Source.choices)
