import logging
import re
import traceback
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, TypeVar

import yaml
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from trcustoms.models import Level, LevelEngine, LevelImage, LevelTag, User
from trcustoms.trle_scraper import (
    TRLEAuthor,
    TRLELevel,
    TRLEReviewer,
    TRLEScraper,
)

logger = logging.getLogger(__name__)
P = TypeVar("P")


def split_full_name(full_name: str | None) -> tuple[str, str]:
    match (full_name or "").split(maxsplit=1):
        case (first_name,):
            last_name = ""
        case (first_name, last_name):
            pass
        case _:
            first_name = ""
            last_name = ""
    return first_name, last_name


def id_range(source: str) -> Iterable[int]:
    items = re.sub(r"\s+", "", source).split(",")
    for item in items:
        if match := re.fullmatch(r"(\d+)", item):
            yield int(match.group(1))
        elif match := re.fullmatch(r"(\d+)\.\.\.?(\d+)", item):
            yield from range(int(match.group(1)), int(match.group(2)) + 1)
        else:
            raise ValueError(f"Bad range: {item}")


def repr_obj(obj: Any) -> str:
    return "\n".join(
        f"  {line}" for line in yaml.dump(obj, sort_keys=False).splitlines()
    )


def process_reviewer(obj_id: int, trle_reviewer: TRLEReviewer | None) -> None:
    print(f"Reviewer #{obj_id}")
    print(repr_obj(trle_reviewer))
    print(flush=True)

    if not trle_reviewer:
        return

    first_name, last_name = split_full_name(trle_reviewer.full_name)
    User.objects.update_or_create(
        username=trle_reviewer.nickname or trle_reviewer.full_name,
        defaults=dict(
            trle_reviewer_id=obj_id,
            first_name=first_name,
            last_name=last_name,
        ),
    )


def process_author(obj_id: int, trle_author: TRLEAuthor | None) -> None:
    print(f"Author #{obj_id}")
    print(repr_obj(trle_author))
    print(flush=True)

    if not trle_author:
        return

    first_name, last_name = split_full_name(trle_author.full_name)
    user, _created = User.objects.update_or_create(
        username=trle_author.nickname or trle_author.full_name,
        defaults=dict(
            trle_author_id=obj_id,
            first_name=first_name,
            last_name=last_name,
        ),
    )

    user.levels.set(Level.objects.filter(trle_id__in=trle_author.level_ids))


def process_level(obj_id: int, trle_level: TRLELevel | None) -> None:
    print(f"Level #{obj_id}")
    print(repr_obj(trle_level))
    print(flush=True)

    if not trle_level:
        return

    engine, _created = LevelEngine.objects.get_or_create(
        name=trle_level.file_type
    )
    level, _created = Level.objects.update_or_create(
        trle_id=obj_id,
        defaults=dict(
            name=trle_level.title,
            description=trle_level.synopsis,
            difficulty={
                "easy": Level.Difficulty.easy,
                "medium": Level.Difficulty.medium,
                "challenging": Level.Difficulty.hard,
                "very challenging": Level.Difficulty.very_hard,
                None: None,
            }[trle_level.difficulty],
            duration={
                "short": Level.Duration.short,
                "medium": Level.Duration.medium,
                "long": Level.Duration.long,
                "very long": Level.Duration.very_long,
                None: None,
            }[trle_level.duration],
            engine=engine,
        ),
    )
    level.created = trle_level.release_date
    level.save()

    image_urls = [trle_level.main_image_url] + trle_level.screenshot_urls
    for pos, image_url in enumerate(image_urls):
        image_content = TRLEScraper().get_bytes(image_url)
        LevelImage.objects.get_or_create(
            level=level,
            position=pos,
            defaults=dict(
                image=ContentFile(image_content, name=Path(image_url).name)
            ),
        )

    if trle_level.category:
        tag, _created = LevelTag.objects.get_or_create(
            name=trle_level.category
        )
        level.tags.add(tag)

    for user in User.objects.filter(trle_author_id__in=trle_level.author_ids):
        level.authors.add(user)


class Command(BaseCommand):
    help = "Fetch information from trle.net."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reviewers",
            action="store_true",
            help="Fetch all reviewers",
        )
        parser.add_argument(
            "--reviewer", type=id_range, help="Fetch specific reviewers"
        )

        parser.add_argument(
            "--author", type=id_range, help="Fetch specific authors"
        )

        parser.add_argument(
            "--levels", action="store_true", help="Fetch all levels"
        )
        parser.add_argument(
            "--level", type=id_range, help="Fetch specific levels"
        )

        parser.add_argument(
            "--no-cache", dest="use_cache", action="store_false"
        )

    def handle(self, *args, **options):
        scraper = TRLEScraper(use_cache=options["use_cache"])

        if options["reviewers"]:
            self.handle_reviewers(
                scraper, range(1, scraper.fetch_highest_reviewer_id() + 1)
            )
        if options["reviewer"]:
            self.handle_reviewers(scraper, list(options["reviewer"]))

        if options["author"]:
            self.handle_authors(scraper, list(options["author"]))

        if options["levels"]:
            self.handle_levels(
                scraper, range(1, scraper.fetch_highest_level_id() + 1)
            )
        if options["level"]:
            self.handle_levels(scraper, list(options["level"]))

    def handle_reviewers(
        self, scraper: TRLEScraper, reviewer_ids: list[int]
    ) -> None:
        self.run_in_parallel(
            reviewer_ids, scraper.fetch_reviewer, process_reviewer
        )

    def handle_authors(
        self, scraper: TRLEScraper, author_ids: list[int]
    ) -> None:
        self.run_in_parallel(author_ids, scraper.fetch_author, process_author)

    def handle_levels(
        self, scraper: TRLEScraper, level_ids: list[int]
    ) -> None:
        self.run_in_parallel(level_ids, scraper.fetch_level, process_level)

    def run_in_parallel(
        self,
        obj_ids: list[int],
        fetch_worker: Callable[[int], P],
        result_processor: Callable[[int, P], None],
    ) -> None:
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_obj_id = {
                executor.submit(fetch_worker, obj_id): obj_id
                for obj_id in obj_ids
            }
            for future in as_completed(future_to_obj_id):
                obj_id = future_to_obj_id[future]
                try:
                    obj = future.result()
                    result_processor(obj_id, obj)
                except Exception:
                    self.stderr.write(
                        f"Error while calling {fetch_worker} "
                        f"for object #{obj_id}:"
                    )
                    self.stderr.write(traceback.format_exc())
