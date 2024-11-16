import csv
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.models import Country, RatingClass
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.levels.models import LevelDifficulty, LevelDuration
from trcustoms.ratings.models import (
    RatingTemplateAnswer,
    RatingTemplateQuestion,
)


class Command(BaseCommand):
    help = "Populate the database with initial data."
    root_dir = Path(__file__).parent / "initial_data"

    def handle(self, *args, **options):
        self.create_countries()
        self.create_genres()
        self.create_engines()
        self.create_durations()
        self.create_difficulties()
        self.create_review_template()
        self.create_rating_classes()

    def create_countries(self) -> None:
        for item in self.read_csv("countries.csv"):
            Country.objects.update_or_create(
                code=item["Code"], defaults=dict(name=item["Name"])
            )

    def create_genres(self) -> None:
        for item in self.read_json("genres.json"):
            Genre.objects.update_or_create(
                name=item["name"],
                defaults=dict(description=item["description"]),
            )

    def create_engines(self) -> None:
        for item in self.read_json("engines.json"):
            Engine.objects.update_or_create(
                name=item["name"], defaults=dict(position=item["position"])
            )

    def create_durations(self) -> None:
        for item in self.read_json("durations.json"):
            LevelDuration.objects.update_or_create(
                name=item["name"], defaults=dict(position=item["position"])
            )

    def create_difficulties(self) -> None:
        for item in self.read_json("difficulties.json"):
            LevelDifficulty.objects.update_or_create(
                name=item["name"], defaults=dict(position=item["position"])
            )

    def create_review_template(self) -> None:
        for qitem in self.read_json("rating_questions.json"):
            (
                question,
                _created,
            ) = RatingTemplateQuestion.objects.update_or_create(
                position=qitem["position"],
                defaults=dict(
                    weight=qitem["weight"],
                    question_text=qitem["question_text"],
                    category=qitem["category"],
                ),
            )
            for apos, aitem in enumerate(qitem["answers"]):
                RatingTemplateAnswer.objects.update_or_create(
                    question__position=qitem["position"],
                    position=apos,
                    defaults=dict(
                        question=question,
                        points=aitem["points"],
                        answer_text=aitem["answer_text"],
                    ),
                )

    def create_rating_classes(self) -> None:
        data = self.read_json("rating_classes.json")
        for path, target in [
            ("levels", RatingClassSubject.LEVEL),
            ("ratings", RatingClassSubject.RATING),
        ]:
            for item in data[path]:
                RatingClass.objects.update_or_create(
                    target=target,
                    position=item["position"],
                    defaults=dict(
                        name=item["name"],
                        min_rating_average=item["min_rating_average"],
                        max_rating_average=item["max_rating_average"],
                        min_rating_count=item["min_rating_count"],
                    ),
                )

    def read_csv(self, name: str):
        with (self.root_dir / name).open("r") as handle:
            return list(csv.DictReader(handle))

    def read_json(self, name: str):
        return json.loads((self.root_dir / name).read_text())
