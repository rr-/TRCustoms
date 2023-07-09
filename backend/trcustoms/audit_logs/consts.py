from django.db import models


class ChangeType(models.TextChoices):
    CREATE = ("CREATE", "Create")
    UPDATE = ("UPDATE", "Update")
    DELETE = ("DELETE", "Delete")
