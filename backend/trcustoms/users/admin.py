from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from trcustoms.users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["username"]
    search_fields = ["username", "first_name", "last_name", "email"]
    fieldsets = None
    fields = [
        *[
            field.name
            for field in User._meta.fields
            if field.name not in ["id"]
        ],
        "user_permissions",
    ]
    readonly_fields = ["last_login", "date_joined"]
    list_display = [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_banned",
        "is_email_confirmed",
        "is_staff",
    ]
    raw_id_fields = ["picture"]
