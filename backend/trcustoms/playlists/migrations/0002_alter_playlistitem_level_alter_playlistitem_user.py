# Generated by Django 4.2.3 on 2023-08-06 13:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("levels", "0014_auto_20230509_1033"),
        ("playlists", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="playlistitem",
            name="level",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="playlist_items",
                to="levels.level",
            ),
        ),
        migrations.AlterField(
            model_name="playlistitem",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="playlist_items",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]