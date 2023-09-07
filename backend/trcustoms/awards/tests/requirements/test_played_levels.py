import pytest

from trcustoms.awards.requirements.impl import PlayedLevelsAwardRequirement
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.tests.factories import PlaylistItemFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
@pytest.mark.parametrize(
    "played_level_statuses, min_levels, expected_result",
    [
        ([], 0, True),
        ([], 1, False),
        ([PlaylistStatus.DROPPED], 1, False),
        ([PlaylistStatus.FINISHED], 1, True),
        ([PlaylistStatus.ON_HOLD], 1, False),
        ([PlaylistStatus.NOT_YET_PLAYED], 1, False),
        ([PlaylistStatus.PLAYING], 1, False),
        ([PlaylistStatus.FINISHED, PlaylistStatus.FINISHED], 2, True),
    ],
)
def test_played_levels_award_requirement(
    played_level_statuses: list[PlaylistStatus],
    min_levels: int,
    expected_result: bool,
) -> None:
    user = UserFactory()
    for status in played_level_statuses:
        PlaylistItemFactory(user=user, status=status)

    actual_result = PlayedLevelsAwardRequirement(
        min_levels=min_levels
    ).check_eligible(user)
    assert actual_result == expected_result
