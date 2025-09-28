import hashlib
from collections import defaultdict
from urllib.parse import urljoin

from django.conf import settings
from django.core.cache import cache
from django.db.models import F, Max, Min, Sum, Value
from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_update,
)
from trcustoms.common.utils.discord import send_discord_webhook
from trcustoms.levels.models import Level, LevelFile
from trcustoms.mails import send_level_approved_mail, send_level_rejected_mail
from trcustoms.ratings.consts import RatingType
from trcustoms.ratings.models import RatingTemplateQuestion
from trcustoms.tasks import update_awards


def send_level_submission_discord_notification(level: Level) -> None:
    level_url = urljoin(settings.HOST_SITE, f"/levels/{level.id}")
    description = ""
    if level.authors.count() > 1:
        description += "by Multiple authors"
    elif author := level.authors.first():
        description += f"by {author.username}"

    embed = {
        "color": 0x2196F3,
        "url": level_url,
        "title": level.name,
        "description": description,
    }
    if level.cover:
        embed["image"] = {
            "url": urljoin(settings.HOST_SITE, level.cover.content.url)
        }

    send_discord_webhook(
        {"embeds": [embed]}, webhook_url=settings.DISCORD_WEBHOOK_LEVEL_URL
    )


def approve_level(level: Level, request: Request | None) -> None:
    with track_model_update(
        obj=level, request=request, changes=["Approved"], notify=True
    ):
        send_mail = not level.is_approved
        level.is_pending_approval = False
        level.is_approved = True
        if send_mail:
            send_level_approved_mail(level)
            send_level_submission_discord_notification(level)

        level.rejection_reason = None
        level.save()
        for author in level.authors.iterator():
            update_awards.delay(author.pk)
    clear_audit_log_action_flags(obj=level)


def reject_level(level: Level, request: Request | None, reason: str) -> None:
    clear_audit_log_action_flags(obj=level)
    with track_model_update(
        obj=level,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
        is_action_required=True,
        notify=True,
    ):
        if level.is_approved or reason != level.rejection_reason:
            send_level_rejected_mail(level, reason)
        level.is_pending_approval = False
        level.is_approved = False
        level.rejection_reason = reason
        level.save()


def get_category_ratings(level: Level) -> None:
    category_to_min_points = defaultdict(int)
    category_to_max_points = defaultdict(int)
    for question in (
        RatingTemplateQuestion.objects.annotate(
            min_points=Min(F("answers__points") * F("weight")),
            max_points=Max(F("answers__points") * F("weight")),
        )
        .order_by("position")
        .values_list(
            "category", "min_points", "max_points", "weight", named=True
        )
    ):
        category_to_min_points[question.category] += question.min_points
        category_to_max_points[question.category] += question.max_points

    category_to_total_points = {
        entry.category: entry.category_sum
        for entry in (
            level.ratings.filter(rating_type=RatingType.TRC)
            .annotate(category=F("answers__question__category"))
            .values("category")
            .annotate(
                category_sum=Sum(
                    F("answers__points") * F("answers__question__weight")
                )
                / Value(
                    level.ratings.filter(rating_type=RatingType.TRC).count()
                )
            )
            .values_list("category", "category_sum", named=True)
        )
    }

    categories = category_to_max_points.keys()

    data = [
        {
            "category": category,
            "total_points": category_to_total_points.get(category, 0),
            "min_points": category_to_min_points[category],
            "max_points": category_to_max_points[category],
        }
        for category in categories
    ]

    return data


def increment_download_counter(file: LevelFile, request: Request) -> None:
    """Increment download count only once per fingerprint within expiration."""
    ip: str = request.META.get("REMOTE_ADDR", "")
    agent: str = request.META.get("HTTP_USER_AGENT", "")
    level_id: int = file.level_id
    raw_fp: str = f"{ip}:{agent}:{level_id}"
    print(raw_fp)
    fp_key: str = hashlib.sha256(raw_fp.encode("utf-8")).hexdigest()
    if cache.get(fp_key):
        return

    file.download_count += 1
    file.save(update_fields=["download_count"])
    print("what")
    cache.set(
        fp_key,
        True,
        timeout=int(settings.DOWNLOAD_FINGERPRINT_EXPIRATION.total_seconds()),
    )
