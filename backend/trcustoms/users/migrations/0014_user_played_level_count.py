# Generated by Django 4.2.3 on 2023-08-06 13:36

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0013_alter_user_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="played_level_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
