from django.conf import settings
from django.core.mail import send_mail

from trcustoms.models import User

FROM = "admin@trcustoms.org"
PREFIX = "[TRCustoms]"


def send_email_confirmation_mail(user: User) -> None:
    token = user.generate_email_token()
    send_mail(
        f"{PREFIX} Account activation",
        (
            "Please click this link to finish activation:\n"
            f"{settings.HOST_SITE}/api/users/confirm_email"
            f"?username={user.username}&token={token}"
        ),
        FROM,
        [user.email],
        fail_silently=False,
    )
