from datetime import timedelta

import pytest

from trcustoms.awards.specs import AwardSpec, philosophers_stone
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    return list(philosophers_stone())[0]


@pytest.mark.django_db
def test_philosophers_stone_award_spec_success(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(
        position=spec.requirement.min_rating_class
    )
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2.created = level1.created - spec.requirement.max_time_apart
    level2.save()
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_philosophers_stone_award_spec_bad_ratings(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(
        position=spec.requirement.min_rating_class
    )
    bad_rating_class = RatingClassFactory(
        position=spec.requirement.min_rating_class - 1
    )
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=bad_rating_class)
    level2.created = level1.created - spec.requirement.max_time_apart
    level2.save()
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_philosophers_stone_award_spec_too_far_apart(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(
        position=spec.requirement.min_rating_class
    )
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2.created = (
        level1.created - spec.requirement.max_time_apart - timedelta(days=1)
    )
    level2.save()
    assert spec.requirement(user) is False
