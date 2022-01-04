from django.core.management.base import BaseCommand

from trcustoms.models import (
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelGenre,
)

GENRES = [
    (
        "Action",
        "Fast-paced gameplay that keeps the player pumped and engaged.",
    ),
    (
        "Adventure",
        "The game has a large variety of areas that are unfamiliar, waiting "
        "for the player to uncover them throughout the journey.",
    ),
    (
        "Puzzle-solving",
        "The player's logic and problem solving skills are constantly tested "
        "by the game",
    ),
    (
        "Platformer",
        "Includes a lot of jumping and climbing, involves knowing the "
        "controls and movement physics intensely.",
    ),
    (
        "Shooter",
        "The game has a lot of enemies and the gameplay heavily involves "
        "shooting things.",
    ),
    (
        "RPG",
        "The gameplay can include optional events that the player can choose "
        "to progress or build themselves.",
    ),
    (
        "Casual",
        "This game doesn't require a massive investment of skill or time, you "
        "don't have to be a master to enjoy the ride.",
    ),
    (
        "Story-driven",
        "Progress is frequently advanced by the narrative using dialogue or "
        "bits of information important to the plot.",
    ),
    (
        "Mystery",
        "The player is out to uncover a secret and solve the unknown.",
    ),
    (
        "Fantasy",
        "The supernatural and otherworldly are the norm, a magically vivid "
        "world that doesn't care about being believable.",
    ),
    (
        "Surreal",
        "Qualities of crazy and dreamy occurences happening in a grounded "
        "world.",
    ),
    (
        "Horror",
        "The game is focused on scaring and startling you with dreadful "
        "moments, usually with jumpscares or violent scenes.",
    ),
    (
        "Sci-Fi",
        "The game may have themes of frutistic science, advanced technology, "
        "or the strange extraterrestrial world.",
    ),
    ("Humor", "Jokeful and satirical themes designed to make you laugh."),
    ("Remake", "A mostly faithful recreation of a preexisting creation."),
    (
        "Reimagining",
        "Reinventing a preexisting creation in your own way with usually "
        "extreme and drastic changes.",
    ),
    (
        "Metafiction",
        "The game carries a self-aware narrative, the player is constantly "
        "reminded they are playing obviously fictional work.",
    ),
    (
        "Stealth",
        "The game facilitates ways for the player to remain undetected and "
        "sneak around as direct combat is not always an option.",
    ),
    (
        "Thriller",
        "The game's mood keeps players on their toes with suspense, "
        "anticipation, and constant anxiety.",
    ),
    (
        "Survival",
        "Includes elements where the gameplay involves the player to actively "
        "stay alive.",
    ),
    (
        "Historical",
        "There are elements that are related or linked to non-fictitious "
        "history.",
    ),
    (
        "Exploration",
        "The player is usually encouraged to explore a very large or complex "
        "environment to be able to progress.",
    ),
]

ENGINES = ["TR1", "TR2", "TR3", "TR4", "TR5", "TEN"]
DURATIONS = ["Short", "Medium", "Long", "Very long"]
DIFFICULTIES = ["Easy", "Medium", "Hard", "Very hard"]


class Command(BaseCommand):
    help = "Populate the database with initial data."

    def handle(self, *args, **options):
        for name, description in GENRES:
            LevelGenre.objects.update_or_create(
                name=name, defaults=dict(description=description)
            )

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
