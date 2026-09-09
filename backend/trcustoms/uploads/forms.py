from django import forms
from rest_framework.serializers import ValidationError as DRFValidationError

from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.validation import (
    EXTENSION_MAP,
    detect_content_type,
    validate_upload,
)


class UploadedFileForm(forms.ModelForm):
    """Applies the API's file rules to uploads made through the admin."""

    class Meta:
        model = UploadedFile
        exclude = ["md5sum", "size", "status", "pending_key"]

    def clean(self) -> dict:
        data = super().clean()

        content = data.get("content")
        upload_type = data.get("upload_type")
        if (
            not content
            or not upload_type
            or "content" not in self.changed_data
        ):
            return data

        content_type = detect_content_type(content)
        try:
            validate_upload(upload_type, content_type, content.size)
        except DRFValidationError as exc:
            raise forms.ValidationError(exc.detail) from exc

        if extension := EXTENSION_MAP.get(content_type):
            content.name = f"upload{extension}"

        return data
