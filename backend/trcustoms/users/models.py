from datetime import timedelta
from enum import Enum

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower
from rest_framework_simplejwt.tokens import Token

from trcustoms.audit_logs import registry
from trcustoms.common.models import Country
from trcustoms.uploads.models import UploadedFile


class ConfirmEmailToken(Token):
    token_type = "access"
    lifetime = timedelta(hours=6)


class PasswordResetToken(Token):
    token_type = "password_reset"
    lifetime = timedelta(hours=1)


class UserPermission(Enum):
    DELETE_LEVELS = "delete_levels"
    EDIT_LEVELS = "edit_levels"
    EDIT_NEWS = "edit_news"
    EDIT_REVIEWS = "edit_reviews"
    EDIT_TAGS = "edit_tags"
    EDIT_USERS = "edit_users"
    LIST_USERS = "list_users"
    REVIEW_AUDIT_LOGS = "review_audit_logs"
    REVIEW_LEVELS = "review_levels"
    UPLOAD_LEVELS = "upload_levels"
    VIEW_USERS = "view_users"


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
            (UserPermission.EDIT_NEWS.value, "Can edit news"),
            (UserPermission.EDIT_USERS.value, "Can edit users"),
            (UserPermission.LIST_USERS.value, "Can list users"),
            (UserPermission.VIEW_USERS.value, "Can view users"),
            (UserPermission.REVIEW_AUDIT_LOGS.value, "Can review audit logs"),
            (UserPermission.REVIEW_LEVELS.value, "Can review levels"),
            (UserPermission.UPLOAD_LEVELS.value, "Can upload levels"),
        ]

    class Source(models.TextChoices):
        trle = "trle", "trle.net"
        trcustoms = "trcustoms", "trcustoms"

    trle_reviewer_id = models.IntegerField(blank=True, null=True)
    trle_author_id = models.IntegerField(blank=True, null=True)

    picture = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    bio = models.TextField(max_length=5000, blank=True)
    source = models.CharField(max_length=10, choices=Source.choices)

    is_email_confirmed = models.BooleanField(default=False)
    is_pending_activation = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=200, null=True, blank=True)

    country = models.ForeignKey(
        Country, null=True, blank=True, on_delete=models.SET_NULL
    )

    @property
    def is_placeholder(self) -> bool:
        return not self.has_usable_password() and not self.is_active

    def generate_email_token(self) -> str:
        return str(ConfirmEmailToken.for_user(self))

    def generate_password_reset_token(self) -> str:
        return str(PasswordResetToken.for_user(self))
