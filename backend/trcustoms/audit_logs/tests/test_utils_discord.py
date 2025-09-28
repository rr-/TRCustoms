from unittest.mock import patch

import pytest
import requests
from django.contrib.contenttypes.models import ContentType
from django.test import override_settings

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.tests.factories import AuditLogFactory
from trcustoms.audit_logs.utils import notify_discord
from trcustoms.levels.models import Level
from trcustoms.reviews.models import Review
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.models import Walkthrough


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
    model = UserFactory(username="bob")
    audit_log = AuditLogFactory(
        change_type=ChangeType.UPDATE,
        change_author=user,
        changes=["field1", "field2"],
        is_action_required=True,
        object_id=model.id,
        object_type=ContentType.objects.get_for_model(model=model),
        object_name=model.username,
    )
    expected_desc = (
        f"**{str(audit_log.change_type).title()}** of "
        f"**User** #{model.id}"
        f"\n**Author:** {user.username}"
        f"\n**Changes:** {', '.join(audit_log.changes)} 🟡"
    )
    with patch("requests.post") as mock_post:
        notify_discord(audit_log)
    mock_post.assert_called_once_with(
        "http://example.com",
        json={
            "username": "Bot",
            "avatar_url": "https://example.com/av.jpg",
            "embeds": [
                {
                    "title": f"User: {model.username}",
                    "description": expected_desc,
                    "url": f"http://localhost/users/{model.id}",
                }
            ],
        },
    )


@pytest.mark.django_db
@override_settings(DISCORD_WEBHOOK_MOD_URL="http://example.com")
def test_exception_swallowed(settings):
    audit_log = AuditLogFactory(is_action_required=True)
    with patch("requests.post", side_effect=requests.RequestException):
        notify_discord(audit_log)


@pytest.mark.django_db
@override_settings(
    DISCORD_WEBHOOK_MOD_URL="http://webhook",
    HOST_SITE="https://frontend.test",
)
@pytest.mark.parametrize(
    "model_cls, expected_path",
    [
        (Level, "/levels/123"),
        (Walkthrough, "/walkthroughs/123"),
        (User, "/users/123"),
        (Review, "/reviews/123"),
        (AuditLog, None),
    ],
)
def test_notify_discord_frontend_link(settings, model_cls, expected_path):
    """Ensure embed URLs link to frontend for supported models."""
    ct: ContentType = ContentType.objects.get_for_model(model_cls)
    audit_log = AuditLogFactory(object_type=ct, object_id="123")
    with patch("requests.post") as mock_post:
        notify_discord(audit_log)
    _, kwargs = mock_post.call_args
    payload = kwargs["json"]
    embed = payload["embeds"][0]
    if expected_path:
        assert embed["url"] == f"{settings.HOST_SITE}{expected_path}"
    else:
        assert "url" not in embed
