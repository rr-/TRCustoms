from datetime import timedelta
from unittest.mock import patch

import pytest
from django.urls import reverse
from django.utils import timezone

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

    def test_detail_excludes_scheduled_levels(self, api_client):
        released = LevelFactory()
        scheduled = LevelFactory(
            release_date=timezone.localdate() + timedelta(days=1)
        )
        event = EventFactory(levels=[released, scheduled])
        url = reverse("event-detail", kwargs={"pk": event.id})
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert [lvl["id"] for lvl in data["levels"]] == [released.id]
        assert data["level_count"] == 1

    def test_level_count_follows_the_current_date(self, api_client):
        tomorrow = timezone.localdate() + timedelta(days=1)
        event = EventFactory(levels=[LevelFactory(release_date=tomorrow)])
        url = reverse("event-detail", kwargs={"pk": event.id})

        assert api_client.get(url).json()["level_count"] == 0

        with patch(
            "django.utils.timezone.now",
            return_value=timezone.now() + timedelta(days=1),
        ):
            assert api_client.get(url).json()["level_count"] == 1
