from django.db import models

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo, UserContentDatesInfo
from trcustoms.levels.models import Level
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


@registry.register_model(
    name_getter=lambda instance: instance.level.name,
    meta_factory=lambda instance: {
        "level_id": instance.level.id,
        "level_name": instance.level.name,
    },
)
class Walkthrough(UserContentDatesInfo, DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="walkthroughs"
    )
    author = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="authored_walkthroughs",
    )
    legacy_author_name = models.CharField(max_length=64, null=True, blank=True)

    status = models.CharField(
        choices=WalkthroughStatus.choices,
        max_length=3,
        default=WalkthroughStatus.DRAFT,
    )
    rejection_reason = models.CharField(max_length=500, null=True, blank=True)

    walkthrough_type = models.CharField(
        choices=WalkthroughType.choices,
        max_length=3,
    )
    text = models.TextField()

    def __str__(self):
        author_name = (
            self.author.username
            if self.author
            else self.legacy_author_name or "Unknown"
        )
        return (
            f"Walkthrough for {self.level.name} "
            f"by {author_name} (id={self.id})"
        )
