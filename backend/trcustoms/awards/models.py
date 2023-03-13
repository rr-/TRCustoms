from django.db import models

from trcustoms.common.models import DatesInfo
from trcustoms.users.models import User


class UserAward(DatesInfo):
    user = models.ForeignKey(
        User, related_name="awards", on_delete=models.CASCADE
    )
    code = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=100)
    tier = models.IntegerField(null=True, blank=True)
    position = models.IntegerField(default=0)
