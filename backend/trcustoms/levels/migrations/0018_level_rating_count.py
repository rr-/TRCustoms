# Generated by Django 4.2.3 on 2024-11-15 12:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("levels", "0017_auto_20241112_1221"),
    ]

    operations = [
        migrations.AddField(
            model_name="level",
            name="rating_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
