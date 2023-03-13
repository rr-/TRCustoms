from datetime import date

from trcustoms.awards.specs.base import BaseAwardSpec
from trcustoms.users.models import User


class SeraphAwardSpec(BaseAwardSpec):
    required_min_date = date(2022, 4, 1)
    required_max_date = date(2023, 4, 1)

    code = "seraph"
    title = "Seraph"
    descriptions = {0: "You've joined the site in its first year."}
    position = 8

    def check_eligible(self, user: User, tier: int) -> bool:
        # User account is active and join date is between (and equal to) 1 Apr
        # 2022 to 1 Apr 2023.
        return (
            user.is_active
            and not user.is_banned
            and user.date_joined.date() >= self.required_min_date
            and user.date_joined.date() <= self.required_max_date
        )
