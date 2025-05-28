from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredWalkthroughsAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec
from trcustoms.walkthroughs.consts import WalkthroughType


def iris() -> Iterable[AwardSpec]:
    min_walkthroughs = 25

    yield AwardSpec(
        code="iris",
        title="Iris",
        description=(
            f"You have submitted {min_walkthroughs} video walkthroughs."
        ),
        guide_description=f"Submit {min_walkthroughs} video walkthroughs.",
        requirement=AuthoredWalkthroughsAwardRequirement(
            min_walkthroughs=min_walkthroughs,
            walkthrough_type=WalkthroughType.LINK,
        ),
    )
