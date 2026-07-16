import pytest
from django.test import RequestFactory

from trcustoms.common.throttling import UnsafeOperationsRateThrottle


@pytest.fixture(name="throttle")
def fixture_throttle(monkeypatch) -> UnsafeOperationsRateThrottle:
    # Rates are stripped under TESTING; restore one so __init__ succeeds.
    monkeypatch.setattr(
        UnsafeOperationsRateThrottle,
        "THROTTLE_RATES",
        {"unsafe_operations": "10/min"},
    )
    return UnsafeOperationsRateThrottle()


def test_throttle_keys_on_real_ip_not_forwarded_for(
    throttle: UnsafeOperationsRateThrottle,
) -> None:
    """Spoofing X-Forwarded-For must not yield a fresh throttle bucket."""
    factory = RequestFactory()

    first = factory.post(
        "/",
        HTTP_X_REAL_IP="10.0.0.1",
        HTTP_X_FORWARDED_FOR="1.2.3.4, 10.0.0.1",
    )
    second = factory.post(
        "/",
        HTTP_X_REAL_IP="10.0.0.1",
        HTTP_X_FORWARDED_FOR="9.9.9.9, 10.0.0.1",
    )

    assert throttle.get_cache_key(first, None) == throttle.get_cache_key(
        second, None
    )


def test_throttle_distinguishes_different_real_ips(
    throttle: UnsafeOperationsRateThrottle,
) -> None:
    factory = RequestFactory()

    first = factory.post("/", HTTP_X_REAL_IP="10.0.0.1")
    second = factory.post("/", HTTP_X_REAL_IP="10.0.0.2")

    assert throttle.get_cache_key(first, None) != throttle.get_cache_key(
        second, None
    )
