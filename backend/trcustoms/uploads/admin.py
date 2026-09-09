from django.contrib import admin

from trcustoms.uploads.forms import UploadedFileForm
from trcustoms.uploads.models import UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    form = UploadedFileForm
    list_filter = ["upload_type", "status"]
    list_display = [
        "id",
        "uploader",
        "upload_type",
        "content",
        "md5sum",
        "size",
    ]
    search_fields = [
        "upload_type",
        "md5sum",
        "uploader__username",
        "uploader__first_name",
        "uploader__last_name",
    ]
    readonly_fields = ["md5sum", "size", "status", "created", "last_updated"]
