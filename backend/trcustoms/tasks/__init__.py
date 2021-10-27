"""Definitions of asynchronous tasks."""

from typing import Any

from celery import Celery
from celery.schedules import crontab

from trcustoms.celery import app


@app.on_after_finalize.connect
def setup_periodic_tasks(**_kwargs: Any) -> None:
    """Set up tasks that run in fixed intervals of time."""
