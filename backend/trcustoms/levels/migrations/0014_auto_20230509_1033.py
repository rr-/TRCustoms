# Generated by Django 4.1.3 on 2023-05-09 10:33

from django.db import migrations


def update_durations_forward(apps, schema_editor):
    level_duration_cls = apps.get_model("levels", "LevelDuration")
    level_duration_cls.objects.filter(position=1).update(
        name="Medium (1+ hours)"
    )


def update_durations_backward(apps, schema_editor):
    level_duration_cls = apps.get_model("levels", "LevelDuration")
    level_duration_cls.objects.filter(position=1).update(
        name="Medium (3+ hours)"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0013_auto_20230313_1229"),
    ]

    operations = [
        migrations.RunPython(
            update_durations_forward,
            update_durations_backward,
        ),
    ]
