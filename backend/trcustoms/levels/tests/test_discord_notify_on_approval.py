from unittest.mock import patch

import pytest
from django.test import override_settings

from trcustoms.levels.logic import approve_level
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
@override_settings(
    DISCORD_WEBHOOK_LEVEL_URL="http://example.com",
    DISCORD_WEBHOOK_USERNAME="BotUser",
    DISCORD_WEBHOOK_AVATAR="https://example.com/avatar.png",
)
def test_approve_level_sends_discord_notification(settings):
    author = UserFactory()
    level = LevelFactory(
        is_approved=False, name="escape from the test crypt", authors=[author]
    )
    with patch("requests.post") as mock_post:
        approve_level(level, request=None)

    expected_payload = {
        "username": "BotUser",
        "avatar_url": "https://example.com/avatar.png",
        "embeds": [
            {
                "color": 0x2196F3,
                "url": f"http://localhost/levels/{level.id}",
                "title": "escape from the test crypt",
                "description": f"by {author.username}",
            }
        ],
    }
    mock_post.assert_called_once_with(
        "http://example.com", json=expected_payload
    )
