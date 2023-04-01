import re

from rest_framework import fields


class CustomCharField(fields.CharField):
    """CharField that trims leading and trailing whitespace, and collapses
    consecutive whitespace characters.
    """

    def __init__(
        self, *args, collapse_whitespace: bool = True, **kwargs
    ) -> None:
        self.collapse_whitespace = collapse_whitespace
        super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        value = value.strip()
        if self.collapse_whitespace:
            value = re.sub(r"[ \t]{2,}", " ", value)
        return value


class CustomTextField(CustomCharField):
    """TextField that trims leading and trailing whitespace."""

    def __init__(
        self, *args, collapse_whitespace: bool = False, **kwargs
    ) -> None:
        super().__init__(
            *args, collapse_whitespace=collapse_whitespace, **kwargs
        )
