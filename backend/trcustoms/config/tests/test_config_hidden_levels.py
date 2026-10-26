from datetime import timedelta

import pytest
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient

from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.consts import FeatureType
from trcustoms.levels.models import FeaturedLevel
from trcustoms.levels.tests.factories import LevelFactory


def tomorrow():
    return timezone.localdate() + timedelta(days=1)


@pytest.mark.django_db
def test_featured_levels_skip_hidden_levels() -> None:
    public = LevelFactory()
    hidden = LevelFactory(is_approved=False)
    FeaturedLevel.objects.create(
        level=public, feature_type=FeatureType.LEVEL_OF_THE_DAY
    )
    FeaturedLevel.objects.create(
        level=hidden, feature_type=FeatureType.LEVEL_OF_THE_DAY
    )

    data = APIClient().get("/api/config/featured_levels/").json()

    assert data["level_of_the_day"]["level"]["id"] == public.pk


@pytest.mark.django_db
def test_genre_counts_skip_hidden_levels() -> None:
    cache.clear()
    genre = GenreFactory(name="Atlantis")
    LevelFactory(genres=[genre])
    LevelFactory(genres=[genre], release_date=tomorrow())
    LevelFactory(genres=[genre], is_approved=False)

    genres = APIClient().get("/api/config/").json()["genres"]

    assert [g["level_count"] for g in genres if g["id"] == genre.pk] == [1]
