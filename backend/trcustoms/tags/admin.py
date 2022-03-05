from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.tags.models import Tag


@admin.register(Tag)
class TagAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "created", "last_updated"]
