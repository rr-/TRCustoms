# Generated by Django 4.0 on 2022-03-05 22:53

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="FeaturedLevel",
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
                    "feature_type",
                    models.CharField(
                        choices=[
                            ("gem", "Monthly hidden gem"),
                            ("lod", "Level of the day"),
                            ("big", "Best in genre"),
                        ],
                        max_length=3,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Level",
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
                ("name", models.CharField(max_length=100)),
                (
                    "description",
                    models.TextField(blank=True, max_length=5000, null=True),
                ),
                ("trle_id", models.IntegerField(blank=True, null=True)),
                ("is_approved", models.BooleanField(default=False)),
                (
                    "rejection_reason",
                    models.CharField(blank=True, max_length=200, null=True),
                ),
                ("download_count", models.IntegerField(default=0)),
            ],
            options={
                "ordering": ["-created"],
                "default_permissions": [],
            },
        ),
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
                ("position", models.IntegerField()),
            ],
            options={
                "verbose_name_plural": "Level difficulties",
                "ordering": ["position"],
                "default_permissions": [],
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
                ("position", models.IntegerField()),
            ],
            options={
                "ordering": ["position"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="LevelExternalLink",
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
                ("url", models.URLField(max_length=256)),
                ("position", models.IntegerField()),
                (
                    "link_type",
                    models.CharField(
                        choices=[("sh", "Showcase"), ("ma", "Main")],
                        max_length=2,
                    ),
                ),
            ],
            options={
                "ordering": ["level", "position"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="LevelFile",
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
                ("version", models.IntegerField()),
                ("download_count", models.IntegerField(default=0)),
            ],
            options={
                "ordering": ["version"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="LevelScreenshot",
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
                ("position", models.IntegerField(default=1)),
            ],
            options={
                "ordering": ["position"],
                "default_permissions": [],
            },
        ),
    ]
