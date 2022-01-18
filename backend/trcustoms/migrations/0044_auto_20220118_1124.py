# Generated by Django 3.2.6 on 2022-01-18 11:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0043_auto_20220118_1118"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="levelscreenshot",
            options={
                "ordering": ["position"],
            },
        ),
        migrations.AlterField(
            model_name="levelscreenshot",
            name="level",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="screenshots",
                to="trcustoms.level",
            ),
        ),
    ]
