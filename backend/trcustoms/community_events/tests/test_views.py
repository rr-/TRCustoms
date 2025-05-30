import pytest
from django.urls import reverse

from trcustoms.community_events.tests.factories import (
    EventFactory,
    WinnerFactory,
)
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestEventViews:
    def test_list(self, api_client):
        evt1 = EventFactory(name="A", levels=[LevelFactory(), LevelFactory()])
        evt2 = EventFactory(name="B", levels=[LevelFactory()])
        response = api_client.get(reverse("event-list"))
        assert response.status_code == 200
        data = response.json()
        assert {item["id"] for item in data.get("results", [])} == {
            evt1.id,
            evt2.id,
        }

    def test_filter_and_search(self, api_client):
        EventFactory(name="SearchMe", year=2022)
        EventFactory(name="Other", year=2023)
        response = api_client.get(
            reverse("event-list"), {"search": "Search", "year": 2022}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data.get("results", [])) == 1
        assert data["results"][0]["name"] == "SearchMe"

    def test_detail(self, api_client):
        host = UserFactory(username="hostuser")
        event = EventFactory(
            name="DetailEvent",
            levels=[LevelFactory()],
            host=host,
            about="desc",
        )
        WinnerFactory(event=event, place=1, user=UserFactory(username="win"))
        url = reverse("event-detail", kwargs={"pk": event.id})
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == event.id
        assert data["name"] == "DetailEvent"
        assert data["level_count"] == 1
        assert data["about"] == "desc"
        assert data["host"]["username"] == "hostuser"
        assert len(data.get("winners", [])) == 1
        assert data["winners"][0]["place"] == 1

    def test_detail_excludes_pending_levels(self, api_client):
        lvl1 = LevelFactory(is_approved=True)
        lvl2 = LevelFactory(is_approved=False)
        event = EventFactory(levels=[lvl1, lvl2])
        url = reverse("event-detail", kwargs={"pk": event.id})
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        ids = [lvl.get("id") for lvl in data.get("levels", [])]
        assert lvl1.id in ids
        assert lvl2.id not in ids
