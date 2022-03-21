import string

from django.core.exceptions import ValidationError

USERNAME_SPECIAL_CHARACTERS = "!@#$%^&*()_-+={}[]:\";',."


class UsernameValidator:
    """Validate that the username does not contain invalid characters."""

    def __call__(self, value):
        for c in value:
            if (
                c not in string.ascii_letters
                and c not in string.digits
                and c not in USERNAME_SPECIAL_CHARACTERS
            ):
                raise ValidationError(
                    f"Usernames cannot contain the following character: {c}.",
                    code="invalid_username",
                    params={"value": value},
                )

        if all(c not in value for c in string.ascii_letters + string.digits):
            raise ValidationError(
                "Usernames must contain at least one alphanumeric character.",
                code="invalid_username",
                params={"value": value},
            )


class PasswordLetterValidator:
    def validate(self, password, _user=None):
        if all(not char.isalpha() for char in password):
            raise ValidationError(
                "Passwords must contain at least one letter.",
                code="password_missing_letter",
            )

    def get_help_text(self):
        return "Your password must contain at least one letter."


class PasswordDigitValidator:
    def validate(self, password, _user=None):
        if all(not char.isdigit() for char in password):
            raise ValidationError(
                "Passwords must contain at least one digit.",
                code="password_missing_digit",
            )

    def get_help_text(self):
        return "Your password must contain at least one digit."


class PasswordSpecialCharValidator:
    def validate(self, password, _user=None):
        if all(char.isdigit() or char.isalpha() for char in password):
            raise ValidationError(
                "Passwords must contain at least one special character.",
                code="password_missing_special_character",
            )

    def get_help_text(self):
        return "Your password must contain at least one special character."
