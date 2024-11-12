import factory

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.models import Walkthrough


class WalkthroughFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Walkthrough

    author = factory.SubFactory(UserFactory)
    level = factory.SubFactory(LevelFactory)

    @factory.post_generation
    def last_user_content_updated(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create:
            self.last_user_content_updated = self.created
