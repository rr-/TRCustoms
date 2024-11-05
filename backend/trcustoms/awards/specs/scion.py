from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredWalkthroughsAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec


def scion() -> Iterable[AwardSpec]:
    yield AwardSpec(
        code="scion",
        title="Scion",
        tier=1,
        description=(
            "A baseline of quality guides has been set, "
            "will you be able to surpass it?"
        ),
        requirement=AuthoredWalkthroughsAwardRequirement(min_walkthroughs=10),
    )

    yield AwardSpec(
        code="scion",
        title="Scion",
        tier=2,
        description=(
            "Your work as a guide is proving to be more than just a hobby."
        ),
        requirement=AuthoredWalkthroughsAwardRequirement(min_walkthroughs=50),
    )

    yield AwardSpec(
        code="scion",
        title="Scion",
        tier=3,
        description="Your dedication to the community is impressive.",
        requirement=AuthoredWalkthroughsAwardRequirement(min_walkthroughs=100),
    )

    yield AwardSpec(
        code="scion",
        title="Scion",
        tier=4,
        description="You have saved others countless hours.",
        requirement=AuthoredWalkthroughsAwardRequirement(min_walkthroughs=250),
    )

    yield AwardSpec(
        code="scion",
        title="Scion",
        tier=5,
        description="Being a guide is simply your way of life.",
        requirement=AuthoredWalkthroughsAwardRequirement(min_walkthroughs=500),
    )
