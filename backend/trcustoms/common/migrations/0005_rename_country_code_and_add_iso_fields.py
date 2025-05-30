from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0004_auto_20241127_1247"),
    ]

    operations = [
        migrations.RenameField(
            model_name="country",
            old_name="code",
            new_name="iso_3166_1_alpha2",
        ),
        migrations.AlterField(
            model_name="country",
            name="iso_3166_1_alpha2",
            field=models.CharField(max_length=2),
        ),
        migrations.AddField(
            model_name="country",
            name="iso_3166_1_numeric",
            field=models.CharField(max_length=3, null=True),
        ),
    ]
