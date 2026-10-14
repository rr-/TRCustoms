from django.db import migrations


def create_feature_flags(apps, schema_editor):
    FeatureFlag = apps.get_model("config", "FeatureFlag")
    FeatureFlag.objects.get_or_create(name="messages")


class Migration(migrations.Migration):
    dependencies = [
        ("config", "0001_featureflag"),
    ]

    operations = [
        migrations.RunPython(create_feature_flags, migrations.RunPython.noop),
    ]
