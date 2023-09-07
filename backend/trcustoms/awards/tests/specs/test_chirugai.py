from datetime import timedelta

import pytest

from trcustoms.awards.specs import AwardSpec, chirugai
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    return list(chirugai())[0]


@pytest.mark.django_db
def test_chirugai_award_spec_success(spec: AwardSpec) -> None:
    user = UserFactory()
    level1 = LevelFactory(authors=[user])
    level2 = LevelFactory(authors=[user])
    level2.created = level1.created + spec.requirement.min_time_apart
    level2.save()
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_chirugai_award_spec_not_enough_levels(spec: AwardSpec) -> None:
    user = UserFactory()
    LevelFactory(authors=[user])
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_chirugai_award_spec_too_recent_level(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level1 = LevelFactory(authors=[user])
    level2 = LevelFactory(authors=[user])
    level2.created = (
        level1.created + spec.requirement.min_time_apart - timedelta(days=1)
    )
    level2.save()
    assert spec.requirement(user) is False
