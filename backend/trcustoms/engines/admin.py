from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.engines.models import Engine


@admin.register(Engine)
class EngineAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "position", "created", "last_updated"]
