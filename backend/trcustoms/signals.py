from collections import defaultdict
from contextlib import contextmanager

from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_init,
    post_migrate,
    post_save,
    pre_delete,
    pre_init,
    pre_migrate,
    pre_save,
)


@contextmanager
def disable_signals():
    stashed_signals = defaultdict(list)
    disabled_signals = [
        pre_init,
        post_init,
        pre_save,
        post_save,
        pre_delete,
        post_delete,
        pre_migrate,
        post_migrate,
        m2m_changed,
    ]

    for signal in disabled_signals:
        stashed_signals[signal] = signal.receivers
        signal.receivers = []

    yield

    for signal in list(stashed_signals):
        signal.receivers = stashed_signals.get(signal, [])
        del stashed_signals[signal]
