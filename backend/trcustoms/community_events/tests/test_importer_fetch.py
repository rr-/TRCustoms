from unittest.mock import Mock, call, patch

import pytest
import requests
from django.contrib.messages.storage.cookie import CookieStorage
from django.test import RequestFactory

from trcustoms.community_events.importer import (
    MAX_FETCH_ATTEMPTS,
    USER_AGENT,
    _fetch_cover_image,
)
from trcustoms.community_events.tests.factories import EventFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(autouse=True, name="setup_request_messages")
def fixture_setup_request_messages():
    """
    Prepare a Django request with a user and message storage for testing.
    """
    request = RequestFactory().post("/")
    request.user = UserFactory()
    # Attach messages framework storage (cookie-based)
    messages_storage = CookieStorage(request)
    setattr(request, "_messages", messages_storage)
    return request


@pytest.mark.django_db
def test_fetch_cover_image_success(setup_request_messages):
    request = setup_request_messages
    event = EventFactory(cover_image=None)
    url = "http://example.com/image.png"
    row = {"IMG URL": url}

    with (
        patch(
            "trcustoms.community_events.importer.requests.get",
            autospec=True,
            return_value=Mock(content=b"data"),
        ) as mock_get,
        patch(
            "trcustoms.community_events.importer.time.sleep",
            new=lambda s: None,
        ),
    ):
        assert event.cover_image is None
        _fetch_cover_image(row, request, event, name="evt")

    mock_get.assert_called_once_with(
        url,
        timeout=10,
        headers={"User-Agent": USER_AGENT},
        verify=False,
    )

    # Event should now have a cover image uploaded
    event.refresh_from_db()
    assert event.cover_image is not None
    uploaded = event.cover_image
    assert uploaded.size == len(b"data")


@pytest.mark.django_db
def test_fetch_cover_image_retries_and_failure(setup_request_messages):
    request = setup_request_messages
    event = EventFactory(cover_image=None)
    url = "http://example.com/image.png"
    row = {"IMG URL": url}
    sleeps = []
    # Patch requests.get to always fail and time.sleep to record sleeps
    with (
        patch(
            "trcustoms.community_events.importer.requests.get",
            side_effect=requests.RequestException("fail"),
        ) as mock_get,
        patch(
            "trcustoms.community_events.importer.time.sleep",
            new=sleeps.append,
        ),
    ):
        _fetch_cover_image(row, request, event, name="evt")
    event.refresh_from_db()

    assert mock_get.call_count == MAX_FETCH_ATTEMPTS
    expected_call = call(
        url,
        timeout=10,
        headers={"User-Agent": USER_AGENT},
        verify=False,
    )
    assert mock_get.call_args_list == [expected_call] * MAX_FETCH_ATTEMPTS

    # Should sleep between attempts (MAX_FETCH_ATTEMPTS - 1 times)
    assert len(sleeps) == MAX_FETCH_ATTEMPTS - 1

    # No cover image created on failure
    assert event.cover_image is None

    # One warning message should have been recorded
    assert any(
        "Could not fetch cover URL" in str(m) for m in request._messages
    )
