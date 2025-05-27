import pytest

from trcustoms.users.models import UserSettings
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_settings_auto_created_on_access():
    user = UserFactory()
    UserSettings.objects.filter(user=user).delete()
    assert not UserSettings.objects.filter(user=user).exists()

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
def test_user_settings_returns_existing_instance():
    user = UserFactory()
    UserSettings.objects.filter(user=user).delete()

    existing = UserSettings.objects.create(
        user=user, email_review_posted=False
    )
    settings = user.settings
    assert settings.pk == existing.pk
    assert settings.email_review_posted is False
    assert UserSettings.objects.filter(user=user).count() == 1

    settings2 = user.settings
    assert settings2.pk == existing.pk
