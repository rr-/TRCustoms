from datetime import timedelta

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


class PhilosophersStoneAwardSpec(BaseAwardSpec):
    required_position = 4
    required_time_apart = timedelta(days=365)

    code = "philosophers_stone"
    title = "Philosopher's Stone"
    descriptions = {
        0: (
            "You released two levels within the same year that got "
            "an overwhelmingly positive rating."
        )
    }
    position = 5

    def check_eligible(self, user: User, tier: int) -> bool:
        # User has released two approved levels that are less than 365 days
        # apart and achieved overwhelmingly positive (at any time)
        good_level_creation_times = sorted(
            user.authored_levels.filter(
                is_approved=True,
                rating_class__position__gte=self.required_position,
            ).values_list("created", flat=True)
        )
        return any(
            time2 - time1 <= self.required_time_apart
            for time1, time2 in zip(
                good_level_creation_times, good_level_creation_times[1:]
            )
        )
