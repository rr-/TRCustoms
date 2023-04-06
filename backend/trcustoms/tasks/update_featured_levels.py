import random
from datetime import timedelta

from django.db.models import QuerySet
from django.utils import timezone

from trcustoms.celery import app, logger
from trcustoms.common.models import RatingClass
from trcustoms.genres.models import Genre
from trcustoms.levels.models import FeaturedLevel, Level


def feature_level(
    feature_type: FeaturedLevel.FeatureType,
    level_pool: QuerySet[Level],
    **kwargs,
) -> FeaturedLevel | None:
    if not level_pool.exists():
        return None
    level_id = random.choice(level_pool.values_list("id", flat=True))
    logger.info(f"featuring level {level_id} as {feature_type}")
    return FeaturedLevel.objects.create(
        feature_type=feature_type, level_id=level_id, **kwargs
    )


def was_featured_recently(
    featured_level: FeaturedLevel | None, **kwargs
) -> bool:
    return (
        featured_level
        and timezone.now() - featured_level.created <= timedelta(**kwargs)
    )


def get_last_featured_level(
    feature_type: FeaturedLevel.FeatureType,
) -> FeaturedLevel | None:
    return (
        FeaturedLevel.objects.filter(feature_type=feature_type)
        .order_by("-created")
        .first()
    )


def filter_only_least_downloaded(
    levels: QuerySet[Level], fraction: float
) -> QuerySet[Level]:
    total = Level.objects.all().count()
    chosen = Level.objects.order_by("download_count")[: int(total * fraction)]
    return levels.filter(id__in=chosen.values("id"))


def filter_only_most_downloaded(
    levels: QuerySet[Level], fraction: float
) -> QuerySet[Level]:
    total = Level.objects.all().count()
    chosen = Level.objects.order_by("download_count")[: int(total * fraction)]
    return levels.filter(id__in=chosen.values("id"))


def filter_by_rating_class(
    levels: QuerySet[Level], rating_class_names: list[str]
) -> QuerySet[Level]:
    rating_classes = RatingClass.objects.filter(name__in=rating_class_names)
    assert rating_classes.count() == len(rating_class_names)
    return levels.filter(rating_class__in=rating_classes)


def filter_out_recently_featured(
    levels: QuerySet[Level], feature_type: FeaturedLevel.FeatureType, days: int
) -> QuerySet[Level]:
    return levels.exclude(
        id__in=FeaturedLevel.objects.filter(
            feature_type=feature_type,
            created__gte=timezone.now() - timedelta(days=days),
        ).values("level_id")
    )


def update_monthly_hidden_gem() -> FeaturedLevel | None:
    last_featured_level = get_last_featured_level(
        FeaturedLevel.FeatureType.MONTHLY_HIDDEN_GEM
    )

    # if a level was featured recently, abort
    if was_featured_recently(last_featured_level, days=7):
        return None

    # if today isn't the first day of the month and we already have something
    # featured, abort
    if last_featured_level and timezone.now().day != 1:
        return None

    levels = Level.objects.downloadable()

    # only pick levels that are in the bottom % of the highest download count
    levels = filter_only_least_downloaded(levels, 2 / 3)

    # only pick levels that have not too many reviews
    levels = levels.filter(review_count__lt=15)

    # only picks levels that have favorable ratings, but nothing too extreme
    levels = filter_by_rating_class(levels, ["Slightly Positive", "Positive"])

    # make sure the level was not picked recently
    levels = filter_out_recently_featured(
        levels,
        feature_type=FeaturedLevel.FeatureType.MONTHLY_HIDDEN_GEM,
        days=365 * 2 + 7,
    )

    return feature_level(
        feature_type=FeaturedLevel.FeatureType.MONTHLY_HIDDEN_GEM,
        level_pool=levels,
    )


def update_level_of_the_day() -> FeaturedLevel | None:
    last_featured_level = get_last_featured_level(
        FeaturedLevel.FeatureType.LEVEL_OF_THE_DAY
    )

    # if a level was featured recently, abort
    if was_featured_recently(last_featured_level, hours=23):
        return None

    levels = Level.objects.downloadable()

    # make sure the level was not picked recently
    levels = filter_out_recently_featured(
        levels,
        feature_type=FeaturedLevel.FeatureType.LEVEL_OF_THE_DAY,
        days=365,
    )

    return feature_level(
        feature_type=FeaturedLevel.FeatureType.LEVEL_OF_THE_DAY,
        level_pool=levels,
    )


def update_best_level_in_genre() -> FeaturedLevel | None:
    last_featured_level = get_last_featured_level(
        FeaturedLevel.FeatureType.BEST_IN_GENRE
    )

    # if a level was featured recently, abort
    if was_featured_recently(last_featured_level, days=14):
        return None

    # choose the next genre in cycle
    if last_featured_level:
        previous_genre_name = last_featured_level.chosen_genre.name
    else:
        previous_genre_name = Genre.objects.order_by("name").last().name

    genre_names = list(Genre.objects.values_list("name", flat=True))
    visited_genre_names: set[str] = set()
    while True:
        genre_name = (genre_names + genre_names)[
            genre_names.index(previous_genre_name) + 1
        ]
        previous_genre_name = genre_name
        if genre_name in visited_genre_names:
            break
        genre = Genre.objects.get(name=genre_name)
        visited_genre_names.add(genre_name)

        levels = Level.objects.downloadable().filter(genres=genre)

        # make sure we pick only the best rated levels
        levels = filter_by_rating_class(
            levels, ["Overwhelmingly positive", "Masterpiece"]
        )

        # make sure the level was not picked recently
        levels = filter_out_recently_featured(
            levels,
            feature_type=FeaturedLevel.FeatureType.BEST_IN_GENRE,
            days=365 * 3,
        )

        featured_level = feature_level(
            feature_type=FeaturedLevel.FeatureType.BEST_IN_GENRE,
            level_pool=levels,
            chosen_genre=genre,
        )
        if featured_level:
            return featured_level

    return None


@app.task
def update_featured_levels() -> None:
    update_monthly_hidden_gem()
    update_level_of_the_day()
    update_best_level_in_genre()


def get_new_release() -> FeaturedLevel:
    def get_recent_level() -> Level:
        recent_levels = (
            Level.objects.downloadable()
            .filter(
                created__gte=timezone.now() - timedelta(days=7),
            )
            .all()
        )
        if recent_levels:
            return random.choice(recent_levels)
        return Level.objects.downloadable().order_by("-created").first()

    return FeaturedLevel(
        created=timezone.now(),
        level=get_recent_level(),
        feature_type=FeaturedLevel.FeatureType.NEW_RELEASE,
        chosen_genre=None,
    )
