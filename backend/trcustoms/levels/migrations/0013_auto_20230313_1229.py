# Generated by Django 4.1.3 on 2023-03-13 12:29

from django.db import migrations

MAPPING = [
    {"position": 0, "old_name": "Short", "new_name": "Short (<1 hour)"},
    {"position": 1, "old_name": "Medium", "new_name": "Medium (3+ hours)"},
    {"position": 2, "old_name": "Long", "new_name": "Long (3+ hours)"},
    {
        "position": 3,
        "old_name": "Very long",
        "new_name": "Very long (6+ hours)",
    },
]


def update_durations_forward(apps, schema_editor):
    level_duration_cls = apps.get_model("levels", "LevelDuration")
    for item in MAPPING:
        level_duration_cls.objects.filter(
            position=item["position"], name=item["old_name"]
        ).update(name=item["new_name"])


def update_durations_backward(apps, schema_editor):
    level_duration_cls = apps.get_model("levels", "LevelDuration")
    for item in MAPPING:
        level_duration_cls.objects.filter(
            position=item["position"], name=item["new_name"]
        ).update(name=item["old_name"])


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0012_levelfile_is_active"),
    ]

    operations = [
        migrations.RunPython(
            update_durations_forward,
            update_durations_backward,
        ),
    ]