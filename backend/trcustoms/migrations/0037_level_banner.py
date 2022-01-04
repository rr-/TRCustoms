# Generated by Django 3.2.6 on 2022-01-04 20:03
import django.db.models.deletion
from django.db import migrations, models


def migrate_banners(apps, schema_editor):
    LevelMedium = apps.get_model("trcustoms", "LevelMedium")
    for medium in LevelMedium.objects.filter(position=0):
        level = medium.level
        level.banner = medium.file
        level.save(update_fields=["banner"])
        medium.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("trcustoms", "0036_auto_20220104_0019"),
    ]

    operations = [
        migrations.AddField(
            model_name="level",
            name="banner",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="trcustoms.uploadedfile",
            ),
        ),
        migrations.RunPython(migrate_banners, migrations.RunPython.noop),
    ]
