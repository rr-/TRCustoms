from django.core.cache import cache

from trcustoms.awards.specs import ALL_AWARDS_CLASSES
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
    for spec_cls in ALL_AWARDS_CLASSES:
        spec = spec_cls()
        for tier in spec.supported_tiers:
            update_award_rarity(spec_cls.code, tier)


def get_award_rarity(award_code: str, tier: int) -> int:
    rarity = cache.get("award_rarity__{award_code}_{tier}")
    if rarity is None:
        rarity = update_award_rarity(award_code, tier)
    return rarity


def update_awards(user: User, update_rarity: bool = True) -> None:
    user_awards = {
        award.code: award.position for award in user.awards.iterator()
    }

    for spec_cls in ALL_AWARDS_CLASSES:
        spec = spec_cls()
        current_tier = user_awards.get(spec_cls.code) or 0
        max_eligible_tier = -1
        for tier in spec.supported_tiers:
            if spec.check_eligible(user, tier):
                max_eligible_tier = max(max_eligible_tier, tier)
        if max_eligible_tier != -1 and max_eligible_tier >= current_tier:
            spec.grant_to_user(user, tier=max_eligible_tier)
            if update_rarity:
                update_award_rarity(spec.code, tier=max_eligible_tier)
