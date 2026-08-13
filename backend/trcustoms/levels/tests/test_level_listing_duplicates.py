import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


def get_level_ids(api_client: APIClient, params: dict[str, str]) -> list[int]:
    resp = api_client.get(
        "/api/levels/",
        data={"disable_paging": "1", **params},
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    return [item["id"] for item in resp.json()["results"]]


@pytest.mark.django_db
def test_level_list_does_not_duplicate_multi_walkthrough_levels(
    api_client: APIClient,
) -> None:
    level = LevelFactory(is_approved=True)
    for _ in range(3):
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            status=WalkthroughStatus.APPROVED,
        )

    level_ids = get_level_ids(api_client, {"text_walkthroughs": "1"})

    assert level_ids == [level.pk]


@pytest.mark.django_db
def test_level_list_excludes_levels_without_walkthroughs(
    api_client: APIClient,
) -> None:
    with_walkthrough = LevelFactory(is_approved=True)
    WalkthroughFactory(
        level=with_walkthrough,
        walkthrough_type=WalkthroughType.TEXT,
        status=WalkthroughStatus.APPROVED,
    )
    without_walkthrough = LevelFactory(is_approved=True)

    assert get_level_ids(api_client, {"text_walkthroughs": "1"}) == [
        with_walkthrough.pk
    ]
    assert get_level_ids(api_client, {"text_walkthroughs": "0"}) == [
        without_walkthrough.pk
    ]


@pytest.mark.django_db
def test_level_list_shows_own_pending_level_once(
    get_auth_api_client,
) -> None:
    author = UserFactory(username="pending_author")
    coauthor = UserFactory(username="pending_coauthor")
    level = LevelFactory(
        is_approved=False,
        is_pending_approval=True,
        authors=[author, coauthor],
    )
    api_client = get_auth_api_client(author)

    level_ids = get_level_ids(api_client, {})

    assert level_ids == [level.pk]


@pytest.mark.django_db
def test_level_list_hides_other_users_pending_levels(
    get_auth_api_client,
) -> None:
    author = UserFactory(username="other_author")
    viewer = UserFactory(username="viewer")
    LevelFactory(is_approved=False, is_pending_approval=True, authors=[author])
    approved = LevelFactory(is_approved=True, authors=[author])
    api_client = get_auth_api_client(viewer)

    level_ids = get_level_ids(api_client, {})

    assert level_ids == [approved.pk]


@pytest.mark.django_db
def test_level_list_total_count_matches_result_count(
    api_client: APIClient,
) -> None:
    level = LevelFactory(is_approved=True)
    for _ in range(3):
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            status=WalkthroughStatus.APPROVED,
        )

    resp = api_client.get("/api/levels/", data={"text_walkthroughs": "1"})

    assert resp.status_code == status.HTTP_200_OK, resp.content
    result = resp.json()
    assert result["total_count"] == 1
    assert len(result["results"]) == 1
