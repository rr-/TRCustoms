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
    pass


@admin.register(LevelEngine)
class LevelEngineAdmin(admin.ModelAdmin):
    pass


@admin.register(LevelCategory)
class LevelCategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(LevelTag)
class LevelTagAdmin(admin.ModelAdmin):
    pass


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    pass


@admin.register(LevelImage)
class LevelImageAdmin(admin.ModelAdmin):
    pass


@admin.register(LevelFile)
class LevelFileAdmin(admin.ModelAdmin):
    pass
