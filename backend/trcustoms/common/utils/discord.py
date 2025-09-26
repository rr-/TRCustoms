import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_discord_webhook(payload: dict[str, Any], webhook_url: str) -> None:
    """Send a Discord webhook payload if webhook is configured."""
    if not webhook_url:
        return

    try:
        response = requests.post(
            webhook_url,
            json={
                "username": settings.DISCORD_WEBHOOK_USERNAME,
                "avatar_url": settings.DISCORD_WEBHOOK_AVATAR,
                **payload,
            },
        )
    except requests.RequestException as ex:
        logger.exception("Error while sending payload to Discord: %s", ex)
        return

    try:
        response.raise_for_status()
    except requests.RequestException as ex:
        logger.exception(
            "Error while sending payload to Discord: %s (%s)",
            ex,
            response.content,
        )
