"""Middleware definitions."""

from zoneinfo import ZoneInfo

from django.urls import reverse
from django.utils import timezone


class TimezoneMiddleware:
    """Default request timezone.

    Used to display dates in a common timezone in the admin interface.
    """

    def __init__(self, get_response):
        """Initialize self."""
        self.get_response = get_response

    def __call__(self, request):
        """Run the middleware."""
        if request.path.startswith(reverse("admin:index")):
            timezone.activate(ZoneInfo("Europe/Warsaw"))
        return self.get_response(request)
