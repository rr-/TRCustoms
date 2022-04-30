from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.walkthroughs.models import Walkthrough


@admin.register(Walkthrough)
class WalkthroughAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "author",
        "level",
        "walkthrough_type",
        "created",
        "last_updated",
    ]
    list_filter = ["walkthrough_type"]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "author"]
