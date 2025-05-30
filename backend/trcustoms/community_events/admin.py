from django import forms
from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.community_events.models import Event, Winner
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile


class WinnerInline(admin.TabularInline):
    model = Winner
    extra = 1


class EventAdminForm(forms.ModelForm):
    """Custom form to allow direct cover image upload for Event."""

    new_cover_image = forms.FileField(
        required=False, label="Upload cover image"
    )

    class Meta:
        model = Event
        exclude = ["cover_image"]


@admin.register(Event)
class EventAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-collection_release"]
    list_display = [
        "id",
        "name",
        "year",
        "level_count",
        "collection_release",
        "created",
        "last_updated",
    ]
    list_filter = ["year"]
    search_fields = ["name", "subtitle"]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["host"]
    filter_horizontal = ["levels"]
    inlines = [WinnerInline]

    form = EventAdminForm

    def save_model(self, request, obj, form, change):
        # Handle direct cover image upload
        new_file = form.cleaned_data.get("new_cover_image")
        if new_file:
            upload = UploadedFile.objects.create(
                uploader=request.user,
                upload_type=UploadType.EVENT_COVER,
                content=new_file,
                size=new_file.size,
            )
            obj.cover_image = upload
        super().save_model(request, obj, form, change)

    def level_count(self, obj):
        return obj.levels.count()

    level_count.short_description = "Level count"
