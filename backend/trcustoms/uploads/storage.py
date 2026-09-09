import boto3
from botocore.client import Config
from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from storages.backends.s3boto3 import S3Boto3Storage


class S3MediaStorage(S3Boto3Storage):
    location = settings.AWS_MEDIA_LOCATION


def get_user_upload_storage() -> type[Storage]:
    if settings.USE_AWS_STORAGE:
        return S3MediaStorage
    return FileSystemStorage


def get_s3_client():
    """Return a boto3 client configured for the media bucket.

    Cloudflare R2 needs path-style addressing and SigV4; the same settings
    apply to presigned uploads and presigned downloads.
    """
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        config=Config(
            s3={"addressing_style": "path"},
            signature_version="s3v4",
            retries=dict(max_attempts=3),
        ),
    )


def get_object_key(name: str) -> str:
    """Map a FileField name onto its key in the bucket."""
    return f"{settings.AWS_MEDIA_LOCATION}/{name}"
