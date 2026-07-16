import pytest

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.scoring import get_rating_classes


@pytest.mark.django_db
def test_rating_classes_cache_cleared_on_change() -> None:
    """Editing RatingClass rows must invalidate the memoized queryset."""
    target = RatingClassSubject.LEVEL
    get_rating_classes.cache_clear()
    assert not get_rating_classes(target)

    RatingClassFactory(target=target, position=1, name="Great")

    # Without cache invalidation this would still return the cached [].
    assert len(get_rating_classes(target)) == 1
