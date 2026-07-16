import pytest

from trcustoms.genres.models import Genre
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.ownership import is_owner
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_level_owned_by_uploader_and_authors() -> None:
    uploader = UserFactory(username="uploader")
    author = UserFactory(username="author")
    stranger = UserFactory(username="stranger")
    level = LevelFactory(uploader=uploader, authors=[author])

    assert is_owner(level, uploader)
    assert is_owner(level, author)
    assert not is_owner(level, stranger)


@pytest.mark.django_db
def test_user_owns_only_itself() -> None:
    alice = UserFactory(username="alice")
    bob = UserFactory(username="bob")

    assert is_owner(alice, alice)
    assert not is_owner(alice, bob)


@pytest.mark.django_db
def test_unregistered_model_is_owned_by_nobody() -> None:
    user = UserFactory()
    genre = Genre.objects.create(name="Puzzle", description="x")

    assert not is_owner(genre, user)
