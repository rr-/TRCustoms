# Generated by Django 4.2.3 on 2025-05-24 09:05

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0020_alter_level_last_user_content_updated"),
    ]

    operations = [
        migrations.AddField(
            model_name="level",
            name="walkthrough_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
