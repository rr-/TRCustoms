# Generated by Django 4.0 on 2022-03-08 15:10

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("engines", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="engine",
            options={"default_permissions": [], "ordering": ["position"]},
        ),
        migrations.AddField(
            model_name="engine",
            name="position",
            field=models.IntegerField(default=1),
        ),
    ]
