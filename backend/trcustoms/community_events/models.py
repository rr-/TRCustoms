from django.db import models
from django.db.models import Count, Q

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo
from trcustoms.levels.models import Level
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User


class EventManager(models.Manager):
    def with_counts(self):
        # Annotate with count of approved levels only
        return self.annotate(
            level_count=Count("levels", filter=Q(levels__is_approved=True))
        )


@registry.register_model(name_getter=lambda instance: instance.name)
class Event(DatesInfo):
    name = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, null=True, blank=True)
    cover_image = models.ForeignKey(
        UploadedFile, null=True, blank=True, on_delete=models.SET_NULL
    )
    year = models.PositiveIntegerField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    collection_release = models.DateTimeField()
    host = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL
    )
    levels = models.ManyToManyField(Level, blank=True, related_name="events")

    objects = EventManager()

    class Meta:
        ordering = ["-collection_release"]
        default_permissions = []
        verbose_name_plural = "Events"

    def __str__(self):
        return f"{self.name} (id={self.pk})"


@registry.register_model(
    name_getter=(
        lambda instance: f"{instance.event.name} - place {instance.place}"
    )
)
class Winner(DatesInfo):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="winners"
    )
    place = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ["place"]
        default_permissions = []

    def __str__(self):
        return f"{self.event.name} winner #{self.place}: {self.user.username}"
