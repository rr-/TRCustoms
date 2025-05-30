import factory
from django.utils import timezone

from trcustoms.community_events.models import Event, Winner
from trcustoms.uploads.tests.factories import UploadedFileFactory
from trcustoms.users.tests.factories import UserFactory


class EventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Event

    name = factory.Sequence(lambda n: f"Event {n}")
    subtitle = factory.Faker("sentence")
    cover_image = factory.SubFactory(UploadedFileFactory)
    year = factory.Iterator([None] + list(range(2000, 2005)))
    about = factory.Faker("text")
    collection_release = factory.LazyFunction(timezone.now)
    host = factory.SubFactory(UserFactory)

    @factory.post_generation
    def levels(self, create, extracted, **kwargs):
        if create and extracted:
            self.levels.set(extracted)


class WinnerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Winner

    event = factory.SubFactory(EventFactory)
    place = factory.Sequence(lambda n: n + 1)
    user = factory.SubFactory(UserFactory)
