import django.utils.timezone
from django.db import migrations, models

BACKFILL = """
    UPDATE levels_level SET
        release_date = COALESCE(
            (created AT TIME ZONE 'UTC')::date,
            (now() AT TIME ZONE 'UTC')::date
        ),
        announced_at = CASE
            WHEN is_approved THEN COALESCE(created, now())
        END
"""


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0022_levels_level_autovacuum"),
    ]

    operations = [
        migrations.AddField(
            model_name="level",
            name="release_date",
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name="level",
            name="announced_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunSQL(BACKFILL, migrations.RunSQL.noop),
        migrations.AlterField(
            model_name="level",
            name="release_date",
            field=models.DateField(
                db_index=True, default=django.utils.timezone.localdate
            ),
        ),
    ]
