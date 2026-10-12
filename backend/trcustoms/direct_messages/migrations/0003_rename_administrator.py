from django.db import migrations
from django.db.models import Q

OLD_USERNAME = "Administrator"
NEW_USERNAME = "Administration"


def rename(apps, old: str, new: str) -> None:
    User = apps.get_model("users", "User")
    Message = apps.get_model("direct_messages", "Message")
    old_user = User.objects.filter(username__iexact=old).first()
    if old_user is None:
        return
    new_user = User.objects.filter(username__iexact=new).first()
    if new_user is not None:
        is_unused = new_user.last_login is None and not (
            Message.objects.filter(
                Q(sender=new_user)
                | Q(receiver=new_user)
                | Q(origin_sender=new_user)
            ).exists()
        )
        if not is_unused:
            return
        new_user.delete()
    old_user.username = new
    old_user.save(update_fields=["username"])


def forwards(apps, schema_editor):
    rename(apps, OLD_USERNAME, NEW_USERNAME)


def backwards(apps, schema_editor):
    rename(apps, NEW_USERNAME, OLD_USERNAME)


class Migration(migrations.Migration):
    dependencies = [
        ("direct_messages", "0002_create_administrator"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
