# Generated by Django 4.2.3 on 2024-11-12 09:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("walkthroughs", "0006_alter_walkthrough_rejection_reason"),
    ]

    operations = [
        migrations.AddField(
            model_name="walkthrough",
            name="last_user_content_updated",
            field=models.DateTimeField(null=True),
        ),
    ]