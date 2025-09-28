import csv
import io
from datetime import datetime, timezone

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client
from django.urls import reverse
from rest_framework import status

from trcustoms.community_events.models import Event
from trcustoms.community_events.tests.factories import EventFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="admin_client")
def fixture_client():
    admin_user = UserFactory(is_staff=True, is_superuser=True)
    client = Client()
    client.force_login(admin_user)
    return client


@pytest.mark.django_db
class TestAdminImportCSV:
    def test_import_creates_and_updates(self, admin_client):
        initial_dt = datetime(2001, 1, 1, 12, 0, tzinfo=timezone.utc)
        existing_event = EventFactory(
            name="test 1",
            subtitle="party",
            year=2003,
            about="old about",
            collection_release=initial_dt,
        )
        header = [
            "Name",
            "Subtitle",
            "Year",
            "About",
            "Collection R Date",
            "Collection R Time",
            "Host",
            "Levels",
            "Win Places",
            "Win Users",
            "IMG URL",
        ]
        rows = [
            [
                "test 1",
                "party",
                "2003",
                "new about",
                "04/11/2003",
                "12:00:00",
                "",
                "",
                "",
                "",
                "",
            ],
            [
                "test 2",
                "",
                "2021",
                "second",
                "05/05/2021",
                "13:30:00",
                "",
                "",
                "",
                "",
                "",
            ],
        ]

        buf = io.StringIO()
        writer = csv.writer(buf, delimiter="\t")
        writer.writerow(header)
        for row in rows:
            writer.writerow(row)

        data = buf.getvalue().encode("utf-8")
        upload = SimpleUploadedFile(
            "import.tsv", data, content_type="text/tab-separated-values"
        )
        url = reverse("admin:community_events_event_import_csv")
        response = admin_client.post(url, {"csv_file": upload}, follow=True)
        existing_event.refresh_from_db()

        new_event = Event.objects.filter(name="test 2", subtitle=None).first()
        msgs = list(response.context.get("messages"))

        assert response.status_code == status.HTTP_200_OK
        assert Event.objects.count() == 2
        assert existing_event.year == 2003
        assert existing_event.about == "new about"
        assert new_event is not None
        assert new_event.year == 2021
        assert new_event.about == "second"
        assert any("Imported 2 events" in str(m) for m in msgs)
