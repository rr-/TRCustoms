# Generated by Django 4.0.2 on 2022-09-29 23:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("levels", "0010_auto_20220707_1447"),
    ]

    operations = [
        migrations.AlterField(
            model_name="featuredlevel",
            name="feature_type",
            field=models.CharField(
                choices=[
                    ("new", "New release"),
                    ("gem", "Monthly hidden gem"),
                    ("lod", "Level of the day"),
                    ("big", "Best in genre"),
                ],
                max_length=3,
            ),
        ),
    ]