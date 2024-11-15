import factory

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.models import RatingClass


class RatingClassFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RatingClass
        django_get_or_create = ("position", "target")

    target = RatingClassSubject.RATING
    min_rating_count = 0
