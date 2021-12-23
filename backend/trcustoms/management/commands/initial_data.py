from django.core.management.base import BaseCommand

from trcustoms.models import (
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelGenre,
)

GENRES = [
    "Action",
    "Adventure",
    "Puzzle-solving",
    "Platformer",
    "Shooter",
    "RPG",
    "Casual",
    "Story-driven",
    "Mystery",
    "Fantasy",
    "Surreal",
    "Horror",
    "Sci-Fi",
    "Humor",
    "Remake",
    "Reimagining",
    "Metafiction",
    "Stealth",
    "Thriller",
    "Survival",
    "Historical",
    "Exploration",
]

ENGINES = ["TR1", "TR2", "TR3", "TR4", "TR5", "TEN"]
DURATIONS = ["Short", "Medium", "Long", "Very long"]
DIFFICULTIES = ["Easy", "Medium", "Hard", "Very hard"]


class Command(BaseCommand):
    help = "Populate the database with initial data."

    def handle(self, *args, **options):
        for name in GENRES:
            LevelGenre.objects.get_or_create(name=name)

        for name in ENGINES:
            LevelEngine.objects.get_or_create(name=name)

        for i, name in enumerate(DURATIONS, 1):
            LevelDuration.objects.get_or_create(
                name=name, defaults=dict(position=i)
            )

        for i, name in enumerate(DIFFICULTIES, 1):
            LevelDifficulty.objects.get_or_create(
                name=name, defaults=dict(position=i)
            )
