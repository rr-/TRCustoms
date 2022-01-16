"""Definitions of asynchronous tasks."""

from typing import Any

from celery import Celery
from celery.schedules import crontab

from trcustoms.celery import app
from trcustoms.tasks.delete_unreferenced_files import delete_unreferenced_files
from trcustoms.tasks.merge_duplicate_files import merge_duplicate_files


@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs: Any) -> None:
    """Set up tasks that run in fixed intervals of time."""

    sender.add_periodic_task(
        crontab(hour=3, minute=0), merge_duplicate_files.s()
    )
    sender.add_periodic_task(
        crontab(hour=4, minute=0), delete_unreferenced_files.s()
    )


__all__ = [
    "delete_unreferenced_files",
    "merge_duplicate_files",
]
