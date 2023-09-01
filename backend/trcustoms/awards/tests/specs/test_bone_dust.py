from datetime import timedelta

import pytest

from trcustoms.awards.specs import AwardSpec, bone_dust
from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    return list(bone_dust())[0]


@pytest.mark.django_db
def test_bone_dust_award_spec_success(spec: AwardSpec) -> None:
    user = UserFactory()
    genre = GenreFactory()
    level = LevelFactory(authors=[user], genres=[genre], is_approved=True)
    level.created = spec.requirement.max_date - timedelta(days=1)
    level.save()
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_bone_dust_award_spec_no_levels(spec: AwardSpec) -> None:
    user = UserFactory()
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_too_recent_levels(spec: AwardSpec) -> None:
    user = UserFactory()
    genre = GenreFactory()
    LevelFactory(authors=[user], genres=[genre], is_approved=True)
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_missing_genres(spec: AwardSpec) -> None:
    user = UserFactory()
    level = LevelFactory(authors=[user], is_approved=True)
    level.created = spec.requirement.max_date - timedelta(days=1)
    level.save()
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_unapproved(spec: AwardSpec) -> None:
    user = UserFactory()
    genre = GenreFactory()
    level = LevelFactory(authors=[user], genres=[genre], is_approved=False)
    level.created = spec.requirement.max_date - timedelta(days=1)
    level.save()
    assert spec.requirement(user) is False
