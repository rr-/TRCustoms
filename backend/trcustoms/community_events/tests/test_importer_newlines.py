from unittest.mock import Mock, patch

import pytest

from trcustoms.community_events.importer import import_events_from_string
from trcustoms.community_events.models import Event
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_import_subtitle_and_about_newlines():
    # pylint: disable=C0301
    data = """Name	Subtitle	Year	IMG URL	About	Collection R Date	Collection R Time	Host	Levels	Win Places	Win Users
test 1	party	2003	https://www.trle.net/BtBpackages/2005_Catacombs.jpg	sdf a l\\n\\notdf \\n\\ngdfg \\n\\n sdfgsdf	04/11/2003	12:00:00	2250	"3726,3725,3724,3723,3722"	"1,2,3"	"2239,2225,2250"""

    with patch("trcustoms.community_events.importer.messages"):
        count = import_events_from_string(data, Mock(user=UserFactory()))
    assert count == 1

    event = Event.objects.get(name="test 1", year=2003)
    assert event.subtitle == "party"
    assert event.about == "sdf a l\n\notdf \n\ngdfg \n\n sdfgsdf"
