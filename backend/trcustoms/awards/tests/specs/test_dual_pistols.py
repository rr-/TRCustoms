import pytest

from trcustoms.awards.specs import AwardSpec, dual_pistols
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(dual_pistols())[0]
    spec.requirement.min_levels = 3
    return spec


@pytest.mark.django_db
def test_dual_pistols_award_spec_success(spec: AwardSpec) -> None:
    rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.requirement.min_levels):
        LevelFactory(authors=[user], rating_class=rating_class)
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_dual_pistols_award_spec_unapproved_levels(
    spec: AwardSpec,
) -> None:
    rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.requirement.min_levels - 1):
        LevelFactory(
            authors=[user], rating_class=rating_class, is_approved=True
        )
    LevelFactory(authors=[user], rating_class=rating_class, is_approved=False)
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_dual_pistols_award_spec_not_enough_levels(
    spec: AwardSpec,
) -> None:
    good_rating_class = RatingClassFactory(position=0)
    user = UserFactory()
    for _ in range(spec.requirement.min_levels - 1):
        LevelFactory(
            authors=[user], rating_class=good_rating_class, is_approved=True
        )
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_dual_pistols_award_spec_too_low_ratings(
    spec: AwardSpec,
) -> None:
    good_rating_class = RatingClassFactory(position=0)
    bad_rating_class = RatingClassFactory(position=-1)
    user = UserFactory()
    for _ in range(spec.requirement.min_levels - 1):
        LevelFactory(
            authors=[user], rating_class=good_rating_class, is_approved=True
        )
    LevelFactory(
        authors=[user], rating_class=bad_rating_class, is_approved=True
    )
    assert spec.requirement(user) is False
