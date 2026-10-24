import pytest
from django.test import Client
from django.urls import reverse
from django.utils import timezone


@pytest.mark.django_db
def test_admin_timezone_does_not_leak_into_later_requests() -> None:
    Client().get(reverse("admin:index"))

    assert timezone.get_current_timezone_name() == "UTC"
