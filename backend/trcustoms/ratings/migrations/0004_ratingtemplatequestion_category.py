# Generated by Django 4.2.3 on 2024-11-16 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ratings", "0003_auto_20241116_1207"),
    ]

    operations = [
        migrations.AddField(
            model_name="ratingtemplatequestion",
            name="category",
            field=models.CharField(max_length=30, null=True),
        ),
    ]