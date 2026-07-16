import re

import magic
from rest_framework import serializers

from trcustoms.uploads.consts import GIGABYTE, KILOBYTE, MEGABYTE, UploadType
from trcustoms.uploads.models import UploadedFile

# Canonical extension per sniffed MIME type. Used to normalize the stored
# file name so its extension always matches the real content, regardless of
# what the client named the upload.
EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/zip": ".zip",
}


def detect_content_type(file) -> str:
    """Sniff the real MIME type from the file's magic bytes.

    The client-supplied Content-Type header is not trusted: a client can
    declare an allowed type while sending arbitrary bytes (e.g. HTML or
    SVG), which would otherwise be stored and served with an executable
    extension on our own origin.
    """
    head = file.read(2048)
    file.seek(0)
    return magic.from_buffer(head, mime=True)


MAX_SIZE_MAP = {
    UploadType.USER_PICTURE: [
        (".*", 300 * KILOBYTE),
    ],
    UploadType.LEVEL_COVER: [
        ("image/png", 10 * MEGABYTE),
        (".*", MEGABYTE),
    ],
    UploadType.LEVEL_SCREENSHOT: [
        ("image/png", 10 * MEGABYTE),
        (".*", MEGABYTE),
    ],
    UploadType.LEVEL_FILE: [
        (".*", 2 * GIGABYTE),
    ],
    UploadType.ATTACHMENT: [
        (".*", 0.5 * MEGABYTE),
    ],
    UploadType.EVENT_COVER: [
        ("image/png", 10 * MEGABYTE),
        (".*", MEGABYTE),
    ],
}

CONTENT_TYPE_MAP = {
    UploadType.USER_PICTURE: ["image/jpeg", "image/png"],
    UploadType.LEVEL_COVER: ["image/jpeg", "image/png"],
    UploadType.LEVEL_SCREENSHOT: ["image/jpeg", "image/png"],
    UploadType.LEVEL_FILE: [
        "application/zip",
        "application/zip-compressed",
        "application/x-zip-compressed",
    ],
    UploadType.ATTACHMENT: [
        "image/png",
        "image/jpeg",
        "application/zip",
        "application/zip-compressed",
        "application/x-zip-compressed",
    ],
    UploadType.EVENT_COVER: ["image/jpeg", "image/png"],
}


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
        try:
            max_size_map = MAX_SIZE_MAP[data["upload_type"]]
            allowed_content_types = CONTENT_TYPE_MAP[data["upload_type"]]
        except KeyError:
            raise serializers.ValidationError(
                {
                    "upload_type": (
                        "Invalid upload type. Valid values include: "
                        + ", ".join(map(repr, MAX_SIZE_MAP.keys()))
                    )
                }
            ) from None

        content = data.get("content")
        if not content:
            raise serializers.ValidationError({"content": "Missing file."})

        content_type = detect_content_type(content)

        for pattern, max_file_size in max_size_map:
            if re.match(pattern, content_type):
                break
        else:
            max_file_size = 0

        if content_type not in allowed_content_types:
            raise serializers.ValidationError(
                {
                    "content": (
                        f"Invalid file type ({content_type}). "
                        "Allowed types: "
                        f"{', '.join(allowed_content_types)}"
                    )
                }
            )

        if content.size > max_file_size:
            raise serializers.ValidationError(
                {
                    "content": (
                        "Maximum allowed size for this file: "
                        f"{max_file_size/1024:.02f} KB"
                    )
                }
            )

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
