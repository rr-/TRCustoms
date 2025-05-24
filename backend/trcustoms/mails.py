from collections.abc import Iterable
from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import get_template
from premailer import transform

from trcustoms.celery import app as celery_app
from trcustoms.levels.models import Level
from trcustoms.ratings.models import Rating
from trcustoms.reviews.models import Review
from trcustoms.users.models import User
from trcustoms.users.tokens import ConfirmEmailToken, PasswordResetToken
from trcustoms.walkthroughs.models import Walkthrough

FROM = "admin@trcustoms.org"
PREFIX = "[TRCustoms]"
STATIC_DIR = Path(__file__).parent / "common" / "static"


def get_level_authors(level: Level) -> Iterable[User]:
    """
    Return distinct users who authored or uploaded the level for notification.
    """
    q_obj = Q(uploaded_levels=level)
    if not level.is_pending_approval:
        q_obj |= Q(authored_levels=level)

    # Return distinct User instances for this level
    return User.objects.filter(q_obj).distinct()


@celery_app.task(autoretry_for=(Exception,), retry_backoff=2)
def send_mail(
    template_name: str,
    subject: str,
    recipients: list[str],
    context: dict[str, str],
) -> None:
    plaintext = get_template(f"{template_name}.txt")
    html = get_template(f"{template_name}.html")

    logo_attachment_id = 100

    context.update(logo_url=f"cid:{logo_attachment_id}")

    msg_img = MIMEImage((STATIC_DIR / "mail_logo.png").read_bytes())
    msg_img.add_header("Content-ID", f"<{logo_attachment_id}>")

    text_content = plaintext.render(context)
    html_content = transform(html.render(context))
    msg = EmailMultiAlternatives(subject, text_content, FROM, recipients)
    msg.attach_alternative(html_content, "text/html")
    msg.attach(msg_img)
    msg.send()


def send_email_confirmation_mail(user: User) -> None:
    if not user.email:
        return
    token = ConfirmEmailToken.for_user(user)
    link = f"{settings.HOST_SITE}/email-confirmation/{token}"
    send_mail.delay(
        template_name="email_confirmation",
        subject=f"{PREFIX} Confirm your registration",
        recipients=[user.email],
        context={
            "username": user.username,
            "link": link,
        },
    )


def send_password_reset_mail(user: User) -> None:
    if not user.email:
        return
    token = PasswordResetToken.for_user(user)
    link = f"{settings.HOST_SITE}/password-reset/{token}"
    send_mail.delay(
        template_name="password_reset",
        subject=f"{PREFIX} Password reset",
        recipients=[user.email],
        context={
            "username": user.username,
            "link": link,
        },
    )


def send_welcome_mail(user: User) -> None:
    if not user.email:
        return
    send_mail.delay(
        template_name="welcome",
        subject=f"{PREFIX} Welcome to TRCustoms.org",
        recipients=[user.email],
        context={
            "username": user.username,
        },
    )


def send_registration_rejection_mail(user: User, reason: str) -> None:
    if not user.email:
        return
    send_mail.delay(
        template_name="registration_rejection",
        subject=f"{PREFIX} Registration rejected",
        recipients=[user.email],
        context={
            "username": user.username,
            "reason": reason,
        },
    )


def send_ban_mail(user: User, reason: str) -> None:
    if not user.email:
        return
    send_mail.delay(
        template_name="ban",
        subject=f"{PREFIX} Account banned",
        recipients=[user.email],
        context={
            "username": user.username,
            "reason": reason,
        },
    )


def send_unban_mail(user: User) -> None:
    if not user.email:
        return
    send_mail.delay(
        template_name="unban",
        subject=f"{PREFIX} Account unbanned",
        recipients=[user.email],
        context={"username": user.username},
    )


def send_level_submitted_mail(level: Level) -> None:
    if not level.uploader or not level.uploader.email:
        return
    link = f"{settings.HOST_SITE}/levels/{level.id}"
    send_mail.delay(
        template_name="level_submission",
        subject=f"{PREFIX} Level submitted",
        recipients=[level.uploader.email],
        context={
            "username": level.uploader.username,
            "level_name": level.name,
            "link": link,
        },
    )


def send_level_approved_mail(level: Level) -> None:
    link = f"{settings.HOST_SITE}/levels/{level.id}"
    for username, email in get_level_authors(level):
        send_mail.delay(
            template_name="level_approval",
            subject=f"{PREFIX} Level approved",
            recipients=[email],
            context={
                "username": username,
                "level_name": level.name,
                "link": link,
            },
        )


