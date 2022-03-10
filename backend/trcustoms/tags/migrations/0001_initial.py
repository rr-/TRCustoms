# Generated by Django 4.0 on 2022-03-05 22:53

import django.db.models.functions.text
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="LevelTag",
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
            ],
            options={
                "ordering": ["name"],
                "default_permissions": [],
            },
        ),
        migrations.AddConstraint(
            model_name="leveltag",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("name"),
                name="tag_name_unique",
            ),
        ),
    ]