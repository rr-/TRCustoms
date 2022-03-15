from datetime import timedelta

from django.utils import timezone

from trcustoms.celery import app, logger
from trcustoms.users.logic import deactivate_user, reject_user
from trcustoms.users.models import User
from trcustoms.utils import check_model_references


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
    for user in User.objects.filter(
        is_active=False,
        is_email_confirmed=False,
        date_joined__lte=timezone.now() - timedelta(hours=6),
    ).iterator():
        logger.info("%s: deleting inactive user", user.id)

        assert not check_model_references(user)

        if (
            user.authored_levels.exists()
            or user.authored_news.exists()
            or user.reviewed_levels.exists()
            or user.uploaded_levels.exists()
        ):
            deactivate_user(user, None, "Email not activated")
        else:
            reject_user(user, None, "Email not activated")
