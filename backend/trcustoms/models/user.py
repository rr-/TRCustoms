from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import Count

from trcustoms.utils import RandomFileName


class UserManager(BaseUserManager):
    def with_counts(self):
        return self.annotate(authored_level_count=Count("authored_levels"))


class User(AbstractUser):
    objects = UserManager()

    class Source(models.TextChoices):
        trle = "trle", "trle.net"
        trcustoms = "trcustoms", "trcustoms"

    trle_reviewer_id = models.CharField(max_length=32, blank=True, null=True)
    trle_author_id = models.CharField(max_length=32, blank=True, null=True)

    picture = models.ImageField(
        blank=True, null=True, upload_to=RandomFileName("avatars")
    )
    bio = models.TextField(max_length=5000, blank=True)
    source = models.CharField(max_length=10, choices=Source.choices)