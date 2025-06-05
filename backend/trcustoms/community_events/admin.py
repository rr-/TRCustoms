from django import forms
from django.contrib import admin, messages
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.urls import path

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.community_events.importer import (
    export_events_to_string,
    import_events_from_string,
)
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

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "export-csv/",
                self.admin_site.admin_view(self.export_csv),
                name="community_events_event_export_csv",
            ),
            path(
                "import-csv/",
                self.admin_site.admin_view(self.import_csv),
                name="community_events_event_import_csv",
            ),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        if extra_context is None:
            extra_context = {}
        extra_context["export_csv_url"] = "export-csv/"
        extra_context["import_csv_url"] = "import-csv/"
        return super().changelist_view(request, extra_context=extra_context)

    def import_csv(self, request):
        if request.method != "POST":
            context = dict(self.admin_site.each_context(request))
            return render(
                request,
                "admin/community_events/event/import_csv.html",
                context,
            )

        csv_file = request.FILES.get("csv_file")
        if not csv_file:
            messages.error(request, "No file selected for upload.")
            return redirect("..")

        try:
            data = csv_file.read().decode("utf-8")
        except Exception:
            messages.error(
                request,
                "Could not read uploaded file. Ensure it is UTF-8 encoded.",
            )
            return redirect("..")

        created_count = import_events_from_string(data, request)
        messages.success(request, f"Imported {created_count} events.")
        return redirect("..")

    def export_csv(self, request):
        content = export_events_to_string(self.get_queryset(request))
        response = HttpResponse(
            content, content_type="text/tab-separated-values"
        )
        response["Content-Disposition"] = "attachment; filename=events.tsv"
        return response
