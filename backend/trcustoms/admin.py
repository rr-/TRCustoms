from django.contrib import admin

from trcustoms.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
