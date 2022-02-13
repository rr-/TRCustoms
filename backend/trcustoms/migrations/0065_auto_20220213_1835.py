from django.db import migrations


def add_permissions(apps, schema_editor):
    pass


def remove_permissions(apps, schema_editor):
    """Reverse the above additions of permissions."""
    Permission = apps.get_model("auth.Permission")
    Permission.objects.exclude(
        codename__in=[
            "edit_levels",
            "edit_reviews",
            "edit_tags",
            "edit_users",
            "list_users",
            "review_audit_logs",
            "review_levels",
            "upload_levels",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        (
            "trcustoms",
            "0064_alter_auditlog_options_alter_level_options_and_more",
        ),
    ]

    operations = [
        migrations.RunPython(remove_permissions, add_permissions),
    ]
