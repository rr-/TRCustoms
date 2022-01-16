# Generated by Django 3.2.6 on 2022-01-06 22:00

from django.db import migrations


def migrate_upload_types(apps, schema_editor):
    LevelMedium = apps.get_model("trcustoms", "LevelMedium")
    Level = apps.get_model("trcustoms", "Level")
    UploadedFile = apps.get_model("trcustoms", "UploadedFile")

    def fix_uploaded_files(ids: set[int], upload_type: str) -> None:
        UploadedFile.objects.filter(id__in=ids).update(upload_type=upload_type)

    fix_uploaded_files(
        set(Level.objects.values_list("cover__id", flat=True)), "lb"
    )
    fix_uploaded_files(
        set(Level.objects.values_list("files__file__id", flat=True)), "lf"
    )
    fix_uploaded_files(
        set(LevelMedium.objects.values_list("file__id", flat=True)), "ls"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0040_auto_20220106_1302"),
    ]

    operations = [
        migrations.RunPython(migrate_upload_types, migrations.RunPython.noop),
    ]