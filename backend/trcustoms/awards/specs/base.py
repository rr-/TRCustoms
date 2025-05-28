from collections.abc import Callable
from dataclasses import dataclass

from trcustoms.users.models import User


@dataclass
class AwardSpec:
    code: str
    title: str
    description: str
    guide_description: str | None
    requirement: Callable[[User], bool]

    tier: int = 0

    # remove the award if its criteria are no longer being met
    can_be_removed: bool = False
