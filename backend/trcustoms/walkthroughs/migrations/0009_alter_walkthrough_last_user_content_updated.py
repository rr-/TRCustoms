# Generated by Django 4.2.3 on 2025-01-04 17:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("walkthroughs", "0008_auto_20241112_1209"),
    ]

    operations = [
        migrations.AlterField(
            model_name="walkthrough",
            name="last_user_content_updated",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
