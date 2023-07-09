import factory

from trcustoms.engines.tests.factories import EngineFactory
from trcustoms.levels.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelScreenshot,
)
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.tests.factories import UploadedFileFactory


class DurationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelDuration

    position = factory.Sequence(lambda n: n)
    name = factory.Sequence(lambda n: f"Duration {n}")


class DifficultyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelDifficulty

    position = factory.Sequence(lambda n: n)
    name = factory.Sequence(lambda n: f"Difficulty {n}")


class ScreenshotFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelScreenshot

    file = factory.SubFactory(
        UploadedFileFactory,
        upload_type=UploadType.LEVEL_SCREENSHOT,
    )
    position = factory.Sequence(lambda n: n)


class LevelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Level

    is_pending_approval = False
    is_approved = True
    name = factory.Faker("sentence")
    description = factory.Faker("text")
    engine = factory.SubFactory(EngineFactory)
    duration = factory.SubFactory(DurationFactory)
    difficulty = factory.SubFactory(DifficultyFactory)

    @factory.post_generation
    def authors(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.authors.set(extracted)

    @factory.post_generation
    def reviews(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.reviews.set(extracted)

    @factory.post_generation
    def genres(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.genres.set(extracted)
