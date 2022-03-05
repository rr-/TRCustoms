from django.db import models

from trcustoms.audit_logs import registry
from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


@registry.register_model(name_getter=lambda instance: instance.subject)
class News(DatesInfo):
    authors = models.ManyToManyField(User, related_name="authored_news")
    subject = models.TextField(max_length=200, null=True, blank=True)
    text = models.TextField(max_length=5000, null=True, blank=True)

    class Meta:
        ordering = ["-created"]
        default_permissions = []
        verbose_name_plural = "News"

    def __str__(self) -> str:
        return f"{self.subject} (id={self.pk})"
