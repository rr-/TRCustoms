import pytest

from trcustoms.awards.specs import DualPistolsAwardSpec
from trcustoms.conftest import LevelFactory, RatingClassFactory, UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = DualPistolsAwardSpec()
    spec.required = 3
    return spec


@pytest.mark.django_db
def test_dual_pistols_award_spec_success(spec: DualPistolsAwardSpec) -> None:
    rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.required):
        LevelFactory(authors=[user], rating_class=rating_class)
    assert spec.check_eligible(user, tier=None) is True


@pytest.mark.django_db
def test_dual_pistols_award_spec_unapproved_levels(
    spec: DualPistolsAwardSpec,
) -> None:
    rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.required - 1):
        LevelFactory(
            authors=[user], rating_class=rating_class, is_approved=True
        )
    LevelFactory(authors=[user], rating_class=rating_class, is_approved=False)
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_dual_pistols_award_spec_not_enough_levels(
    spec: DualPistolsAwardSpec,
) -> None:
    good_rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.required - 1):
        LevelFactory(
            authors=[user], rating_class=good_rating_class, is_approved=True
        )
    assert spec.check_eligible(user, tier=None) is False


@pytest.mark.django_db
def test_dual_pistols_award_spec_too_low_ratings(
    spec: DualPistolsAwardSpec,
) -> None:
    good_rating_class = RatingClassFactory(position=0)
    bad_rating_class = RatingClassFactory(position=-1)
    user = UserFactory()
    for _ in range(spec.required - 1):
        LevelFactory(
            authors=[user], rating_class=good_rating_class, is_approved=True
        )
    LevelFactory(
        authors=[user], rating_class=bad_rating_class, is_approved=True
    )
    assert spec.check_eligible(user, tier=None) is False
