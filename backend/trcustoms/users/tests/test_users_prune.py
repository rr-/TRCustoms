from datetime import timedelta

import pytest
from django.utils import timezone

from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.tasks import prune_unused_accounts
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.models import Walkthrough
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


def make_unconfirmed_user(**kwargs) -> User:
    user = UserFactory(
        is_active=False,
        is_email_confirmed=False,
        **kwargs,
    )
    User.objects.filter(pk=user.pk).update(
        date_joined=timezone.now() - timedelta(days=1)
    )
    return user


@pytest.mark.django_db
def test_prune_deletes_unconfirmed_signup() -> None:
    user = make_unconfirmed_user()

    prune_unused_accounts()

    assert not User.objects.filter(pk=user.pk).exists()


@pytest.mark.django_db
def test_prune_skips_recent_signup() -> None:
    user = UserFactory(is_active=False, is_email_confirmed=False)

    prune_unused_accounts()

    assert User.objects.filter(pk=user.pk).exists()


@pytest.mark.django_db
def test_prune_skips_deactivated_established_account() -> None:
    user = make_unconfirmed_user(
        last_login=timezone.now() - timedelta(days=30)
    )
    walkthrough = WalkthroughFactory(author=user)

    prune_unused_accounts()

    assert User.objects.filter(pk=user.pk).exists()
    walkthrough.refresh_from_db()
    assert walkthrough.author == user


@pytest.mark.django_db
def test_prune_wipes_unconfirmed_signup_with_walkthroughs() -> None:
    user = make_unconfirmed_user()
    walkthrough = WalkthroughFactory(author=user)

    prune_unused_accounts()

    user.refresh_from_db()
    assert user.email == ""
    assert Walkthrough.objects.get(pk=walkthrough.pk).author == user


@pytest.mark.django_db
def test_prune_wipes_unconfirmed_signup_with_ratings() -> None:
    user = make_unconfirmed_user()
    RatingFactory(author=user)

    prune_unused_accounts()

    user.refresh_from_db()
    assert user.email == ""
    assert user.rated_levels.count() == 1
