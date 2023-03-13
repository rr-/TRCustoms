from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.awards.models import UserAward


@admin.register(UserAward)
class UserAwardAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    search_fields = ["user__username", "title", "code"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "title", "tier", "user", "created", "last_updated"]
