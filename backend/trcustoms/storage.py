from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from storages.backends.s3boto3 import S3Boto3Storage


class S3MediaStorage(S3Boto3Storage):
    location = settings.AWS_MEDIA_LOCATION


def get_user_upload_storage() -> type[Storage]:
    if settings.USE_AWS_STORAGE:
        return S3MediaStorage
    return FileSystemStorage
