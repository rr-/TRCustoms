from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredWalkthroughsAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec
from trcustoms.walkthroughs.consts import WalkthroughType


def bestiary() -> Iterable[AwardSpec]:
    min_walkthroughs = 25

    yield AwardSpec(
        code="bestiary",
        title="Bestiary",
        description=(
            f"You have submitted {min_walkthroughs} text walkthroughs."
        ),
        guide_description="Submit 25 written walkthroughs.",
        requirement=AuthoredWalkthroughsAwardRequirement(
            min_walkthroughs=min_walkthroughs,
            walkthrough_type=WalkthroughType.TEXT,
        ),
    )
