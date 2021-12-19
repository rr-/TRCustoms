from django.db import models


class DatesInfo(models.Model):
    """Base class for models expected to store creation and last update
    datetime values.
    """

    created = models.DateTimeField(auto_now_add=True, null=True)
    last_updated = models.DateTimeField(
        auto_now=True, null=True, db_index=True
    )

    class Meta:
        abstract = True
