from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.exceptions import ValidationError

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.levels.models import (
    FeaturedLevel,
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelExternalLink,
    LevelFile,
    LevelScreenshot,
)


@admin.register(LevelDifficulty)
class LevelDifficultyAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["position"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "position", "created", "last_updated"]


class LevelForm(forms.ModelForm):
    class Meta:
        model = Level
        exclude: list[str] = []

    def clean_genres(self):
        genres = self.cleaned_data.get("genres")

        if len(genres) > settings.MAX_GENRES:
            raise ValidationError(
                f"A level cannot have more than {settings.MAX_GENRES} genres."
            )

        return genres

    def clean_tags(self):
        tags = self.cleaned_data.get("tags")

        if len(tags) > settings.MAX_TAGS:
            raise ValidationError(
                f"A level cannot have more than {settings.MAX_TAGS} tags."
            )

        return tags


@admin.register(LevelDuration)
class LevelDurationAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["position"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "position", "created", "last_updated"]


class LevelExternalLinkInline(admin.StackedInline):
    model = LevelExternalLink
    extra = 0


@admin.register(Level)
class LevelAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    search_fields = [
        "name",
        "description",
        "authors__username",
        "authors__first_name",
        "authors__last_name",
        "uploader__username",
        "uploader__first_name",
        "uploader__last_name",
    ]
    list_display = [
        "id",
        "name",
        "uploader",
        "download_count",
        "rating_class",
        "is_approved",
        "created",
        "last_updated",
    ]
    list_filter = [
        "rating_class",
        "genres",
        "tags",
    ]
    readonly_fields = [
        "download_count",
        "created",
        "last_updated",
        "last_file",
    ]
    raw_id_fields = ["uploader", "authors", "cover"]
    form = LevelForm
    inlines = [LevelExternalLinkInline]


@admin.register(LevelScreenshot)
class LevelScreenshotAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["level", "position"]
    list_display = ["id", "level", "position", "created", "last_updated"]
    search_fields = ["level__name"]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "file"]

    def get_audit_log_obj(self, obj):
        return obj.level


@admin.register(LevelFile)
class LevelFileAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["level", "version"]
    list_display = [
        "id",
        "level",
        "version",
        "download_count",
        "created",
        "last_updated",
    ]
    search_fields = ["level__name"]
    readonly_fields = ["created", "last_updated", "version"]
    raw_id_fields = ["level", "file"]

    def get_audit_log_obj(self, obj):
        return obj.level


@admin.register(FeaturedLevel)
class FeaturedLevelAdmin(admin.ModelAdmin):
    list_display = ["created", "level", "feature_type", "chosen_genre"]
