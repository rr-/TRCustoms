import pytest

from trcustoms.awards.specs import AwardSpec, nightmare_stone
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.tags.tests.factories import TagFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="spec")
def fixture_spec() -> None:
    spec = list(nightmare_stone())[0]
    spec.requirement.min_levels = 2
    spec.requirement.min_tags = 2
    return spec


@pytest.mark.django_db
def test_nightmare_stone_award_spec_success(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    tag1 = TagFactory()
    tag2 = TagFactory()
    tag3 = TagFactory()
    tag4 = TagFactory()
    LevelFactory(authors=[user], tags=[tag1, tag2])
    LevelFactory(authors=[user], tags=[tag3, tag4])
    assert spec.requirement(user) is True


@pytest.mark.django_db
def test_nightmare_stone_award_spec_not_enough_tags(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    tag1 = TagFactory()
    tag2 = TagFactory()
    tag3 = TagFactory()
    LevelFactory(authors=[user], tags=[tag1, tag2])
    LevelFactory(authors=[user], tags=[tag3])
    assert spec.requirement(user) is False


@pytest.mark.django_db
def test_nightmare_stone_award_spec_too_far_apart(
    spec: AwardSpec,
) -> None:
    user = UserFactory()
    tag1 = TagFactory()
    tag2 = TagFactory()
    LevelFactory(authors=[user], tags=[tag1, tag2])
    assert spec.requirement(user) is False
