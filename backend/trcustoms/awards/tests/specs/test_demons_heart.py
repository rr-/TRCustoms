import pytest

from trcustoms.awards.specs import AwardSpec, demons_heart
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(demons_heart())[0]
    spec.requirement.min_levels = 1
    return spec


@pytest.mark.django_db
def test_demons_heart_award_spec_success(spec: AwardSpec) -> None:
    user = UserFactory()
    PlaylistItemFactory(
        user=user,
        level__rating_class=RatingClassFactory(position=-1),
        status=PlaylistStatus.FINISHED,
    )
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_demons_heart_award_spec_not_played(spec: AwardSpec) -> None:
    user = UserFactory()
    PlaylistItemFactory(
        user=user,
        level__rating_class=RatingClassFactory(position=-1),
        status=PlaylistStatus.NOT_YET_PLAYED,
    )
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_demons_heart_award_spec_no_levels(spec: AwardSpec) -> None:
    user = UserFactory()
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_demons_heart_award_spec_too_well_rated_levels(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    PlaylistItemFactory(
        user=user, level__rating_class=RatingClassFactory(position=-1)
    )
    assert spec.requirement(user) is False
