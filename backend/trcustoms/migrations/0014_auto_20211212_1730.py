# Generated by Django 3.2.6 on 2021-12-12 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0013_auto_20211209_2320"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="source",
            field=models.CharField(
                choices=[("trle", "trle.net"), ("trcustoms", "trcustoms")],
                default="trcustoms",
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="user",
            name="bio",
            field=models.TextField(blank=True, default="", max_length=5000),
            preserve_default=False,
        ),
    ]