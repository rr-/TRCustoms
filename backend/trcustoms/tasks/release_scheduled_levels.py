from trcustoms.celery import app, logger
from trcustoms.levels.logic import release_level
from trcustoms.levels.models import Level


@app.task
def release_scheduled_levels() -> None:
    """Release approved levels whose release date has come.

    Recount the stats of everyone involved, recheck their awards and post
    the level to Discord. Levels approved on or after their release date
    are announced on approval instead, so they never show up here.
    """
    for level in Level.objects.public().filter(announced_at=None).iterator():
        logger.info("%s: releasing scheduled level", level.id)
        release_level(level)
