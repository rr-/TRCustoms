from django.contrib import admin

from trcustoms.playlists.models import PlaylistItem


@admin.register(PlaylistItem)
class PlaylistItemAdmin(admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "user",
        "level",
        "status",
        "created",
        "last_updated",
    ]
    list_filter = ["status"]
    search_field = [
        "level__name",
        "user__username",
        "user__first_name",
        "user__last_name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "user"]
