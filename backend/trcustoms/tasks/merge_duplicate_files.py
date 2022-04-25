from django.db.models import Count

from trcustoms.celery import app, logger
from trcustoms.levels.models import Level, LevelFile, LevelScreenshot
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User
from trcustoms.utils import check_model_references


@app.task
def merge_duplicate_files() -> None:
    for result in (
        UploadedFile.objects.exclude(
            upload_type=UploadedFile.UploadType.ATTACHMENT
        )
        .values("md5sum", "upload_type")
        .annotate(dupe_count=Count("md5sum"))
        .filter(dupe_count__gt=1)
    ):
        md5sum = result["md5sum"]
        dupe_count = result["dupe_count"]
        upload_type = result["upload_type"]

        logger.info(
            f"{md5sum}: merging {dupe_count} dupes of type {upload_type}"
        )

        chosen = UploadedFile.objects.filter(
            md5sum=md5sum, upload_type=upload_type
        ).first()
        rest = UploadedFile.objects.filter(
            md5sum=md5sum, upload_type=upload_type
        ).exclude(pk=chosen.pk)

        Level.objects.filter(cover__in=rest).update(cover=chosen)
        LevelFile.objects.filter(file__in=rest).update(file=chosen)
        LevelScreenshot.objects.filter(file__in=rest).update(file=chosen)
        User.objects.filter(picture__in=rest).update(picture=chosen)

        assert not any(check_model_references(model) for model in rest)

        rest.delete()
