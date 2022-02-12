from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.models.uploaded_file import UploadedFile


class UserPermission:
    EDIT_USERS = "edit_users"
    LIST_USERS = "list_users"
    UPLOAD_LEVELS = "upload_levels"
    EDIT_LEVELS = "edit_levels"
    REVIEW_LEVELS = "review_levels"
    EDIT_REVIEWS = "edit_reviews"
    REVIEW_AUDIT_LOGS = "review_audit_logs"
    EDIT_TAGS = "edit_tags"


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

    @property
    def permissions(self) -> list[UserPermission]:
        permissions = {
            UserPermission.LIST_USERS,
            UserPermission.REVIEW_LEVELS,
            UserPermission.UPLOAD_LEVELS,
        }
        if self.is_staff:
            permissions |= {
                UserPermission.EDIT_TAGS,
                UserPermission.EDIT_USERS,
                UserPermission.EDIT_LEVELS,
                UserPermission.EDIT_REVIEWS,
                UserPermission.REVIEW_AUDIT_LOGS,
            }
        return sorted(permissions)
