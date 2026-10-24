from datetime import timedelta

import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.utils import timezone

BEFORE = [("direct_messages", "0003_rename_administrator")]
AFTER = [("direct_messages", "0005_one_thread_per_pair")]


def migrate(targets):
    executor = MigrationExecutor(connection)
    executor.loader.build_graph()
    executor.migrate(targets)
    return executor.loader.project_state(targets).apps


@pytest.mark.django_db(transaction=True)
def test_merges_threads_between_the_same_users() -> None:
    apps = migrate(BEFORE)
    User = apps.get_model("users", "User")
    Thread = apps.get_model("direct_messages", "Thread")
    Message = apps.get_model("direct_messages", "Message")
    alice = User.objects.create(username="alice", email="alice@example.com")
    bob = User.objects.create(username="bob", email="bob@example.com")
    carol = User.objects.create(username="carol", email="carol@example.com")
    now = timezone.now()

    def thread(starter, recipient, subject, age):
        result = Thread.objects.create(
            subject=subject,
            starter=starter,
            recipient=recipient,
            last_message_at=now - timedelta(days=age),
        )
        Message.objects.create(
            thread=result, sender=starter, receiver=recipient, text=subject
        )
        return result

    first = thread(alice, bob, "first", age=3)
    thread(bob, alice, "second", age=1)
    thread(alice, bob, "third", age=2)
    other = thread(alice, carol, "other", age=5)
    orphan = thread(alice, None, "orphan", age=4)
    thread(alice, None, "orphan 2", age=4)

    apps = migrate(AFTER)
    Thread = apps.get_model("direct_messages", "Thread")
    Message = apps.get_model("direct_messages", "Message")

    merged = Thread.objects.get(pk=first.pk)
    assert merged.last_message_at == now - timedelta(days=1)
    assert sorted(
        Message.objects.filter(thread=merged).values_list("text", flat=True)
    ) == ["first", "second", "third"]
    assert Message.objects.filter(thread_id=other.pk).count() == 1
    assert Thread.objects.filter(pk=orphan.pk).exists()
    assert Thread.objects.count() == 4
