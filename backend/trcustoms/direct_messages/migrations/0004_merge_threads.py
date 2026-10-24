from django.db import migrations


def merge_threads(apps, schema_editor):
    Thread = apps.get_model("direct_messages", "Thread")
    Message = apps.get_model("direct_messages", "Message")
    threads_by_pair = {}
    for thread in Thread.objects.filter(
        starter__isnull=False, recipient__isnull=False
    ).order_by("created", "pk"):
        pair = frozenset((thread.starter_id, thread.recipient_id))
        threads_by_pair.setdefault(pair, []).append(thread)

    for kept, *duplicates in threads_by_pair.values():
        if not duplicates:
            continue
        Message.objects.filter(thread__in=duplicates).update(thread=kept)
        Thread.objects.filter(pk__in=[t.pk for t in duplicates]).delete()
        kept.last_message_at = max(
            thread.last_message_at for thread in (kept, *duplicates)
        )
        kept.save(update_fields=["last_message_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("direct_messages", "0003_rename_administrator"),
    ]

    operations = [
        migrations.RunPython(merge_threads, migrations.RunPython.noop),
    ]
