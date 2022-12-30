import re

from rest_framework import fields


class CustomCharField(fields.CharField):
    """CharField that collapses whitespace."""

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        value = re.sub(r"[ \t]{2,}", " ", value)
        return value
