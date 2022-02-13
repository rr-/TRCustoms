from enum import Enum

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.models.uploaded_file import UploadedFile


class UserPermission(Enum):
    EDIT_LEVELS = "edit_levels"
    EDIT_REVIEWS = "edit_reviews"
    EDIT_TAGS = "edit_tags"
    EDIT_USERS = "edit_users"
    LIST_USERS = "list_users"
    REVIEW_AUDIT_LOGS = "review_audit_logs"
    REVIEW_LEVELS = "review_levels"
    UPLOAD_LEVELS = "upload_levels"


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


@registry.register_model(name_getter=lambda instance: instance.username)
class User(AbstractUser):
    objects = UserManager()

    class Meta(AbstractUser.Meta):
        constraints = [
            UniqueConstraint(Lower("username"), name="user_username_unique"),
        ]
        default_permissions = []
        permissions = [
            (UserPermission.EDIT_LEVELS.value, "Can edit levels"),
            (UserPermission.EDIT_REVIEWS.value, "Can edit reviews"),
            (UserPermission.EDIT_TAGS.value, "Can edit tags"),
            (UserPermission.EDIT_USERS.value, "Can edit users"),
            (UserPermission.LIST_USERS.value, "Can list users"),
            (UserPermission.REVIEW_AUDIT_LOGS.value, "Can review audit logs"),
            (UserPermission.REVIEW_LEVELS.value, "Can review levels"),
            (UserPermission.UPLOAD_LEVELS.value, "Can upload levels"),
        ]

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

    is_pending_activation = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=200, null=True, blank=True)
