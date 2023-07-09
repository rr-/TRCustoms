from django.db import models


class UserSource(models.TextChoices):
    trle = "trle", "trle.net"
    trcustoms = "trcustoms", "trcustoms"
