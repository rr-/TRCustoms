from django.db import models

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo
from trcustoms.levels.models import Level
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughType


@registry.register_model(
    name_getter=lambda instance: instance.level.name,
    meta_factory=lambda instance: {
        "level_id": instance.level.id,
        "level_name": instance.level.name,
    },
)
class Walkthrough(DatesInfo):
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

    is_pending_approval = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=200, null=True, blank=True)

    walkthrough_type = models.CharField(
        choices=WalkthroughType.choices,
        max_length=3,
    )
    text = models.TextField(max_length=50000)

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