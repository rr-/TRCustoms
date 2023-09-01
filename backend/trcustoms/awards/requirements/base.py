import operator

from trcustoms.users.models import User


class BaseAwardRequirement:
    def check_eligible(self, user: User) -> bool:
        raise NotImplementedError("not implemented")

    def __call__(self, user: User) -> bool:
        return self.check_eligible(user)

    def __invert__(self):
        return IsUnaryFunctor(self, operator.not_)

    def __or__(self, other):
        return IsBinaryFunctor(self, other, operator.or_)

    def __and__(self, other):
        return IsBinaryFunctor(self, other, operator.and_)


class IsUnaryFunctor(BaseAwardRequirement):
    def __init__(self, lhs, func):
        self.lhs = lhs
        self.func = func

    def check_eligible(self, user: User) -> bool:
        return self.func(self.lhs.check_eligible(user))


class IsBinaryFunctor(BaseAwardRequirement):
    def __init__(self, lhs, rhs, func):
        self.lhs = lhs
        self.rhs = rhs
        self.func = func

    def check_eligible(self, user: User) -> bool:
        return self.func(
            self.lhs.check_eligible(user),
            self.rhs.check_eligible(user),
        )
