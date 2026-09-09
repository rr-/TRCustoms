from rest_framework import serializers

from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.validation import (
    EXTENSION_MAP,
    detect_content_type,
    validate_upload,
)


class UploadedFileNestedSerializer(serializers.ModelSerializer):
    size = serializers.ReadOnlyField()
    url = serializers.SerializerMethodField(read_only=True)
    md5sum = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "content",
            "upload_type",
            "url",
            "size",
            "md5sum",
        ]

    def get_url(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.content.url

    def get_md5sum(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.md5sum


class UploadedFileDetailsSerializer(serializers.ModelSerializer):
    size = serializers.ReadOnlyField()
    url = serializers.SerializerMethodField(read_only=True)
    md5sum = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "content",
            "upload_type",
            "url",
            "size",
            "md5sum",
        ]

    def validate(self, data):
        content = data.get("content")
        if not content:
            raise serializers.ValidationError({"content": "Missing file."})

        content_type = detect_content_type(content)
        validate_upload(data["upload_type"], content_type, content.size)

        if extension := EXTENSION_MAP.get(content_type):
            content.name = f"upload{extension}"

        return data

    def get_url(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.content.url

    def get_md5sum(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.md5sum
