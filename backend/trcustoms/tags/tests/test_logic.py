import pytest

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.tags.logic import merge_tags, split_tag
from trcustoms.tags.models import Tag
from trcustoms.tags.tests.factories import TagFactory


@pytest.mark.django_db
def test_tag_splitting() -> None:
    """Test that tag merging re-adds all old usages to the new tag."""
    level1 = LevelFactory()
    level2 = LevelFactory()
    level3 = LevelFactory()

    tag1 = TagFactory(name="cave/cat")
    tag2 = TagFactory(name="caves")

    level1.tags.set([])
    level2.tags.set([tag1])
    level3.tags.set([tag1, tag2])

    split_tag(tag1.name, ["caves", "catacombs"], None)

    level1.refresh_from_db()
    level2.refresh_from_db()
    level3.refresh_from_db()

    assert not set(level1.tags.values_list("id", flat=True))
    assert set(level2.tags.values_list("name", flat=True)) == {
        "cave/cat",
        "caves",
        "catacombs",
    }
    assert set(level3.tags.values_list("name", flat=True)) == {
        "cave/cat",
        "caves",
        "catacombs",
    }


@pytest.mark.django_db
def test_tag_merging() -> None:
    """Test that tag merging re-adds all old usages to the new tag."""
    level1 = LevelFactory()
    level2 = LevelFactory()
    level3 = LevelFactory()

    tag1 = TagFactory(name="winston")
    tag2 = TagFactory(name="kurtis")

    level1.tags.set([])
    level2.tags.set([tag1])
    level3.tags.set([tag1, tag2])

    merge_tags(tag1.name, tag2.name, None)

    level1.refresh_from_db()
    level2.refresh_from_db()
    level3.refresh_from_db()

    assert not list(level1.tags.values_list("id", flat=True))
    assert list(level2.tags.values_list("id", flat=True)) == [tag2.id]
    assert list(level3.tags.values_list("id", flat=True)) == [tag2.id]
    assert not Tag.objects.filter(name=tag1.name).exists()
