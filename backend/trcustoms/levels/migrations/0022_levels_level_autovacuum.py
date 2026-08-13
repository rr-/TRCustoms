from django.db import migrations

SET_OPTIONS = """
    ALTER TABLE levels_level SET (
        fillfactor = 90,
        autovacuum_vacuum_scale_factor = 0.05,
        autovacuum_analyze_scale_factor = 0.05
    )
"""

RESET_OPTIONS = """
    ALTER TABLE levels_level RESET (
        fillfactor,
        autovacuum_vacuum_scale_factor,
        autovacuum_analyze_scale_factor
    )
"""


class Migration(migrations.Migration):
    dependencies = [
        ("levels", "0021_level_walkthrough_count"),
    ]

    operations = [
        migrations.RunSQL(SET_OPTIONS, RESET_OPTIONS),
    ]
