from django.contrib import admin

from trcustoms.common.mixins import ReadOnlyAdminMixin
from trcustoms.common.models import RatingClass


@admin.register(RatingClass)
class RatingClassAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    ordering = ["target", "position"]
    list_display = [
        "target",
        "position",
        "name",
        "min_rating_count",
        "min_rating_average",
        "max_rating_average",
    ]
