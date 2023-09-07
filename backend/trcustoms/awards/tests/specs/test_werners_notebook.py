import pytest

from trcustoms.awards.specs import AwardSpec, werners_notebook
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(werners_notebook())[0]
    spec.requirement.min_reviews = 3
    return spec


@pytest.mark.django_db
def test_werners_notebook_award_spec_success(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level_author = UserFactory()
    ReviewFactory(author=user, level__authors=[level_author])
    ReviewFactory(author=user, level__authors=[level_author])
    ReviewFactory(author=user, level__authors=[level_author])
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_werners_notebook_award_spec_success_mixed(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level_author1 = UserFactory()
    level_author2 = UserFactory()
    ReviewFactory(author=user, level__authors=[level_author1])
    ReviewFactory(author=user, level__authors=[level_author2])
    ReviewFactory(author=user, level__authors=[level_author1, level_author2])
    ReviewFactory(author=user, level__authors=[level_author2])
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_werners_notebook_award_spec_not_enough_reviews(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    level_author = UserFactory()
    ReviewFactory(author=user, level__authors=[level_author])
    ReviewFactory(author=user, level__authors=[level_author])
    ReviewFactory(author=user, level__authors=[UserFactory(username="unique")])
    assert spec.requirement(user) is False
