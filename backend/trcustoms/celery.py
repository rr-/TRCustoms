"""Celery configuration."""

import os

from celery import Celery, Task

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trcustoms.settings")

app = Celery("trcustoms")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self: Task) -> None:
    """A debug Celery task."""
    print(f"Request: {self.request!r}")
