import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.engines.tests.factories import EngineFactory
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.tags.tests.factories import TagFactory


def get_config(api_client: APIClient) -> dict:
    resp = api_client.get("/api/config/")
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return resp.json()


@pytest.mark.django_db
def test_config_is_served_from_cache(api_client: APIClient) -> None:
    engine = EngineFactory()
    LevelFactory(is_approved=True, engine=engine)
    assert get_config(api_client)["stats"]["total_levels"] == 1

    LevelFactory(is_approved=True, engine=engine)

    assert get_config(api_client)["stats"]["total_levels"] == 1


@pytest.mark.django_db
def test_creating_a_tag_invalidates_the_config_cache(
    api_client: APIClient,
) -> None:
    assert get_config(api_client)["tags"] == []

    tag = TagFactory()

    tag_names = [item["name"] for item in get_config(api_client)["tags"]]
    assert tag_names == [tag.name]


@pytest.mark.django_db
def test_deleting_a_tag_invalidates_the_config_cache(
    api_client: APIClient,
) -> None:
    tag = TagFactory()
    assert len(get_config(api_client)["tags"]) == 1

    tag.delete()

    assert get_config(api_client)["tags"] == []
