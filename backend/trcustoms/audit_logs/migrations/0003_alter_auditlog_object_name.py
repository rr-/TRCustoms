# Generated by Django 4.0.2 on 2022-09-29 23:02

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("audit_logs", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="auditlog",
            name="object_name",
            field=models.CharField(max_length=256),
        ),
    ]
