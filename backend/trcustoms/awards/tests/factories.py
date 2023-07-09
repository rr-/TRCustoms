import factory

from trcustoms.awards.models import UserAward
from trcustoms.users.tests.factories import UserFactory


class UserAwardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserAward

    user = factory.SubFactory(UserFactory)
    code = factory.Sequence(lambda n: f"code_{n}")
    title = factory.Sequence(lambda n: f"Title {n}")
    description = factory.Sequence(lambda n: f"Description {n}")
    tier = None
