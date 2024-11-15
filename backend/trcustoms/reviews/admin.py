from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.reviews.models import Review


@admin.register(Review)
class ReviewAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "author",
        "position",
        "level",
        "created",
        "last_updated",
    ]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "author"]
