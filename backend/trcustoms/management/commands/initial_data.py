import json
from pathlib import Path

from django.core.management.base import BaseCommand

from trcustoms.models import (
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelGenre,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
)


class Command(BaseCommand):
    help = "Populate the database with initial data."

    def handle(self, *args, **options):
        self.create_genres()
        self.create_engines()
        self.create_durations()
        self.create_difficulties()
        self.create_review_template()

    def create_genres(self) -> None:
        for item in self.read_json("genres.json"):
            LevelGenre.objects.update_or_create(
                name=item["name"],
                defaults=dict(description=item["description"]),
            )

    def create_engines(self) -> None:
        for item in self.read_json("engines.json"):
            LevelEngine.objects.get_or_create(name=item["name"])

    def create_durations(self) -> None:
        for item in self.read_json("durations.json"):
            LevelDuration.objects.get_or_create(
                name=item["name"], defaults=dict(position=item["position"])
            )

    def create_difficulties(self) -> None:
        for item in self.read_json("difficulties.json"):
            LevelDifficulty.objects.get_or_create(
                name=item["name"], defaults=dict(position=item["position"])
            )

    def create_review_template(self) -> None:
        for qitem in self.read_json("review_questions.json"):
            (
                question,
                _created,
            ) = ReviewTemplateQuestion.objects.update_or_create(
                position=qitem["position"],
                defaults=dict(
                    weight=qitem["weight"],
                    question_text=qitem["question_text"],
                ),
            )
            for apos, aitem in enumerate(qitem["answers"]):
                ReviewTemplateAnswer.objects.update_or_create(
                    question__position=qitem["position"],
                    position=apos,
                    defaults=dict(
                        question=question,
                        points=aitem["points"],
                        answer_text=aitem["answer_text"],
                    ),
                )

    def read_json(self, name: str):
        root_dir = Path(__file__).parent / "initial_data"
        return json.loads((root_dir / name).read_text())
