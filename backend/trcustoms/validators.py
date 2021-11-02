from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordLetterValidator:
    def validate(self, password, _user=None):
        if all(not char.isalpha() for char in password):
            raise ValidationError(
                _("Passwords must contain at least one letter."),
                code="password_missing_letter",
            )

    def get_help_text(self):
        return _("Your password must contain at least one digit.")


class PasswordDigitValidator:
    def validate(self, password, _user=None):
        if all(not char.isdigit() for char in password):
            raise ValidationError(
                _("Passwords must contain at least one digit."),
                code="password_missing_digit",
            )

    def get_help_text(self):
        return _("Your password must contain at least one digit.")


class PasswordSpecialCharValidator:
    def validate(self, password, _user=None):
        if all(char.isdigit() or char.isalpha() for char in password):
            raise ValidationError(
                _("Passwords must contain at least one special character."),
                code="password_missing_special_character",
            )

    def get_help_text(self):
        return _("Your password must contain at least one special character.")
