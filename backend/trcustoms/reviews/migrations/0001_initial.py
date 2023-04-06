# Generated by Django 4.0 on 2022-03-05 22:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ReviewTemplateQuestion",
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
            name="ReviewTemplateAnswer",
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
                        to="reviews.reviewtemplatequestion",
                    ),
                ),
            ],
            options={
                "ordering": ["question__position", "position"],
                "default_permissions": [],
            },
        ),
        migrations.CreateModel(
            name="LevelReview",
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
                    "review_type",
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
                    "trle_rating_gameplay",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_rating_enemies",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_rating_atmosphere",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "trle_rating_lighting",
                    models.IntegerField(blank=True, null=True),
                ),
                (
                    "text",
                    models.TextField(blank=True, max_length=5000, null=True),
                ),
                (
                    "answers",
                    models.ManyToManyField(
                        related_name="+", to="reviews.ReviewTemplateAnswer"
                    ),
                ),
            ],
            options={
                "ordering": ["-created"],
                "default_permissions": [],
            },
        ),
    ]
