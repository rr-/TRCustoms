from django.contrib.auth.models import AbstractUser
from django.db import models

from trcustoms.utils import RandomFileName


class User(AbstractUser):
    picture = models.ImageField(
        blank=True, null=True, upload_to=RandomFileName("avatars")
    )
    bio = models.TextField(max_length=5000, blank=True, null=True)
