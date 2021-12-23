# Generated by Django 3.2.6 on 2021-12-23 22:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0027_auto_20211223_1740"),
    ]

    operations = [
        migrations.CreateModel(
            name="LevelDifficulty",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "position",
                    models.IntegerField(),
                ),
                (
                    "created",
                    models.DateTimeField(auto_now_add=True, null=True),
                ),
                (
                    "last_updated",
                    models.DateTimeField(
                        auto_now=True, db_index=True, null=True
                    ),
                ),
                ("name", models.CharField(max_length=100)),
            ],
            options={
                "ordering": ["position"],
                "verbose_name_plural": "Level difficulties",
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="LevelDuration",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "position",
                    models.IntegerField(),
                ),
                (
                    "created",
                    models.DateTimeField(auto_now_add=True, null=True),
                ),
                (
                    "last_updated",
                    models.DateTimeField(
                        auto_now=True, db_index=True, null=True
                    ),
                ),
                ("name", models.CharField(max_length=100)),
            ],
            options={
                "ordering": ["position"],
                "abstract": False,
            },
        ),
        migrations.AddField(
            model_name="level",
            name="new_difficulty",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="trcustoms.leveldifficulty",
            ),
        ),
        migrations.AddField(
            model_name="level",
            name="new_duration",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="trcustoms.levelduration",
            ),
        ),
    ]
