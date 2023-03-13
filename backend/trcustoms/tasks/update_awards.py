from trcustoms.awards.logic import update_awards as recalculate
from trcustoms.celery import app
from trcustoms.users.models import User


@app.task
def update_awards(user_id: int, **kwargs) -> None:
    user = User.objects.get(pk=user_id)
    recalculate(user, **kwargs)
