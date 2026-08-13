import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.filters import MAX_FILTER_IDS
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.tags.tests.factories import TagFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.utils import parse_ints


def get_level_ids(api_client: APIClient, params: dict[str, str]) -> set[int]:
    resp = api_client.get(
        "/api/levels/",
        data={"disable_paging": "1", **params},
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    return {item["id"] for item in resp.json()["results"]}


@pytest.mark.django_db
def test_level_list_tag_filter_requires_all_tags(
    api_client: APIClient,
) -> None:
    tag1 = TagFactory()
    tag2 = TagFactory()
    both_level = LevelFactory(is_approved=True, tags=[tag1, tag2])
    one_level = LevelFactory(is_approved=True, tags=[tag1])
    LevelFactory(is_approved=True, tags=[])

    level_ids = get_level_ids(api_client, {"tags": f"{tag1.pk},{tag2.pk}"})

    assert level_ids == {both_level.pk}
    assert one_level.pk not in level_ids


@pytest.mark.django_db
def test_level_list_genre_filter_requires_all_genres(
    api_client: APIClient,
) -> None:
    genre1 = GenreFactory()
    genre2 = GenreFactory()
    both_level = LevelFactory(is_approved=True, genres=[genre1, genre2])
    one_level = LevelFactory(is_approved=True, genres=[genre1])

    level_ids = get_level_ids(
        api_client, {"genres": f"{genre1.pk},{genre2.pk}"}
    )

    assert level_ids == {both_level.pk}
    assert one_level.pk not in level_ids


@pytest.mark.django_db
def test_level_list_author_filter_requires_all_authors(
    api_client: APIClient,
) -> None:
    author1 = UserFactory(username="author1")
    author2 = UserFactory(username="author2")
    both_level = LevelFactory(is_approved=True, authors=[author1, author2])
    one_level = LevelFactory(is_approved=True, authors=[author1])

    level_ids = get_level_ids(
        api_client, {"authors": f"{author1.pk},{author2.pk}"}
    )

    assert level_ids == {both_level.pk}
    assert one_level.pk not in level_ids


@pytest.mark.django_db
def test_level_list_combines_tag_and_genre_filters(
    api_client: APIClient,
) -> None:
    tag = TagFactory()
    genre = GenreFactory()
    matching_level = LevelFactory(is_approved=True, tags=[tag], genres=[genre])
    LevelFactory(is_approved=True, tags=[tag])
    LevelFactory(is_approved=True, genres=[genre])

    level_ids = get_level_ids(
        api_client, {"tags": str(tag.pk), "genres": str(genre.pk)}
    )

    assert level_ids == {matching_level.pk}


@pytest.mark.django_db
def test_level_list_does_not_duplicate_multi_tag_levels(
    api_client: APIClient,
) -> None:
    tag1 = TagFactory()
    tag2 = TagFactory()
    level = LevelFactory(is_approved=True, tags=[tag1, tag2])

    resp = api_client.get(
        "/api/levels/",
        data={"disable_paging": "1", "tags": f"{tag1.pk},{tag2.pk}"},
    )

    assert resp.status_code == status.HTTP_200_OK, resp.content
    result = resp.json()
    assert [item["id"] for item in result["results"]] == [level.pk]
    assert result["total_count"] == 1


def test_parse_ints_truncates_to_the_limit() -> None:
    assert parse_ints("1,2,3") == [1, 2, 3]
    assert parse_ints("1,2,3", limit=2) == [1, 2]
    assert parse_ints("1,2,3", limit=10) == [1, 2, 3]


@pytest.mark.django_db
def test_level_list_drops_tag_ids_beyond_the_filter_cap(
    api_client: APIClient,
) -> None:
    tag = TagFactory()
    LevelFactory(is_approved=True, tags=[tag])
    padding = ",".join(str(tag.pk + 1 + idx) for idx in range(MAX_FILTER_IDS))

    level_ids = get_level_ids(api_client, {"tags": f"{padding},{tag.pk}"})

    assert level_ids == set()
