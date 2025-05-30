import pytest

from trcustoms.community_events.tests.factories import (
    EventFactory,
    WinnerFactory,
)


@pytest.mark.django_db
def test_event_str():
    event = EventFactory(name="Back to Basics")
    assert str(event) == f"Back to Basics (id={event.pk})"


@pytest.mark.django_db
def test_winner_str():
    winner = WinnerFactory(place=2)
    expected = (
        f"{winner.event.name} winner #{winner.place}: {winner.user.username}"
    )
    assert str(winner) == expected
