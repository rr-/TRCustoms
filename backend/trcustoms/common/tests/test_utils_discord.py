from unittest.mock import patch

import pytest
import requests
from django.test import override_settings

from trcustoms.common.utils.discord import send_discord_webhook


@pytest.mark.django_db
def test_no_webhook(settings):
    payload = {"key": "value"}
    with patch("requests.post") as mock_post:
        send_discord_webhook(payload, webhook_url=None)
    mock_post.assert_not_called()


@pytest.mark.django_db
@override_settings(
    DISCORD_WEBHOOK_USERNAME="Bot",
    DISCORD_WEBHOOK_AVATAR="https://example.com/avatar.png",
)
def test_posts_payload_with_default_settings(settings):
    payload = {"foo": "bar"}
    with patch("requests.post") as mock_post:
        send_discord_webhook(payload, webhook_url="http://example.com")
    mock_post.assert_called_once_with(
        "http://example.com",
        json={
            "username": "Bot",
            "avatar_url": "https://example.com/avatar.png",
            "foo": "bar",
        },
    )


@pytest.mark.django_db
def test_exception_swallowed(settings):
    payload = {"data": 123}
    with patch("requests.post", side_effect=requests.RequestException):
        send_discord_webhook(payload, webhook_url="http://example.com")
