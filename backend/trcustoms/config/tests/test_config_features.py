import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.config.consts import FeatureFlagName
from trcustoms.config.models import FeatureFlag


def get_features(api_client: APIClient) -> dict:
    resp = api_client.get("/api/config/")
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return resp.json()["features"]


@pytest.mark.django_db
def test_features_are_disabled_by_default(api_client: APIClient) -> None:
    FeatureFlag.objects.all().delete()

    assert get_features(api_client) == {"messages": False}


@pytest.mark.django_db
def test_toggling_a_feature_invalidates_the_config_cache(
    api_client: APIClient,
) -> None:
    flag, _ = FeatureFlag.objects.get_or_create(name=FeatureFlagName.MESSAGES)
    assert get_features(api_client) == {"messages": False}

    flag.is_enabled = True
    flag.save()

    assert get_features(api_client) == {"messages": True}
