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
