# Generated by Django 4.0 on 2022-03-23 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("levels", "0004_level_is_pending_approval"),
    ]

    operations = [
        migrations.AlterField(
            model_name="level",
            name="is_pending_approval",
            field=models.BooleanField(default=True),
        ),
    ]
