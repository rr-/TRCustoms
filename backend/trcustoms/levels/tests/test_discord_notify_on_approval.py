from datetime import timedelta
from unittest.mock import patch

import pytest
from django.test import override_settings
from django.utils import timezone

from trcustoms.levels.logic import approve_level
from trcustoms.levels.models import Level
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.tasks import release_scheduled_levels
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


@pytest.mark.django_db
@override_settings(DISCORD_WEBHOOK_LEVEL_URL="http://example.com")
def test_approve_scheduled_level_waits_for_release_date():
    author = UserFactory()
    level = LevelFactory(
        is_approved=False,
        release_date=timezone.localdate() + timedelta(days=1),
        authors=[author],
    )
    with patch("requests.post") as mock_post:
        approve_level(level, request=None)
        release_scheduled_levels()
    mock_post.assert_not_called()
    author.refresh_from_db()
    assert author.authored_level_count_approved == 0

    Level.objects.filter(pk=level.pk).update(release_date=timezone.localdate())
    with patch("requests.post") as mock_post:
        release_scheduled_levels()
        release_scheduled_levels()
    mock_post.assert_called_once()
    author.refresh_from_db()
    assert author.authored_level_count_approved == 1


@pytest.mark.django_db
@override_settings(DISCORD_WEBHOOK_LEVEL_URL="http://example.com")
def test_reapproving_level_does_not_announce_again():
    level = LevelFactory(is_approved=False)
    with patch("requests.post") as mock_post:
        approve_level(level, request=None)
        level.is_approved = False
        level.save()
        approve_level(level, request=None)
    mock_post.assert_called_once()
