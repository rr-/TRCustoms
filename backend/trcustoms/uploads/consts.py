from django.db import models

KILOBYTE = 1024
MEGABYTE = KILOBYTE * 1024
GIGABYTE = MEGABYTE * 1024


class UploadType(models.TextChoices):
    USER_PICTURE = ("up", "User picture")
    LEVEL_COVER = ("lb", "Level cover image")
    LEVEL_SCREENSHOT = ("ls", "Level screenshot")
    LEVEL_FILE = ("lf", "Level file")
    ATTACHMENT = ("at", "Post attachment")
    EVENT_COVER = ("ec", "Event cover image")


class UploadStatus(models.TextChoices):
    """Lifecycle of an :class:`UploadedFile` row.

    Rows created by the direct multipart endpoint are ``COMPLETE`` from the
    start. Rows created by the presigned flow start as ``PENDING``: the object
    key is reserved and handed to the client, but the row does not reference
    any content until the upload is confirmed and validated.
    """

    PENDING = ("p", "Pending")
    COMPLETE = ("c", "Complete")
