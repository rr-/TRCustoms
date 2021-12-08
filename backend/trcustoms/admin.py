from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.core.exceptions import ValidationError

from trcustoms.models import (
    Level,
    LevelEngine,
    LevelFile,
    LevelGenre,
    LevelImage,
    LevelTag,
    User,
)


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


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["username"]
    search_fields = ["username", "first_name", "last_name"]


@admin.register(LevelEngine)
class LevelEngineAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]


@admin.register(LevelGenre)
class LevelGenreAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]


@admin.register(LevelTag)
class LevelTagAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    ordering = ["-created"]
    search_fields = [
        "name",
        "description",
        "author_name",
        "author_user__username",
        "author_user__first_name",
        "author_user__last_name",
        "uploader_user__username",
        "uploader_user__first_name",
        "uploader_user__last_name",
    ]
    list_filter = ["genres", "tags"]
    group_by = ["tags"]
    form = LevelForm


@admin.register(LevelImage)
class LevelImageAdmin(admin.ModelAdmin):
    ordering = ["level__name"]
    list_display = ["id", "level"]
    search_fields = ["level__name"]


@admin.register(LevelFile)
class LevelFileAdmin(admin.ModelAdmin):
    ordering = ["level__name"]
    list_display = ["id", "level", "version"]
    search_fields = ["level__name"]
    readonly_fields = ["size"]
