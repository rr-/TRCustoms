# Generated by Django 4.1.3 on 2023-01-02 15:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0011_alter_featuredlevel_feature_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="levelfile",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]
