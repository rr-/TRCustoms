# Generated by Django 4.0 on 2022-01-22 17:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0046_levelexternallink_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="level",
            name="disapproval_reason",
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]