from datetime import timedelta

import pytest

from trcustoms.awards.specs import AwardSpec, smugglers_key
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(smugglers_key())[0]
    spec.requirement.min_levels = 1
    return spec


@pytest.mark.django_db
def test_smugglers_key_award_spec_success(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level = LevelFactory()
    review = ReviewFactory(author=user, level=level)
    assert review.created - level.created < spec.requirement.max_review_age
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_smugglers_key_award_spec_success_too_late(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level = LevelFactory()
    review = ReviewFactory(author=user, level=level)
    review.created = (
        level.created + spec.requirement.max_review_age + timedelta(seconds=1)
    )
    review.save()
    assert review.created - level.created > spec.requirement.max_review_age
    assert spec.requirement(user) is False
