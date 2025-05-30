import pytest

from trcustoms.community_events.serializers import (
    EventDetailsSerializer,
    EventListingSerializer,
)
from trcustoms.community_events.tests.factories import (
    EventFactory,
    WinnerFactory,
)
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_event_listing_serializer_fields():
    # two levels on event
    event = EventFactory(levels=[LevelFactory(), LevelFactory()])
    serializer = EventListingSerializer(event)
    data = serializer.data
    assert set(data.keys()) == {
        "id",
        "name",
        "subtitle",
        "cover_image",
        "year",
        "level_count",
        "created",
        "last_updated",
    }
    assert data["level_count"] == 2


@pytest.mark.django_db
def test_event_details_serializer_includes_related():
    host = UserFactory(username="hostuser")
    event = EventFactory(
        levels=[LevelFactory(), LevelFactory()], host=host, about="About text"
    )
    WinnerFactory.create_batch(3, event=event)
    serializer = EventDetailsSerializer(event)
    data = serializer.data
    assert data["about"] == event.about
    assert data["host"]["username"] == host.username
    assert isinstance(data["winners"], list) and len(data["winners"]) == 3
    assert isinstance(data["levels"], list) and len(data["levels"]) == 2


@pytest.mark.django_db
def test_event_details_serializer_excludes_pending_levels():
    approved = LevelFactory(is_approved=True)
    pending = LevelFactory(is_approved=False)
    event = EventFactory(levels=[approved, pending])
    data = EventDetailsSerializer(event).data
    ids = [lvl["id"] for lvl in data["levels"]]
    assert approved.id in ids
    assert pending.id not in ids
