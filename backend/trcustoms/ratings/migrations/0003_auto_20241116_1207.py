# Generated by Django 4.2.3 on 2024-11-16 12:07

from django.db import migrations

RESET_SEQUENCES_SQL = """
BEGIN;
SELECT setval(pg_get_serial_sequence('"ratings_ratingtemplatequestion"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "ratings_ratingtemplatequestion";
SELECT setval(pg_get_serial_sequence('"ratings_ratingtemplateanswer"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "ratings_ratingtemplateanswer";
SELECT setval(pg_get_serial_sequence('"ratings_rating_answers"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "ratings_rating_answers";
SELECT setval(pg_get_serial_sequence('"ratings_rating"','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "ratings_rating";
COMMIT;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("ratings", "0002_auto_20241115_1135"),
    ]

    operations = [
        migrations.RunSQL(RESET_SEQUENCES_SQL, migrations.RunSQL.noop)
    ]