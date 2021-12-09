# Generated by Django 3.2.6 on 2021-12-08 16:21

from django.db import migrations, models


def update_file_sizes(apps, schema_editor):
    LevelFile = apps.get_model("trcustoms", "LevelFile")
    for file in LevelFile.objects.all():
        file.size = file.file.size
        file.save()


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0007_alter_levelfile_level"),
    ]

    operations = [
        migrations.AddField(
            model_name="levelfile",
            name="size",
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.RunPython(update_file_sizes, migrations.RunPython.noop),
    ]