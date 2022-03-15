from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models import Q
from django.template.loader import get_template
from premailer import transform

from trcustoms.levels.models import Level
from trcustoms.users.models import User

FROM = "admin@trcustoms.org"
PREFIX = "[TRCustoms]"
STATIC_DIR = Path(__file__).parent / "common" / "static"


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
    token = user.generate_email_token()
    link = f"{settings.HOST_SITE}/email-confirmation/{token}"
    send_mail(
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
    token = user.generate_password_reset_token()
    link = f"{settings.HOST_SITE}/password-reset/{token}"
    send_mail(
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
    send_mail(
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
    send_mail(
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
    send_mail(
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
    send_mail(
        template_name="unban",
        subject=f"{PREFIX} Account unbanned",
        recipients=[user.email],
        context={"username": user.username},
    )


def send_level_submitted_mail(level: Level) -> None:
    if not level.uploader or not level.uploader.email:
        return
    link = f"{settings.HOST_SITE}/levels/{level.id}"
    send_mail(
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
    for item in (
        User.objects.filter(
            Q(authored_levels=level) | Q(uploaded_levels=level)
        )
        .values("username", "email")
        .distinct("email")
    ):
        username = item["username"]
        email = item["email"]
        send_mail(
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
    if not level.uploader or not level.uploader.email:
        return
    link = f"{settings.HOST_SITE}/levels/{level.id}"
    send_mail(
        template_name="level_rejection",
        subject=f"{PREFIX} Level rejected",
        recipients=[level.uploader.email],
        context={
            "username": level.uploader.username,
            "level_name": level.name,
            "reason": reason,
            "link": link,
        },
    )
