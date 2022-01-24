# Generated by Django 4.0 on 2022-01-24 14:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0051_update_reviews"),
    ]

    operations = [
        migrations.CreateModel(
            name="LevelReviewAnswer",
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
                    "answer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="+",
                        to="trcustoms.reviewtemplateanswer",
                    ),
                ),
                (
                    "review",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="answers",
                        to="trcustoms.levelreview",
                    ),
                ),
            ],
        ),
    ]
