from datetime import timedelta

import pytest

from trcustoms.awards.specs import BoneDustAwardSpec
from trcustoms.conftest import GenreFactory, LevelFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = BoneDustAwardSpec()
    spec.required = 3
    return spec


@pytest.mark.django_db
def test_bone_dust_award_spec_success(spec: BoneDustAwardSpec) -> None:
    user = UserFactory()
    genre = GenreFactory()
    level = LevelFactory(authors=[user], genres=[genre], is_approved=True)
    level.created = spec.required_max_date - timedelta(days=1)
    level.save()
    assert spec.check_eligible(user, tier=None) is True


@pytest.mark.django_db
def test_bone_dust_award_spec_no_levels(spec: BoneDustAwardSpec) -> None:
    user = UserFactory()
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_too_recent_levels(
    spec: BoneDustAwardSpec,
) -> None:
    user = UserFactory()
    genre = GenreFactory()
    LevelFactory(authors=[user], genres=[genre], is_approved=True)
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_missing_genres(spec: BoneDustAwardSpec) -> None:
    user = UserFactory()
    level = LevelFactory(authors=[user], is_approved=True)
    level.created = spec.required_max_date - timedelta(days=1)
    level.save()
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_bone_dust_award_spec_unapproved(spec: BoneDustAwardSpec) -> None:
    user = UserFactory()
    genre = GenreFactory()
    level = LevelFactory(authors=[user], genres=[genre], is_approved=False)
    level.created = spec.required_max_date - timedelta(days=1)
    level.save()
    assert spec.check_eligible(user, tier=None) is False
