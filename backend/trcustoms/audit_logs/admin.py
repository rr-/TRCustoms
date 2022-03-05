from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.contrib.contenttypes.models import ContentType

from trcustoms.audit_logs.models import AuditLog


class AuditLogObjectTypeFilter(SimpleListFilter):
    title = "Object Type"
    parameter_name = "object_type"

    def lookups(self, request, model_admin):
        return [
            (ct.id, ct.model.title())
            for ct in ContentType.objects.filter(app_label="trcustoms").filter(
                model__in=["level", "user"]
            )
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(object_type__id=self.value())
        return queryset


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_filter = [
        "change_type",
        AuditLogObjectTypeFilter,
    ]
    search_fields = [
        "object_id",
        "object_type__model",
        "change_author__username",
        "change_author__first_name",
        "change_author__last_name",
        "reviewer__username",
        "reviewer__first_name",
        "reviewer__last_name",
    ]
    list_display = [
        "created",
        "object_type_name",
        "change_type",
        "change_author",
        "is_action_required",
    ]

    def object_type_name(self, instance):
        return instance.object_type.model.title()
