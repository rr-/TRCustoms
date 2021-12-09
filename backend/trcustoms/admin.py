from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.core.exceptions import ValidationError

from trcustoms.models import (
    Level,
    LevelAuthor,
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
    fieldsets = None
    fields = [
        "username",
        "password",
        "first_name",
        "last_name",
        "email",
        "is_active",
        "is_staff",
        "picture",
    ]
    readonly_fields = ["last_login", "date_joined"]


@admin.register(LevelEngine)
class LevelEngineAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["name", "created", "last_updated"]


@admin.register(LevelGenre)
class LevelGenreAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["name", "created", "last_updated"]


@admin.register(LevelTag)
class LevelTagAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["name", "created", "last_updated"]


@admin.register(LevelAuthor)
class LevelAuthorAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name", "user__username"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["name", "user", "created", "last_updated"]


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    ordering = ["-created"]
    search_fields = [
        "name",
        "description",
        "authors__name",
        "authors__user__username",
        "authors__user__first_name",
        "authors__user__last_name",
        "uploader_user__username",
        "uploader_user__first_name",
        "uploader_user__last_name",
    ]
    list_display = ["name", "uploader", "created", "last_updated"]
    list_filter = ["genres", "tags"]
    group_by = ["tags"]
    form = LevelForm
    readonly_fields = ["created", "last_updated"]


@admin.register(LevelImage)
class LevelImageAdmin(admin.ModelAdmin):
    ordering = ["level__name"]
    list_display = ["id", "level", "created", "last_updated"]
    search_fields = ["level__name"]
    readonly_fields = ["created", "last_updated"]


@admin.register(LevelFile)
class LevelFileAdmin(admin.ModelAdmin):
    ordering = ["level__name"]
    list_display = ["id", "level", "version", "created", "last_updated"]
    search_fields = ["level__name"]
    readonly_fields = ["size", "created", "last_updated", "version"]
