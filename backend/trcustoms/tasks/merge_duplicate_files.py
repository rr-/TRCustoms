from django.db.models import Count

from trcustoms.celery import app, logger
from trcustoms.models import LevelFile, LevelMedium, UploadedFile, User
from trcustoms.utils import check_model_references


@app.task
def merge_duplicate_files() -> None:
    for result in (
        UploadedFile.objects.values("md5sum")
        .annotate(dupe_count=Count("md5sum"))
        .filter(dupe_count__gt=1)
    ):
        md5sum = result["md5sum"]
        dupe_count = result["dupe_count"]

        logger.info(f"{md5sum}: merging {dupe_count} dupes")

        chosen = UploadedFile.objects.filter(md5sum=md5sum).first()
        rest = UploadedFile.objects.filter(md5sum=md5sum).exclude(pk=chosen.pk)

        LevelFile.objects.filter(file__in=rest).update(file=chosen)
        LevelMedium.objects.filter(file__in=rest).update(file=chosen)
        User.objects.filter(picture__in=rest).update(picture=chosen)

        assert not any(check_model_references(model) for model in rest)

        rest.delete()
