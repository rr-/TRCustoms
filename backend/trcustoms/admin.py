from django.contrib import admin

from trcustoms.models import (
    Level,
    LevelCategory,
    LevelEngine,
    LevelFile,
    LevelImage,
    LevelTag,
    User,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    ordering = ["username"]
    search_fields = ["username", "first_name", "last_name"]


@admin.register(LevelEngine)
class LevelEngineAdmin(admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]


@admin.register(LevelCategory)
class LevelCategoryAdmin(admin.ModelAdmin):
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
    list_filter = ["categories", "tags"]
    group_by = ["tags"]


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
