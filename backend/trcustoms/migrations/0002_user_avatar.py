# Generated by Django 3.2.6 on 2021-11-16 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar",
            field=models.ImageField(
                blank=True, null=True, upload_to="avatars/"
            ),
        ),
    ]
