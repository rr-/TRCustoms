from datetime import timedelta

from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework_simplejwt.settings import api_settings as jwt_settings
from rest_framework_simplejwt.tokens import Token

from trcustoms.users.models import User


class ConfirmEmailToken(Token):
    token_type = "access"
    lifetime = timedelta(hours=6)


class PasswordResetToken(Token):
    token_type = "password_reset"
    lifetime = timedelta(hours=1)


def get_user_from_token(token: Token, mark_used: bool = False) -> User:
    cache_key = f"token_{token!s}"
    if cache.get(cache_key, None):
        raise ValidationError(
            {"detail": "This token was already used. Please try again."}
        )
    user_id = token[jwt_settings.USER_ID_CLAIM]
    user = get_object_or_404(User, pk=user_id)
    cache.set(cache_key, True)
    return user
