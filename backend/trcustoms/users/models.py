from datetime import timedelta
from enum import Enum

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from rest_framework_simplejwt.tokens import Token

from trcustoms.audit_logs import registry
from trcustoms.common.models import Country
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.consts import UserSource
from trcustoms.walkthroughs.consts import WalkthroughStatus


class ConfirmEmailToken(Token):
    token_type = "access"
    lifetime = timedelta(hours=6)


class PasswordResetToken(Token):
    token_type = "password_reset"
    lifetime = timedelta(hours=1)


class UserPermission(Enum):
    DELETE_LEVELS = "delete_levels"
    DELETE_REVIEWS = "delete_reviews"
    DELETE_WALKTHROUGHS = "delete_walkthroughs"
    EDIT_LEVELS = "edit_levels"
    EDIT_NEWS = "edit_news"
    EDIT_REVIEWS = "edit_reviews"
    EDIT_TAGS = "edit_tags"
    EDIT_USERS = "edit_users"
    MANAGE_USERS = "manage_users"
    LIST_USERS = "list_users"
    REVIEW_AUDIT_LOGS = "review_audit_logs"
    REVIEW_LEVELS = "review_levels"
    UPLOAD_LEVELS = "upload_levels"
    VIEW_USERS = "view_users"
    POST_WALKTHROUGHS = "post_walkthroughs"
    EDIT_WALKTHROUGHS = "edit_walkthroughs"
    EDIT_PLAYLISTS = "edit_playlists"


class UserManager(BaseUserManager):
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
            (UserPermission.DELETE_LEVELS.value, "Can delete levels"),
            (UserPermission.DELETE_REVIEWS.value, "Can delete reviews"),
            (
                UserPermission.DELETE_WALKTHROUGHS.value,
                "Can delete walkthroughs",
            ),
            (UserPermission.EDIT_LEVELS.value, "Can edit levels"),
            (UserPermission.EDIT_REVIEWS.value, "Can edit reviews"),
            (UserPermission.EDIT_WALKTHROUGHS.value, "Can edit walkthroughs"),
            (UserPermission.EDIT_TAGS.value, "Can edit tags"),
            (UserPermission.EDIT_NEWS.value, "Can edit news"),
            (UserPermission.EDIT_USERS.value, "Can edit users"),
            (UserPermission.MANAGE_USERS.value, "Can manage users"),
            (UserPermission.LIST_USERS.value, "Can list users"),
            (UserPermission.VIEW_USERS.value, "Can view users"),
            (UserPermission.REVIEW_AUDIT_LOGS.value, "Can review audit logs"),
            (UserPermission.REVIEW_LEVELS.value, "Can review levels"),
            (UserPermission.UPLOAD_LEVELS.value, "Can upload levels"),
            (UserPermission.POST_WALKTHROUGHS.value, "Can post walkthroughs"),
            (UserPermission.EDIT_PLAYLISTS.value, "Can edit playlists"),
        ]

    trle_reviewer_id = models.IntegerField(blank=True, null=True)
    trle_author_id = models.IntegerField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True, max_length=256)
    donation_url = models.URLField(blank=True, null=True, max_length=256)

    picture = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    bio = models.TextField(max_length=5000, blank=True)
    source = models.CharField(max_length=10, choices=UserSource.choices)

    is_email_confirmed = models.BooleanField(default=False)
    is_pending_activation = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    ban_reason = models.CharField(max_length=500, null=True, blank=True)

    country = models.ForeignKey(
        Country, null=True, blank=True, on_delete=models.SET_NULL
    )

    authored_level_count = models.PositiveIntegerField(default=0)
    reviewed_level_count = models.PositiveIntegerField(default=0)
    authored_walkthrough_count = models.PositiveIntegerField(default=0)

    @property
    def is_placeholder(self) -> bool:
        return not self.has_usable_password() and not self.is_active

    def generate_email_token(self) -> str:
        return str(ConfirmEmailToken.for_user(self))

    def generate_password_reset_token(self) -> str:
        return str(PasswordResetToken.for_user(self))

    def update_reviewed_level_count(self) -> None:
        self.reviewed_level_count = self.reviewed_levels.filter(
            level__is_approved=True
        ).count()
        self.save(update_fields=["reviewed_level_count"])

    def update_authored_level_count(self) -> None:
        self.authored_level_count = self.authored_levels.filter(
            is_approved=True
        ).count()
        self.save(update_fields=["authored_level_count"])

    def update_authored_walkthrough_count(self) -> None:
        self.authored_walkthrough_count = self.authored_walkthroughs.filter(
            status=WalkthroughStatus.APPROVED
        ).count()
        self.save(update_fields=["authored_walkthrough_count"])
