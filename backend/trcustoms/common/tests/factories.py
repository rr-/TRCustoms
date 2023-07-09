import factory

from trcustoms.common.models import RatingClass


class RatingClassFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RatingClass
        django_get_or_create = ("position", "target")

    target = RatingClass.Target.REVIEW
    min_rating_count = 0
