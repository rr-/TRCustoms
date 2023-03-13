from trcustoms.awards.models import UserAward
from trcustoms.users.models import User


class BaseAwardSpec:
    code: str = NotImplemented
    title: str = NotImplemented
    descriptions: dict[int, str] = NotImplemented
    position: int = NotImplemented

    @property
    def supported_tiers(self) -> list[int]:
        return list(self.descriptions.keys())  # pylint: disable=E1101

    def check_eligible(self, user: User, tier: int) -> bool:
        raise NotImplementedError("not implemented")

    def grant_to_user(self, user: User, tier: int) -> None:
        if tier not in self.supported_tiers:
            raise ValueError("invalid tier")
        UserAward.objects.update_or_create(
            user=user,
            code=self.code,
            defaults=dict(
                tier=tier or None,
                title=self.title,
                position=self.position,
                description=self.descriptions[tier],
            ),
        )
