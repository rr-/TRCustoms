from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from premailer import transform

from trcustoms.users.models import User

FROM = "admin@trcustoms.org"
PREFIX = "[TRCustoms]"
STATIC_DIR = Path(__file__).parent / "common" / "static"


def send_email(
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
    send_email(
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
    send_email(
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
    send_email(
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
    send_email(
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
    send_email(
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
    send_email(
        template_name="unban",
        subject=f"{PREFIX} Account unbanned",
        recipients=[user.email],
        context={"username": user.username},
    )
