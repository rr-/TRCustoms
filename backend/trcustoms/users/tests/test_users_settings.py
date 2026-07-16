import pytest

from trcustoms.users.models import UserSettings
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_settings_created_with_user():
    """Every user gets a settings row (with defaults) on creation."""
    user = UserFactory()

    settings = user.settings
    assert isinstance(settings, UserSettings)
    assert UserSettings.objects.filter(user=user).count() == 1

    assert settings.email_review_posted is True
    assert settings.email_rating_posted is True
    assert settings.email_walkthrough_posted is True
    assert settings.email_review_updated is False
    assert settings.email_rating_updated is False
    assert settings.email_walkthrough_updated is False


@pytest.mark.django_db
def test_user_settings_persisted_values_are_read_back():
    user = UserFactory()
    user.settings.email_review_posted = False
    user.settings.save()

    assert UserSettings.objects.get(user=user).email_review_posted is False
