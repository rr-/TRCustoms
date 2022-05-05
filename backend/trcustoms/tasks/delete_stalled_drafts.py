from datetime import timedelta

from django.utils import timezone

from trcustoms.audit_logs.utils import track_model_deletion
from trcustoms.celery import app, logger
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.models import Walkthrough


@app.task
def delete_stalled_drafts() -> None:
    for walkthrough in Walkthrough.objects.filter(
        status=WalkthroughStatus.DRAFT,
        created__lte=timezone.now() - timedelta(days=7),
    ):
        logger.info("deleting old walkthrough draft", walkthrough.level.name)
        track_model_deletion(walkthrough, request=None)
        walkthrough.delete()
