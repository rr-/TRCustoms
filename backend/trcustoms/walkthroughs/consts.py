from django.db import models


class WalkthroughType(models.TextChoices):
    LINK = ("l", "Link")
    TEXT = ("t", "Text")


class WalkthroughStatus(models.TextChoices):
    DRAFT = ("dra", "Draft")
    PENDING_APPROVAL = ("pen", "Pending approval")
    APPROVED = ("app", "Approved")
    REJECTED = ("rej", "Rejected")
