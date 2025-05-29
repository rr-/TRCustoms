from collections.abc import Iterable

from trcustoms.awards.requirements.impl import (
    AuthoredWalkthroughsAwardRequirement,
)
from trcustoms.awards.specs.base import AwardSpec

SPECS: list[tuple[str, int]] = [
    (
        "A baseline of quality guides has been set, "
        "will you be able to surpass it?",
        10,
    ),
    ("Your work as a guide is proving to be more than just a hobby.", 50),
    ("Your dedication to the community is impressive.", 100),
    ("You have saved others countless hours.", 250),
    ("Being a guide is simply your way of life.", 500),
]


def scion() -> Iterable[AwardSpec]:
    for i, (description, min_walkthroughs) in enumerate(SPECS, 1):
        yield AwardSpec(
            code="scion",
            title="Scion",
            tier=i,
            description=description,
            guide_description=(
                f"Obtained by submitting {min_walkthroughs} "
                "or more walkthroughs."
            ),
            requirement=AuthoredWalkthroughsAwardRequirement(
                min_walkthroughs=min_walkthroughs
            ),
        )
