from collections import defaultdict
from datetime import date, datetime, timedelta

from django.db.models import Count, F

from trcustoms.awards.requirements.base import BaseAwardRequirement
from trcustoms.playlists.models import PlaylistItem
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


class AuthoredLevelsAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_levels: int) -> None:
        self.min_levels = min_levels

    def check_eligible(self, user: User) -> bool:
        return (
            user.authored_levels.filter(is_approved=True).count()
            >= self.min_levels
        )


class AuthoredLevelsRatingCountRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_rating: int,
        min_levels: int,
        extrapolate_ratings: bool,
    ) -> None:
        self.min_rating = min_rating
        self.min_levels = min_levels
        self.extrapolate_ratings = extrapolate_ratings

    def check_eligible(self, user: User) -> bool:
        authored_level_rating_counts = defaultdict(int)
        for rating_class_position in user.authored_levels.filter(
            is_approved=True
        ).values_list("rating_class__position", flat=True):
            if self.extrapolate_ratings:
                for num in range(rating_class_position + 1):
                    authored_level_rating_counts[num] += 1
            else:
                authored_level_rating_counts[rating_class_position] += 1

        return authored_level_rating_counts[self.min_rating] >= self.min_levels


class AuthoredLevelPlayersAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_players: int) -> None:
        self.min_players = min_players

    def check_eligible(self, user: User) -> bool:
        players = (
            PlaylistItem.objects.filter(
                level__is_approved=True,
                level__authors__pk=user.pk,
            )
            .order_by("user_id")
            .distinct("user_id")
            .count()
        )
        return players >= self.min_players


class AuthoredLevelsTagCountRequirement(BaseAwardRequirement):
    def __init__(self, min_levels: int, min_tags: int) -> None:
        self.min_levels = min_levels
        self.min_tags = min_tags

    def check_eligible(self, user: User) -> bool:
        return (
            user.authored_levels.annotate(tag_count=Count("tags"))
            .filter(
                is_approved=True,
                tag_count__gte=self.min_tags,
            )
            .count()
            >= self.min_levels
        )


class AuthoredLevelsSustainableQualityRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_rating_class: int,
        max_time_apart: timedelta,
    ) -> None:
        self.min_rating_class = min_rating_class
        self.max_time_apart = max_time_apart

    def check_eligible(self, user: User) -> bool:
        # User has released two approved levels that are less than
        # max_time_apart and achieved min_rating_class (at any time)
        good_level_creation_times = sorted(
            user.authored_levels.filter(
                is_approved=True,
                rating_class__position__gte=self.min_rating_class,
            ).values_list("created", flat=True)
        )
        return any(
            time2 - time1 <= self.max_time_apart
            for time1, time2 in zip(
                good_level_creation_times, good_level_creation_times[1:]
            )
        )


class AuthoredLevelsFarApartRequirement(BaseAwardRequirement):
    def __init__(self, min_time_apart: timedelta) -> None:
        self.min_time_apart = min_time_apart

    def check_eligible(self, user: User) -> bool:
        # User has released two approved levels that are more than
        # min_time_apart
        good_level_creation_times = sorted(
            user.authored_levels.filter(
                is_approved=True,
            ).values_list("created", flat=True)
        )
        return any(
            time2 - time1 >= self.min_time_apart
            for time1, time2 in zip(
                good_level_creation_times, good_level_creation_times[1:]
            )
        )


class AuthoredWalkthroughsAwardRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_walkthroughs: int,
        walkthrough_type: WalkthroughType | None = None,
    ) -> None:
        self.min_walkthroughs = min_walkthroughs
        self.walkthrough_type = walkthrough_type

    def check_eligible(self, user: User) -> bool:
        queryset = user.authored_walkthroughs.filter(
            status=WalkthroughStatus.APPROVED
        )
        if self.walkthrough_type is not None:
            queryset = queryset.filter(
                walkthrough_type=self.walkthrough_type,
            )
        return queryset.count() >= self.min_walkthroughs


