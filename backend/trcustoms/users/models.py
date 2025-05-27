from enum import Enum

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager as BaseUserManager
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.common.models import Country
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.consts import UserSource
from trcustoms.walkthroughs.consts import WalkthroughStatus


class UserPermission(Enum):
    UPLOAD_LEVELS = "upload_levels"
    EDIT_LEVELS = "edit_levels"
    DELETE_LEVELS = "delete_levels"
    VIEW_PENDING_LEVELS = "view_pending_levels"

    DELETE_WALKTHROUGHS = "delete_walkthroughs"

    VIEW_USERS = "view_users"
    LIST_USERS = "list_users"
    MANAGE_USERS = "manage_users"
    EDIT_USERS = "edit_users"

    REVIEW_LEVELS = "review_levels"
    EDIT_REVIEWS = "edit_reviews"
    DELETE_REVIEWS = "delete_reviews"

    RATE_LEVELS = "rate_levels"
    EDIT_RATINGS = "edit_ratings"
    DELETE_RATINGS = "delete_ratings"

    EDIT_PLAYLISTS = "edit_playlists"

    POST_WALKTHROUGHS = "post_walkthroughs"
    EDIT_WALKTHROUGHS = "edit_walkthroughs"

    EDIT_NEWS = "edit_news"
    EDIT_TAGS = "edit_tags"
    REVIEW_AUDIT_LOGS = "review_audit_logs"


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
            (UserPermission.DELETE_RATINGS.value, "Can delete ratings"),
            (
                UserPermission.DELETE_WALKTHROUGHS.value,
                "Can delete walkthroughs",
            ),
            (UserPermission.EDIT_LEVELS.value, "Can edit levels"),
            (UserPermission.EDIT_REVIEWS.value, "Can edit reviews"),
            (UserPermission.EDIT_RATINGS.value, "Can edit ratings"),
            (UserPermission.EDIT_WALKTHROUGHS.value, "Can edit walkthroughs"),
            (UserPermission.EDIT_TAGS.value, "Can edit tags"),
            (UserPermission.EDIT_NEWS.value, "Can edit news"),
            (UserPermission.EDIT_USERS.value, "Can edit users"),
            (UserPermission.MANAGE_USERS.value, "Can manage users"),
            (UserPermission.LIST_USERS.value, "Can list users"),
            (UserPermission.VIEW_USERS.value, "Can view users"),
            (UserPermission.REVIEW_AUDIT_LOGS.value, "Can review audit logs"),
            (UserPermission.REVIEW_LEVELS.value, "Can review levels"),
            (UserPermission.RATE_LEVELS.value, "Can rate levels"),
            (UserPermission.UPLOAD_LEVELS.value, "Can upload levels"),
            (UserPermission.POST_WALKTHROUGHS.value, "Can post walkthroughs"),
            (UserPermission.EDIT_PLAYLISTS.value, "Can edit playlists"),
            (
                UserPermission.VIEW_PENDING_LEVELS.value,
                "Can view pending levels",
            ),
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

    played_level_count = models.PositiveIntegerField(default=0)
    authored_level_count_all = models.PositiveIntegerField(default=0)
    authored_level_count_approved = models.PositiveIntegerField(default=0)
    rated_level_count = models.PositiveIntegerField(default=0)
    reviewed_level_count = models.PositiveIntegerField(default=0)
    authored_walkthrough_count_all = models.PositiveIntegerField(default=0)
    authored_walkthrough_count_approved = models.PositiveIntegerField(
        default=0
    )

    @property
    def is_placeholder(self) -> bool:
        return not self.has_usable_password() and not self.is_active

    def update_rated_level_count(self, save: bool = True) -> None:
        self.rated_level_count = self.rated_levels.filter(
            level__is_approved=True
        ).count()
        if save:
            self.save(update_fields=["rated_level_count"])

    def update_reviewed_level_count(self, save: bool = True) -> None:
        self.reviewed_level_count = self.reviewed_levels.filter(
            level__is_approved=True
        ).count()
        if save:
            self.save(update_fields=["reviewed_level_count"])

    def update_played_level_count(self, save: bool = True) -> None:
        self.played_level_count = self.playlist_items.played().count()
        if save:
            self.save(update_fields=["played_level_count"])

    def update_authored_level_count(self, save: bool = True) -> None:
        self.authored_level_count_all = self.authored_levels.count()
        self.authored_level_count_approved = self.authored_levels.filter(
            is_approved=True
        ).count()
        if save:
            self.save(
                update_fields=[
                    "authored_level_count_all",
                    "authored_level_count_approved",
                ]
            )

    def update_authored_walkthrough_count(self, save: bool = True) -> None:
        self.authored_walkthrough_count_all = (
            self.authored_walkthroughs.count()
        )
        self.authored_walkthrough_count_approved = (
            self.authored_walkthroughs.filter(
                status=WalkthroughStatus.APPROVED
            ).count()
        )
        if save:
            self.save(
                update_fields=[
                    "authored_walkthrough_count_all",
                    "authored_walkthrough_count_approved",
                ]
            )


class UserSettings(models.Model):
    user = models.OneToOneField(
        User, related_name="settings", on_delete=models.CASCADE
    )
    email_review_posted = models.BooleanField(default=True)
    email_rating_posted = models.BooleanField(default=True)
    email_walkthrough_posted = models.BooleanField(default=True)
    email_review_updated = models.BooleanField(default=False)
    email_rating_updated = models.BooleanField(default=False)
    email_walkthrough_updated = models.BooleanField(default=False)


# Auto-create UserSettings on access if it doesn't exist
def _get_user_settings(self):
    settings, _ = UserSettings.objects.get_or_create(user=self)
    return settings


User.settings = property(_get_user_settings)
