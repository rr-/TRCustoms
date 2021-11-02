"""User models."""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """User model."""

    bio = models.TextField(max_length=5000, blank=True, null=True)
