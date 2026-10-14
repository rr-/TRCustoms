from django.contrib import admin

from trcustoms.config.models import FeatureFlag


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ["name", "is_enabled"]
    list_editable = ["is_enabled"]
