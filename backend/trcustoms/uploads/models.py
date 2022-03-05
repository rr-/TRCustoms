import uuid
from pathlib import Path

from django.db import models

from trcustoms.common.models import DatesInfo
from trcustoms.uploads.storage import get_user_upload_storage

user_upload_storage = get_user_upload_storage()


class UploadedFile(DatesInfo):
    class UploadType(models.TextChoices):
        USER_PICTURE = ("up", "User picture")
        LEVEL_COVER = ("lb", "Level cover image")
        LEVEL_SCREENSHOT = ("ls", "Level screenshot")
        LEVEL_FILE = ("lf", "Level file")

    class Meta:
        default_permissions = []

    def get_upload_directory(self) -> str:
        match self.upload_type:
            case UploadedFile.UploadType.USER_PICTURE:
                return "avatars"
            case UploadedFile.UploadType.LEVEL_COVER:
                return "level_images"
            case UploadedFile.UploadType.LEVEL_SCREENSHOT:
                return "level_images"
            case UploadedFile.UploadType.LEVEL_FILE:
                return "levels"
            case _:
                raise ValueError("unknown upload type")

    def upload_to(self, filename):
        extension = Path(filename).suffix
        return str(
            Path(self.get_upload_directory()) / f"{uuid.uuid4()}{extension}"
        )

    uploader = models.ForeignKey(
        "users.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="uploaded_files",
    )
    upload_type = models.CharField(
        choices=UploadType.choices,
        max_length=2,
    )
    content = models.FileField(
        blank=True, null=True, upload_to=upload_to, storage=user_upload_storage
    )
    md5sum = models.CharField(max_length=36, blank=True, null=True)
    size = models.IntegerField()

    def __str__(self) -> str:
        return f"Uploaded file (id={self.pk}, upload_type={self.upload_type})"
