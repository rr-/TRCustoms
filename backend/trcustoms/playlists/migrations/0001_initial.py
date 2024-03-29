# Generated by Django 4.1.3 on 2023-07-09 15:33

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("levels", "0014_auto_20230509_1033"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PlaylistItem",
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
                    "created",
                    models.DateTimeField(auto_now_add=True, null=True),
                ),
                (
                    "last_updated",
                    models.DateTimeField(
                        auto_now=True, db_index=True, null=True
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("not_yet_played", "Not yet played"),
                            ("playing", "Playing"),
                            ("finished", "Finished"),
                            ("dropped", "Dropped"),
                            ("on_hold", "On hold"),
                        ],
                        max_length=15,
                    ),
                ),
                (
                    "level",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="levels.level",
                        related_name="+",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                        related_name="+",
                    ),
                ),
            ],
            options={
                "ordering": ["-created"],
                "default_permissions": [],
            },
        ),
        migrations.AddConstraint(
            model_name="playlistitem",
            constraint=models.UniqueConstraint(
                models.F("level"),
                models.F("user"),
                name="playlist_level_user_unique",
            ),
        ),
    ]