class EarlyLevelsEditedAwardRequirement(BaseAwardRequirement):
    def __init__(self, max_date: datetime) -> None:
        self.max_date = max_date

    def check_eligible(self, user: User) -> bool:
        # Since level edit form can't be submitted without putting genres...
        # Check if all levels that were released by the user BEFORE 2 Apr 2022
        # have any genre.
        all_early_levels = user.authored_levels.filter(
            is_approved=True, created__lte=self.max_date
        )
        return (
            all_early_levels.exists()
            and not all_early_levels.filter(genres=None).exists()
        )


class JoinDateAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_date: date, max_date: date) -> None:
        self.min_date = min_date
        self.max_date = max_date

    def check_eligible(self, user: User) -> bool:
        # User account is active and join date is between (and equal to) 1 Apr
        # 2022 to 1 Apr 2023.
        return (
            user.is_active
            and not user.is_banned
            and user.date_joined.date() >= self.min_date
            and user.date_joined.date() <= self.max_date
        )


class AuthoredReviewsAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_reviews: int) -> None:
        self.min_reviews = min_reviews

    def check_eligible(self, user: User) -> bool:
        return user.reviewed_levels.count() >= self.min_reviews


class AuthoredReviewsEarlyAgeAwardRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_total_reviews: int,
        min_early_reviews: int,
        max_review_position: int = 5,
    ) -> None:
        self.max_review_position = max_review_position
        self.req1 = AuthoredReviewsAwardRequirement(
            min_reviews=min_total_reviews
        )
        self.req2 = AuthoredReviewsPositionAwardRequirement(
            min_reviews=min_early_reviews,
            max_position=max_review_position,
        )

    def check_eligible(self, user: User) -> bool:
        return self.req1.check_eligible(user) and self.req2.check_eligible(
            user
        )


class AuthoredReviewsTimingAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_levels: int, max_review_age: timedelta) -> None:
        self.min_levels = min_levels
        self.max_review_age = max_review_age

    def check_eligible(self, user: User) -> bool:
        return (
            user.reviewed_levels.annotate(
                age=F("created") - F("level__created")
            )
            .filter(age__lte=self.max_review_age)
            .count()
            >= self.min_levels
        )


class AuthoredReviewsPositionAwardRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_reviews: int,
        min_position: int | None = None,
        max_position: int | None = None,
    ) -> None:
        self.min_position = min_position
        self.max_position = max_position
        self.min_reviews = min_reviews

    def check_eligible(self, user: User) -> bool:
        queryset = user.reviewed_levels
        if self.min_position is not None:
            queryset = queryset.filter(position__gte=self.min_position)
        if self.max_position is not None:
            queryset = queryset.filter(position__lte=self.max_position)
        return queryset.count() >= self.min_reviews


class AuthoredReviewsSameBuilderAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_reviews: int) -> None:
        self.min_reviews = min_reviews

    def check_eligible(self, user: User) -> bool:
        return (
            User.objects.filter(authored_levels__reviews__author=user)
            .annotate(total=Count("pk"))
            .filter(total__gte=self.min_reviews)
            .exists()
        )


class PlayedLevelsAwardRequirement(BaseAwardRequirement):
    def __init__(self, min_levels: int) -> None:
        self.min_levels = min_levels

    def check_eligible(self, user: User) -> bool:
        return user.playlist_items.finished().count() >= self.min_levels


class PlayedLevelsWithRatingAwardRequirement(BaseAwardRequirement):
    def __init__(
        self,
        min_levels: int,
        min_rating: int | None = None,
        max_rating: int | None = None,
    ) -> None:
        self.min_levels = min_levels
        self.min_rating = min_rating
        self.max_rating = max_rating

    def check_eligible(self, user: User) -> bool:
        queryset = user.playlist_items.played()
        if self.max_rating is not None:
            queryset = queryset.filter(
                level__rating_class__position__lte=self.max_rating
            )
        if self.min_rating is not None:
            queryset = queryset.filter(
                level__rating_class__position__gte=self.min_rating
            )
        return queryset.count() >= self.min_levels
