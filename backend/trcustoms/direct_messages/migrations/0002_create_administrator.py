from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_administrator(apps, schema_editor):
    User = apps.get_model("users", "User")
    UserSettings = apps.get_model("users", "UserSettings")
    username = settings.MESSAGES_ADMINISTRATOR_USERNAME
    if User.objects.filter(username__iexact=username).exists():
        return
    administrator = User.objects.create(
        username=username,
        password=make_password(None),
        email="",
        source="trcustoms",
        is_active=True,
        is_email_confirmed=True,
    )
    UserSettings.objects.get_or_create(user=administrator)


class Migration(migrations.Migration):
    dependencies = [
        ("direct_messages", "0001_initial"),
        ("users", "0025_user_messaging"),
    ]

    operations = [
        migrations.RunPython(create_administrator, migrations.RunPython.noop),
    ]
