# Generated by Django 4.2.3 on 2024-11-15 11:30

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("levels", "0017_auto_20241112_1221"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("common", "0002_alter_country_options"),
    ]

    operations = [
        migrations.CreateModel(
            name="RatingTemplateQuestion",
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
                ("position", models.IntegerField()),
                ("weight", models.IntegerField()),
                ("question_text", models.CharField(max_length=100)),
            ],
            options={
                "ordering": ["position"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="RatingTemplateAnswer",
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
                ("position", models.IntegerField()),
                ("points", models.IntegerField()),
                ("answer_text", models.CharField(max_length=100)),
                (
                    "question",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="answers",
                        to="ratings.ratingtemplatequestion",
                    ),
                ),
            ],
            options={
                "ordering": ["question__position", "position"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="Rating",
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
                ("last_user_content_updated", models.DateTimeField(null=True)),
                ("position", models.IntegerField(default=0)),
                (
                    "rating_type",
                    models.CharField(
                        choices=[
                            ("le", "Legacy (TRLE.net)"),
                            ("mo", "Modern (TRCustoms)"),
                        ],
                        default="le",
                        max_length=2,
                    ),
                ),
                (
                    "trle_score_gameplay",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_score_enemies",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_score_atmosphere",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_score_lighting",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "answers",
                    models.ManyToManyField(
                        related_name="+", to="ratings.ratingtemplateanswer"
                    ),
                ),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="rated_levels",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "level",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ratings",
                        to="levels.level",
                    ),
                ),
                (
                    "rating_class",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="common.ratingclass",
                    ),
                ),
            ],
            options={
                "ordering": ["-created"],
                "default_permissions": [],
            },
        ),
        migrations.AddConstraint(
            model_name="rating",
            constraint=models.UniqueConstraint(
                models.F("level"),
                models.F("author"),
                name="rating_level_author_unique",
            ),
        ),
    ]
