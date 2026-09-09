"""Direct-to-bucket uploads via presigned PUT URLs.

Routing large uploads through Django meant nginx buffered the whole body to
disk and a uWSGI worker stayed blocked for the entire transfer to the bucket -
which, past the harakiri timeout, killed the worker and returned a 502. Here
the client PUTs the bytes straight to the bucket and the backend only reserves
a key beforehand and validates the stored object afterwards.

The security property of the direct endpoint is preserved: an object survives
only if the type sniffed from its own bytes is allowed for the upload type and
matches the extension the key was reserved with. The client's declared type
decides the extension, but never gets the final say on what is kept.
"""

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

from botocore.exceptions import ClientError
from django.conf import settings
from rest_framework import serializers

from trcustoms.uploads.consts import UploadStatus
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.storage import get_object_key, get_s3_client
from trcustoms.uploads.validation import (
    EXTENSION_MAP,
    MAGIC_PREFIX_SIZE,
    canonicalize_content_type,
    sniff_content_type,
    validate_content_type,
    validate_size,
)

PUT_URL_EXPIRY = 60 * 60

MD5_ETAG_RE = re.compile(r"^[0-9a-f]{32}$")


@dataclass
class PresignedUpload:
    uploaded_file: UploadedFile
    url: str
    headers: dict[str, str]
    expires_in: int


class PresignUnavailable(Exception):
    """Raised when the deployment stores uploads on the local filesystem."""


def is_available() -> bool:
    return bool(settings.USE_AWS_STORAGE and settings.USE_PRESIGNED_UPLOADS)


def reserve(
    user, upload_type: str, content_type: str, size: int
) -> PresignedUpload:
    """Reserve an object key and return a presigned PUT for the client.

    The URL pins the key, the content type and the exact content length, so a
    client cannot reuse it to store a different object or a larger one.
    """
    if not is_available():
        raise PresignUnavailable

    content_type = canonicalize_content_type(content_type)

    validate_content_type(upload_type, content_type)
    validate_size(upload_type, content_type, size)

    extension = EXTENSION_MAP.get(content_type)
    if not extension:
        raise serializers.ValidationError(
            {
                "content_type": (
                    f"Cannot store a file of type {content_type}. "
                    f"Allowed types: {', '.join(EXTENSION_MAP)}"
                )
            }
        )

    uploaded_file = UploadedFile(
        uploader=user,
        upload_type=upload_type,
        status=UploadStatus.PENDING,
        size=0,
    )
    name = uploaded_file.upload_to(f"upload{extension}")
    uploaded_file.pending_key = get_object_key(name)
    uploaded_file.save()

    url = get_s3_client().generate_presigned_url(
        ClientMethod="put_object",
        ExpiresIn=PUT_URL_EXPIRY,
        Params={
            "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
            "Key": uploaded_file.pending_key,
            "ContentType": content_type,
            "ContentLength": size,
        },
    )

    return PresignedUpload(
        uploaded_file=uploaded_file,
        url=url,
        headers={"Content-Type": content_type},
        expires_in=PUT_URL_EXPIRY,
    )


def _read_head(client, key: str) -> bytes:
    """Fetch just the leading bytes libmagic needs to identify the file."""
    response = client.get_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=key,
        Range=f"bytes=0-{MAGIC_PREFIX_SIZE - 1}",
    )
    with response["Body"] as body:
        return body.read(MAGIC_PREFIX_SIZE)


def _compute_md5(client, key: str) -> str:
    """Stream the object to checksum it, when the ETag is not a plain MD5."""
    response = client.get_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key
    )
    md5 = hashlib.md5()
    with response["Body"] as body:
        for chunk in body.iter_chunks():
            md5.update(chunk)
    return md5.hexdigest()


def delete_object(key: str) -> None:
    """Remove an object from the bucket, tolerating one that is not there."""
    if not is_available():
        return
    try:
        get_s3_client().delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key
        )
    except ClientError:
        pass


def confirm(uploaded_file: UploadedFile) -> UploadedFile:
    """Validate an uploaded object and attach it to its row.

    Rejected uploads are removed from the bucket and the reservation row is
    deleted, so a failed upload leaves nothing behind.
    """
    if uploaded_file.status != UploadStatus.PENDING:
        raise serializers.ValidationError(
            {"content": "This upload was already confirmed."}
        )

    client = get_s3_client()
    key = uploaded_file.pending_key

    try:
        head = client.head_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=key
        )
    except ClientError:
        uploaded_file.delete()
        raise serializers.ValidationError(
            {"content": "Upload was not received."}
        ) from None

    size = head["ContentLength"]
    content_type = sniff_content_type(_read_head(client, key))

    try:
        validate_content_type(uploaded_file.upload_type, content_type)
        validate_size(uploaded_file.upload_type, content_type, size)
        if EXTENSION_MAP.get(content_type) != Path(key).suffix:
            raise serializers.ValidationError(
                {
                    "content": (
                        f"File content ({content_type}) does not match the "
                        "declared file type."
                    )
                }
            )
    except serializers.ValidationError:
        uploaded_file.delete()
        raise

    etag = head.get("ETag", "").strip('"')
    md5sum = etag if MD5_ETAG_RE.match(etag) else _compute_md5(client, key)

    uploaded_file.content.name = key.removeprefix(
        f"{settings.AWS_MEDIA_LOCATION}/"
    )
    uploaded_file.md5sum = md5sum
    uploaded_file.size = size
    uploaded_file.status = UploadStatus.COMPLETE
    uploaded_file.pending_key = None
    uploaded_file.skip_checksum_recompute = True
    uploaded_file.save()

    return uploaded_file
