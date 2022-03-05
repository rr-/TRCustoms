from trcustoms.celery import app, logger
from trcustoms.uploads.models import UploadedFile
from trcustoms.utils import check_model_references


@app.task
def delete_unreferenced_files() -> None:
    for uploaded_file in UploadedFile.objects.filter(
        level__isnull=True,
        levelfile__isnull=True,
        levelscreenshot__isnull=True,
        user__isnull=True,
    ):
        logger.info("%s: deleting unused file", uploaded_file.md5sum)

        assert not check_model_references(uploaded_file)

        uploaded_file.delete()
