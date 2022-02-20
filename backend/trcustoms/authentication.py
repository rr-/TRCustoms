from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from trcustoms.models import User


def user_authentication_rule(user: User | None) -> None:
    if not user:
        raise AuthenticationFailed(
            detail="Invalid username or password.",
            code="invalid_credentials",
        )
    if not user.is_active:
        raise AuthenticationFailed(
            detail="Your account is still awaiting activation.",
            code="no_active_account",
        )
    if not user.is_email_confirmed:
        raise AuthenticationFailed(
            detail=(
                "You need to confirm your email first. "
                "In case no message was sent, check the spam folder."
            ),
            code="email_not_confirmed",
        )
    if user.is_banned:
        raise AuthenticationFailed(
            detail=f"You are banned. Reason: {user.ban_reason}",
            code="user_banned",
        )
    return True


class CustomAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        user_authentication_rule(user)
        return user
