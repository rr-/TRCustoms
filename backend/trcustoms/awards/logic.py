from collections.abc import Iterable
from itertools import groupby

from django.core.cache import cache
from django.db import IntegrityError

from trcustoms.awards.models import UserAward
from trcustoms.awards.specs import ALL_AWARD_SPECS
from trcustoms.awards.specs.base import AwardSpec
from trcustoms.users.models import User


def calculate_award_rarity(award_code: str, tier: int) -> int:
    awarded = User.objects.filter(
        awards__code=award_code, awards__tier=tier
    ).count()
    total = User.objects.count()
    return min(100, 100 - ((awarded - 1) / total) * 100)


def update_award_rarity(award_code: str, tier: int) -> int:
    rarity = calculate_award_rarity(award_code, tier)
    cache.set(f"award_rarity__{award_code}_{tier}", rarity)
    return rarity


def update_award_rarities() -> None:
    for spec in ALL_AWARD_SPECS:
        update_award_rarity(spec.code, spec.tier)


def get_award_rarity(award_code: str, tier: int) -> int:
    rarity = cache.get("award_rarity__{award_code}_{tier}")
    if rarity is None:
        rarity = update_award_rarity(award_code, tier)
    return rarity


def update_user_award_tier(
    user: User,
    award_code: str,
    award_spec: AwardSpec | None,
) -> None:
    if not award_spec:
        UserAward.objects.filter(user=user, code=award_code).delete()
        return

    for attempt in range(2):
        try:
            UserAward.objects.update_or_create(
                user=user,
                code=award_spec.code,
                defaults=dict(
                    tier=award_spec.tier,
                    title=award_spec.title,
                    position=ALL_AWARD_SPECS.index(award_spec),
                    description=award_spec.description,
                ),
            )
        except IntegrityError:
            if attempt == 1:
                raise


def get_max_eligible_spec(
    user: User, specs: Iterable[AwardSpec]
) -> tuple[int, AwardSpec | None]:
    specs = list(specs)

    if len(set(spec.code for spec in specs)) != 1:
        raise RuntimeError("cannot mix award types in this context")

    max_eligible_spec = None
    for spec in specs:
        if spec.requirement(user) and (
            max_eligible_spec is None or spec.tier > max_eligible_spec.tier
        ):
            max_eligible_spec = spec
    return (
        max_eligible_spec.tier if max_eligible_spec else -1,
        max_eligible_spec,
    )


def update_awards(user: User, update_rarity: bool = True) -> None:
    user_awards = {award.code: award.tier for award in user.awards.iterator()}

    for code, group in groupby(ALL_AWARD_SPECS, lambda spec: spec.code):
        group = list(group)
        current_tier = user_awards.get(code, -1)
        max_eligible_tier, max_eligible_spec = get_max_eligible_spec(
            user, group
        )

        if max_eligible_tier > current_tier or (
            max_eligible_tier < current_tier
            and any(spec.can_be_removed for spec in group)
        ):
            update_user_award_tier(
                user=user,
                award_code=code,
                award_spec=max_eligible_spec,
            )
            if update_rarity:
                update_award_rarity(code, tier=current_tier)
                update_award_rarity(code, tier=max_eligible_tier)
