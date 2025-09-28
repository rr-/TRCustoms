from unittest.mock import patch

import pytest
import requests
from django.test import override_settings

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.tests.factories import AuditLogFactory
from trcustoms.audit_logs.utils import notify_discord
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
@override_settings(DISCORD_WEBHOOK_MOD_URL=None)
def test_no_webhook(settings):
    audit_log = AuditLogFactory(is_action_required=True)
    with patch("requests.post") as mock_post:
        notify_discord(audit_log)
    mock_post.assert_not_called()


@pytest.mark.django_db
@override_settings(
    DISCORD_WEBHOOK_MOD_URL="http://example.com",
    DISCORD_WEBHOOK_USERNAME="Bot",
    DISCORD_WEBHOOK_AVATAR="https://example.com/av.jpg",
)
def test_posts_notification(settings):
    user = UserFactory(username="alice")
    audit_log = AuditLogFactory(
        change_type=ChangeType.UPDATE,
        change_author=user,
        changes=["field1", "field2"],
        is_action_required=True,
    )
    expected_desc = (
        f"**{str(audit_log.change_type).title()}** of "
        f"**{audit_log.object_type.model.title()}**"
        f" #{audit_log.object_id} ({audit_log.object_name})"
        f"\n**Author:** {user.username}"
        f"\n**Changes:** {', '.join(audit_log.changes)}"
    )
    with patch("requests.post") as mock_post:
        notify_discord(audit_log)
    mock_post.assert_called_once_with(
        "http://example.com",
        json={
            "username": "Bot",
            "avatar_url": "https://example.com/av.jpg",
            "embeds": [{"description": expected_desc}],
        },
    )


@pytest.mark.django_db
@override_settings(DISCORD_WEBHOOK_MOD_URL="http://example.com")
def test_exception_swallowed(settings):
    audit_log = AuditLogFactory(is_action_required=True)
    with patch("requests.post", side_effect=requests.RequestException):
        notify_discord(audit_log)
