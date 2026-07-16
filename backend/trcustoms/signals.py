import threading
from contextlib import contextmanager

from django.dispatch import Signal

# Per-thread mute depth. Suppressing signals by blanking Signal.receivers (as
# this module used to) mutates process-global state, so under threaded workers
# one request would disable another's receivers and lose denormalization or
# audit-log side effects. Instead we gate dispatch on a thread-local counter:
# muting one thread never affects another.
_state = threading.local()


def _is_muted() -> bool:
    return getattr(_state, "mute_depth", 0) > 0


def _install_mute_guard() -> None:
    if getattr(Signal, "_trcustoms_mute_patched", False):
        return

    original_send = Signal.send
    original_send_robust = Signal.send_robust

    def send(self, sender, **named):
        if _is_muted():
            return []
        return original_send(self, sender, **named)

    def send_robust(self, sender, **named):
        if _is_muted():
            return []
        return original_send_robust(self, sender, **named)

    Signal.send = send
    Signal.send_robust = send_robust
    Signal._trcustoms_mute_patched = True


_install_mute_guard()


@contextmanager
def disable_signals():
    """Suppress signal dispatch for the current thread within the block.

    Model saves inside the block still hit the database; only the resulting
    signals are skipped, which is how denormalization handlers avoid
    re-triggering themselves.
    """
    _state.mute_depth = getattr(_state, "mute_depth", 0) + 1
    try:
        yield
    finally:
        _state.mute_depth -= 1
