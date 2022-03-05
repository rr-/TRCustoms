from trcustoms.audit_logs.utils import track_model_deletion
from trcustoms.celery import app, logger
from trcustoms.tags.models import Tag
from trcustoms.utils import check_model_references


@app.task
def delete_unreferenced_tags() -> None:
    for tag in Tag.objects.filter(
        level__isnull=True,
    ):
        logger.info("%s: deleting unused name", tag.name)

        assert not check_model_references(tag)

        track_model_deletion(tag, request=None)
        tag.delete()
