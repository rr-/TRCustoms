# Generated by Django 4.2.3 on 2024-04-28 16:11

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("news", "0003_remove_news_authors"),
    ]

    operations = [
        migrations.AlterField(
            model_name="news",
            name="text",
            field=models.TextField(blank=True, null=True),
        ),
    ]
