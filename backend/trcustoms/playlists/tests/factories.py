import factory

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.playlists.models import PlaylistItem
from trcustoms.users.tests.factories import UserFactory


class PlaylistItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PlaylistItem

    user = factory.SubFactory(UserFactory)
    level = factory.SubFactory(LevelFactory)
