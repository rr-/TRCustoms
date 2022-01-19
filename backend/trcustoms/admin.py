from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from trcustoms.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelExternalLink,
    LevelFile,
    LevelGenre,
    LevelLegacyReview,
    LevelScreenshot,
    LevelTag,
    Snapshot,
    UploadedFile,
    User,
)
from trcustoms.snapshots import make_snapshot


class SnapshotAdminMixin:
    def log_addition(self, request, obj, message):
        super().log_addition(request, obj, message)
        obj = self.get_snapshot_obj(obj)
        make_snapshot(
            obj, request=request, change_type=Snapshot.ChangeType.CREATE
        )

    def log_change(self, request, obj, message):
        super().log_change(request, obj, message)
        obj = self.get_snapshot_obj(obj)
        make_snapshot(
            obj, request=request, change_type=Snapshot.ChangeType.UPDATE
        )

    def log_deletion(self, request, obj, object_repr):
        super().log_deletion(request, obj, object_repr)
        obj = self.get_snapshot_obj(obj)
        make_snapshot(
            obj, request=request, change_type=Snapshot.ChangeType.DELETE
        )

    def get_snapshot_obj(self, obj):
        return obj


class ReadOnlyAdminMixin:
    readonly_fields = []

    def get_readonly_fields(self, request, obj=None):
        # pylint: disable=protected-access
        return (
            list(self.readonly_fields)
            + [field.name for field in obj._meta.fields]
            + [field.name for field in obj._meta.many_to_many]
        )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


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
    list_display = [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
    ]
    raw_id_fields = ["picture"]


@admin.register(LevelEngine)
class LevelEngineAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "created", "last_updated"]


@admin.register(LevelDifficulty)
class LevelDifficultyAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["position"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "position", "created", "last_updated"]


@admin.register(LevelDuration)
class LevelDurationAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["position"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "position", "created", "last_updated"]


@admin.register(LevelGenre)
class LevelGenreAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "created", "last_updated"]


@admin.register(LevelTag)
class LevelTagAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["name"]
    search_fields = ["name"]
    readonly_fields = ["created", "last_updated"]
    list_display = ["id", "name", "created", "last_updated"]


class LevelExternalLinkInline(admin.StackedInline):
    model = LevelExternalLink
    extra = 0


@admin.register(Level)
class LevelAdmin(SnapshotAdminMixin, admin.ModelAdmin):
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
    list_display = [
        "id",
        "name",
        "uploader",
        "download_count",
        "is_approved",
        "created",
        "last_updated",
    ]
    list_filter = ["genres", "tags"]
    form = LevelForm
    inlines = [LevelExternalLinkInline]
    readonly_fields = [
        "download_count",
        "created",
        "last_updated",
        "last_file",
    ]
    raw_id_fields = ["uploader", "authors", "cover"]


@admin.register(LevelScreenshot)
class LevelScreenshotAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["level", "position"]
    list_display = ["id", "level", "position", "created", "last_updated"]
    search_fields = ["level__name"]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "file"]

    def get_snapshot_obj(self, obj):
        return obj.level


@admin.register(LevelFile)
class LevelFileAdmin(SnapshotAdminMixin, admin.ModelAdmin):
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

    def get_snapshot_obj(self, obj):
        return obj.level


@admin.register(LevelLegacyReview)
class LevelLegacyReviewAdmin(SnapshotAdminMixin, admin.ModelAdmin):
    ordering = ["level__name"]
    list_display = [
        "id",
        "author",
        "level",
        "rating_gameplay",
        "rating_enemies",
        "rating_atmosphere",
        "rating_lighting",
        "created",
        "last_updated",
    ]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "author"]


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_filter = ["upload_type"]
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
    readonly_fields = ["md5sum", "size", "created", "last_updated"]


class SnapshotObjectTypeFilter(SimpleListFilter):
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


@admin.register(Snapshot)
class SnapshotAdmin(ReadOnlyAdminMixin, admin.ModelAdmin):
    list_filter = [
        "change_type",
        SnapshotObjectTypeFilter,
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
        "is_reviewed",
        "reviewer",
    ]

    def object_type_name(self, instance):
        return instance.object_type.model.title()
