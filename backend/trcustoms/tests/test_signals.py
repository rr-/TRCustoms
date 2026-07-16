import threading

from django.dispatch import Signal

from trcustoms.signals import disable_signals


def test_disable_signals_suppresses_dispatch() -> None:
    signal = Signal()
    calls = []
    signal.connect(lambda **kw: calls.append(kw["tag"]), weak=False)

    signal.send(sender=None, tag="before")
    with disable_signals():
        signal.send(sender=None, tag="during")
    signal.send(sender=None, tag="after")

    assert calls == ["before", "after"]


def test_disable_signals_is_thread_local() -> None:
    """Muting one thread must not suppress signals in another."""
    signal = Signal()
    calls = []
    signal.connect(lambda **kw: calls.append(kw["tag"]), weak=False)

    entered = threading.Event()
    released = threading.Event()

    def worker() -> None:
        entered.wait()
        # The main thread is muted right now; this send must still fire.
        signal.send(sender=None, tag="other")
        released.set()

    thread = threading.Thread(target=worker)
    thread.start()
    with disable_signals():
        entered.set()
        released.wait()
        signal.send(sender=None, tag="main")
    thread.join()

    assert "other" in calls
    assert "main" not in calls
