import django.db.models.functions.comparison
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("direct_messages", "0004_merge_threads"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="message",
            options={"default_permissions": [], "ordering": ["created", "pk"]},
        ),
        migrations.RemoveField(
            model_name="thread",
            name="subject",
        ),
        migrations.AddConstraint(
            model_name="thread",
            constraint=models.UniqueConstraint(
                django.db.models.functions.comparison.Least(
                    "starter", "recipient"
                ),
                django.db.models.functions.comparison.Greatest(
                    "starter", "recipient"
                ),
                condition=models.Q(
                    ("recipient__isnull", False), ("starter__isnull", False)
                ),
                name="unique_thread_participants",
            ),
        ),
    ]