def send_level_rejected_mail(level: Level, reason: str) -> None:
    for username, email in get_level_authors(level):
        link = f"{settings.HOST_SITE}/levels/{level.id}"
        send_mail.delay(
            template_name="level_rejection",
            subject=f"{PREFIX} Level rejected",
            recipients=[email],
            context={
                "username": username,
                "level_name": level.name,
                "reason": reason,
                "link": link,
            },
        )


def send_review_submission_mail(review: Review) -> None:
    link = f"{settings.HOST_SITE}/levels/{review.level.id}"
    for user in get_level_authors(review.level):
        if not user.settings.email_review_posted:
            continue
        send_mail.delay(
            template_name="review_submission",
            subject=f"{PREFIX} New review",
            recipients=[user.email],
            context={
                "username": user.username,
                "reviewer_username": review.author.username,
                "level_name": review.level.name,
                "link": link,
            },
        )


def send_review_update_mail(review: Review) -> None:
    link = f"{settings.HOST_SITE}/levels/{review.level.id}"
    for user in get_level_authors(review.level):
        if not user.settings.email_review_updated:
            continue
        send_mail.delay(
            template_name="review_update",
            subject=f"{PREFIX} Review edited",
            recipients=[user.email],
            context={
                "username": user.username,
                "reviewer_username": review.author.username,
                "level_name": review.level.name,
                "link": link,
            },
        )


def send_rating_submission_mail(rating: Rating) -> None:
    link = f"{settings.HOST_SITE}/levels/{rating.level.id}"
    for user in get_level_authors(rating.level):
        if not user.settings.email_rating_posted:
            continue
        send_mail.delay(
            template_name="rating_submission",
            subject=f"{PREFIX} New rating",
            recipients=[user.email],
            context={
                "username": user.username,
                "rater_username": rating.author.username,
                "level_name": rating.level.name,
                "link": link,
            },
        )


def send_rating_update_mail(rating: Rating) -> None:
    link = f"{settings.HOST_SITE}/levels/{rating.level.id}"
    for user in get_level_authors(rating.level):
        if not user.settings.email_rating_updated:
            continue
        send_mail.delay(
            template_name="rating_update",
            subject=f"{PREFIX} Rating edited",
            recipients=[user.email],
            context={
                "username": user.username,
                "rater_username": rating.author.username,
                "level_name": rating.level.name,
                "link": link,
            },
        )


def send_walkthrough_approved_mail(walkthrough: Walkthrough) -> None:
    link = f"{settings.HOST_SITE}/walkthroughs/{walkthrough.id}"
    if walkthrough.author:
        send_mail.delay(
            template_name="walkthrough_approval",
            subject=f"{PREFIX} Walkthrough approved",
            recipients=[walkthrough.author.email],
            context={
                "username": walkthrough.author.username,
                "level_name": walkthrough.level.name,
                "link": link,
            },
        )


def send_walkthrough_rejected_mail(
    walkthrough: Walkthrough, reason: str
) -> None:
    link = f"{settings.HOST_SITE}/walkthroughs/{walkthrough.id}"
    if walkthrough.author:
        send_mail.delay(
            template_name="walkthrough_rejection",
            subject=f"{PREFIX} Walkthrough rejected",
            recipients=[walkthrough.author.email],
            context={
                "username": walkthrough.author.username,
                "level_name": walkthrough.level.name,
                "reason": reason,
                "link": link,
            },
        )


def send_walkthrough_submission_mail(walkthrough: Walkthrough) -> None:
    link = f"{settings.HOST_SITE}/walkthroughs/{walkthrough.id}"
    for user in get_level_authors(walkthrough.level):
        if not user.settings.email_walkthrough_posted:
            continue
        send_mail.delay(
            template_name="walkthrough_submission",
            subject=f"{PREFIX} New walkthrough",
            recipients=[user.email],
            context={
                "username": user.username,
                "author_username": walkthrough.author.username,
                "level_name": walkthrough.level.name,
                "link": link,
            },
        )


def send_walkthrough_update_mail(walkthrough: Walkthrough) -> None:
    link = f"{settings.HOST_SITE}/walkthroughs/{walkthrough.id}"
    for user in get_level_authors(walkthrough.level):
        if not user.settings.email_walkthrough_updated:
            continue
        send_mail.delay(
            template_name="walkthrough_update",
            subject=f"{PREFIX} Walkthrough edited",
            recipients=[user.email],
            context={
                "username": user.username,
                "author_username": walkthrough.author.username,
                "level_name": walkthrough.level.name,
                "link": link,
            },
        )
