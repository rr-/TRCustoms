from datetime import timedelta

from django.utils import timezone

from trcustoms.celery import app, logger
from trcustoms.users.logic import reject_user
from trcustoms.users.models import User


@app.task
def prune_unused_accounts() -> None:
    """Delete old inactive user accounts.

    - Must be inactive, otherwise we'd be deleting normal accounts.
    - Must have email not confirmed, otherwise we'd delete accounts that are
      awaiting activation from staff.
    - Must have no associated news, levels or reviews, otherwise we'd be
      removing authorship information.
    - Doesn't matter if the account came from TRLE or TRC.
    """
    for user in (
        User.objects.filter(
            is_active=False,
            is_email_confirmed=False,
            date_joined__lte=timezone.now() - timedelta(hours=6),
        )
        .exclude(email="")
        .iterator()
    ):
        logger.info("%s: deleting inactive user", user.id)

        reject_user(user, None, "Unconfirmed email")
