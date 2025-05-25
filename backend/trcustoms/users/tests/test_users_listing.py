import pytest
from rest_framework import status

from trcustoms.common.models import Country
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_listing_filters_users_by_country_and_min_authored(
    auth_api_client,
):
    country = Country.objects.create(
        name="Country1", iso_3166_1_alpha2="AA", iso_3166_1_numeric="001"
    )
    matching_user = UserFactory(
        username="match", country=country, authored_level_count_approved=2
    )
    UserFactory(
        username="no_match", country=country, authored_level_count_approved=0
    )
    null_user = UserFactory(
        username="null_match", country=None, authored_level_count_approved=1
    )
    UserFactory(
        username="null_no_match", country=None, authored_level_count_approved=0
    )

    # Filter by country and minimum authored levels should return only
    # matching_user
    response = auth_api_client.get(
        "/api/users/", {"country_code": "AA", "authored_levels_min": "1"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_count"] == 1
    assert data["results"][0]["id"] == matching_user.id

    # Filter by empty country code and minimum authored levels should return
    # only null_user
    response = auth_api_client.get(
        "/api/users/", {"country_code": "", "authored_levels_min": "1"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_count"] == 1
    assert data["results"][0]["id"] == null_user.id
