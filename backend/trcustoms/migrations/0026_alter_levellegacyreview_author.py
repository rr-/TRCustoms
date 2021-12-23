# Generated by Django 3.2.6 on 2021-12-23 17:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0025_alter_levelmedium_level"),
    ]

    operations = [
        migrations.AlterField(
            model_name="levellegacyreview",
            name="author",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="reviewed_levels",
                to="trcustoms.user",
            ),
        ),
    ]