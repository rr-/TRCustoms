from django.db import migrations


def backfill_user_settings(apps, schema_editor):
    User = apps.get_model("users", "User")
    UserSettings = apps.get_model("users", "UserSettings")
    have_settings = set(UserSettings.objects.values_list("user_id", flat=True))
    missing = User.objects.exclude(id__in=have_settings).values_list(
        "id", flat=True
    )
    UserSettings.objects.bulk_create(
        [UserSettings(user_id=user_id) for user_id in missing]
    )


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0023_auto_20250921_1318"),
    ]

    operations = [
        migrations.RunPython(
            backfill_user_settings, migrations.RunPython.noop
        ),
    ]
