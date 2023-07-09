import random
from typing import Any

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from mimesis import Generic

from trcustoms.common.models import Country
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.levels.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelScreenshot,
)
from trcustoms.tags.models import Tag
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User

fake = Generic()


def chance(factor: float, value: Any, default: Any = None) -> Any:
    return value if random.random() < factor else default


def create_fake_user() -> User:
    user, created = User.objects.get_or_create(
        username=fake.person.username(),
        defaults=dict(
            bio=chance(0.9, fake.text.text(), ""),
            website_url=chance(0.8, fake.internet.url()),
            is_email_confirmed=chance(0.8, True, False),
            is_pending_activation=chance(0.2, True, False),
            is_banned=chance(0.05, True, False),
            donation_url=chance(0.2, fake.internet.url()),
            first_name=chance(0.3, fake.person.first_name(), ""),
            last_name=chance(0.3, fake.person.last_name(), ""),
            country=random.choice(list(Country.objects.all()) + [None]),
            trle_author_id=chance(0.3, random.randint(1, 3000)),
            trle_reviewer_id=chance(0.3, random.randint(1, 3000)),
        ),
    )
    if created:
        user.picture = UploadedFile.objects.create(
            content=ContentFile(fake.binaryfile.image(), name="picture.png"),
            upload_type=UploadType.USER_PICTURE,
        )
        user.save()
    return user


def create_fake_level_tag() -> Tag:
    level_tag, _created = Tag.objects.get_or_create(
        name=fake.text.word().title(),
    )
    return level_tag


def create_fake_level() -> Level:
    level, created = Level.objects.get_or_create(
        name=" ".join(fake.text.words()).title(),
        defaults=dict(
            description=chance(0.9, fake.text.text()),
            engine=random.choice(Engine.objects.all()),
            uploader=random.choice(User.objects.all()),
            trle_id=chance(0.3, random.randint(1, 3000)),
            difficulty=random.choice(LevelDifficulty.objects.all()),
            duration=random.choice(LevelDuration.objects.all()),
            is_pending_approval=chance(0.2, True, False),
            is_approved=chance(0.8, True, False),
        ),
    )

    if created:
        level.genres.set(
            random.choice(Genre.objects.all())
            for _i in range(
                random.randint(settings.MIN_GENRES, settings.MAX_GENRES + 1)
            )
        )
        level.tags.set(
            random.choice(Tag.objects.all())
            for _i in range(
                random.randint(settings.MIN_TAGS, settings.MAX_TAGS + 1)
            )
        )
        level.authors.set(
            random.choice(User.objects.all())
            for _i in range(
                random.randint(settings.MIN_AUTHORS, settings.MAX_AUTHORS + 1)
            )
        )

        level.cover = UploadedFile.objects.create(
            content=ContentFile(fake.binaryfile.image(), name="picture.png"),
            upload_type=UploadType.LEVEL_COVER,
        )
        for _i in range(
            settings.MIN_SCREENSHOTS, settings.MAX_SCREENSHOTS + 1
        ):
            LevelScreenshot.objects.create(
                level=level,
                file=UploadedFile.objects.create(
                    content=ContentFile(
                        fake.binaryfile.image(), name="picture.png"
                    ),
                    upload_type=UploadType.LEVEL_SCREENSHOT,
                ),
            )

        level.save()

    return level


def create_fake_users(n: int) -> None:
    for _i in range(n):
        create_fake_user()


def create_fake_levels(n: int) -> None:
    for _i in range(int(n * 0.3)):
        create_fake_level_tag()
    for _i in range(n):
        create_fake_level()


class Command(BaseCommand):
    help = "Populate the database with random users and levels."

    def add_arguments(self, parser):
        parser.add_argument("-u", "--users", type=int)
        parser.add_argument("-l", "--levels", type=int)
        parser.add_argument("--delete-users", action="store_true")
        parser.add_argument("--delete-levels", action="store_true")

    def handle(self, *args, **options):
        if options["delete_users"]:
            User.objects.filter(is_superuser=False).delete()
        if options["delete_levels"]:
            Tag.objects.all().delete()
            Level.objects.all().delete()
        create_fake_users(options["users"])
        create_fake_levels(options["levels"])
