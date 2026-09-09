"""Upload limits and content type rules."""

import re

import magic
from rest_framework import serializers

from trcustoms.uploads.consts import GIGABYTE, KILOBYTE, MEGABYTE, UploadType

# Canonical extension per sniffed MIME type. Used to normalize the stored
# file name so its extension always matches the real content, regardless of
# what the client named the upload.
EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/zip": ".zip",
}

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


MAGIC_PREFIX_SIZE = 2048


def detect_content_type(file) -> str:
    """Sniff the real MIME type from the file's magic bytes.

    The client-supplied Content-Type header is not trusted: a client can
    declare an allowed type while sending arbitrary bytes (e.g. HTML or
    SVG), which would otherwise be stored and served with an executable
    extension on our own origin.
    """
    head = file.read(MAGIC_PREFIX_SIZE)
    file.seek(0)
    return magic.from_buffer(head, mime=True)


def get_rules(upload_type: str) -> tuple[list, list]:
    """Return the (size rules, allowed content types) for an upload type."""
    try:
        return MAX_SIZE_MAP[upload_type], CONTENT_TYPE_MAP[upload_type]
    except KeyError:
        raise serializers.ValidationError(
            {
                "upload_type": (
                    "Invalid upload type. Valid values include: "
                    + ", ".join(map(repr, MAX_SIZE_MAP.keys()))
                )
            }
        ) from None


def get_max_size(max_size_map: list, content_type: str) -> int:
    """Return the size limit that applies to a given content type."""
    for pattern, max_file_size in max_size_map:
        if re.match(pattern, content_type):
            return max_file_size
    return 0


def validate_content_type(upload_type: str, content_type: str) -> None:
    """Reject a content type that is not allowed for this upload type."""
    _, allowed_content_types = get_rules(upload_type)
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


def validate_size(upload_type: str, content_type: str, size: int) -> None:
    """Reject a file larger than the limit for this type."""
    max_size_map, _ = get_rules(upload_type)
    max_file_size = get_max_size(max_size_map, content_type)
    if size > max_file_size:
        raise serializers.ValidationError(
            {
                "content": (
                    "Maximum allowed size for this file: "
                    f"{max_file_size/1024:.02f} KB"
                )
            }
        )


def validate_upload(upload_type: str, content_type: str, size: int) -> None:
    """Run the full allow-list and size check for an upload."""
    validate_content_type(upload_type, content_type)
    validate_size(upload_type, content_type, size)
