from rest_framework import exceptions

from trcustoms.models import User


def user_authentication_rule(user: User | None) -> None:
    if not user:
        raise exceptions.AuthenticationFailed(
            "Invalid username or password.",
            "invalid_credentials",
        )
    if not user.is_active:
        raise exceptions.AuthenticationFailed(
            "Your account is still awaiting activation.",
            "no_active_account",
        )
