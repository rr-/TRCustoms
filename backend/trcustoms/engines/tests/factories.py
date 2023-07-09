import factory

from trcustoms.engines.models import Engine


class EngineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Engine

    name = factory.Sequence(lambda n: f"Engine {n}")
