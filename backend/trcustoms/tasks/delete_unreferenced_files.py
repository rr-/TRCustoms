import re
from collections.abc import Iterable
from datetime import timedelta

from django.utils import timezone

from trcustoms.celery import app, logger
from trcustoms.levels.models import Level
from trcustoms.news.models import News
from trcustoms.reviews.models import Review
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User
from trcustoms.utils import check_model_references
from trcustoms.walkthroughs.models import Walkthrough


def collect_links(text: str | None) -> Iterable[str]:
    if not text:
        return
    for match in re.finditer(r"\[[^\]]*\]\((?P<url>[^)]+)\)", text):
        yield match.group("url")


def collect_user_links() -> Iterable[str]:
    for news in News.objects.values("text"):
        yield from collect_links(news["text"])
    for user in User.objects.values("bio"):
        yield from collect_links(user["bio"])
    for level in Level.objects.values("description"):
        yield from collect_links(level["description"])
    for review in Review.objects.values("text"):
        yield from collect_links(review["text"])
    for walkthrough in Walkthrough.objects.values("text"):
        yield from collect_links(walkthrough["text"])


def delete_if_unreferenced(uploaded_file: UploadedFile, dry_run: bool) -> None:
    # The queries above list the relations we know about; anything else still
    # pointing at the file means this task has fallen behind a new model, so
    # skip the file rather than delete something that is in use.
    if check_model_references(uploaded_file):
        logger.warning(
            "%s: file looks unused, but is still referenced - skipping",
            uploaded_file.md5sum,
        )
        return
    logger.info("%s: deleting unused file", uploaded_file.md5sum)
    if not dry_run:
        uploaded_file.delete()


@app.task
def delete_unreferenced_files(dry_run: bool = False) -> None:
    for uploaded_file in UploadedFile.objects.filter(
        level__isnull=True,
        levelfile__isnull=True,
        levelscreenshot__isnull=True,
        user__isnull=True,
        event__isnull=True,
        created__lte=(timezone.now() - timedelta(hours=24)),
    ).exclude(upload_type=UploadType.ATTACHMENT):
        delete_if_unreferenced(uploaded_file, dry_run)

    links = set(collect_user_links())

    for uploaded_file in UploadedFile.objects.filter(
        created__lte=(timezone.now() - timedelta(hours=24)),
        upload_type=UploadType.ATTACHMENT,
        content__isnull=False,
    ):
        name = uploaded_file.content.name

        if any(name in link for link in links):
            continue

        delete_if_unreferenced(uploaded_file, dry_run)
