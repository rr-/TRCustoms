from datetime import timedelta

import pytest

from trcustoms.awards.specs import PhilosophersStoneAwardSpec
from trcustoms.conftest import LevelFactory, RatingClassFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    return PhilosophersStoneAwardSpec()


@pytest.mark.django_db
def test_philosophers_stone_award_spec_success(
    spec: PhilosophersStoneAwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(position=spec.required_position)
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2.created = level1.created - spec.required_time_apart
    level2.save()
    assert spec.check_eligible(user, tier=None) is True


@pytest.mark.django_db
def test_philosophers_stone_award_spec_bad_ratings(
    spec: PhilosophersStoneAwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(position=spec.required_position)
    bad_rating_class = RatingClassFactory(position=spec.required_position - 1)
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=bad_rating_class)
    level2.created = level1.created - spec.required_time_apart
    level2.save()
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_philosophers_stone_award_spec_too_far_apart(
    spec: PhilosophersStoneAwardSpec,
) -> None:
    user = UserFactory()
    good_rating_class = RatingClassFactory(position=spec.required_position)
    level1 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2 = LevelFactory(authors=[user], rating_class=good_rating_class)
    level2.created = (
        level1.created - spec.required_time_apart - timedelta(days=1)
    )
    level2.save()
    assert spec.check_eligible(user, tier=None) is False
