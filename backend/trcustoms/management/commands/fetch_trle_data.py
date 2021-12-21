import logging
import re
import sys
import traceback
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any, TypeVar

import yaml
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from trcustoms.models import (
    Level,
    LevelEngine,
    LevelFile,
    LevelMedium,
    LevelTag,
    User,
)
from trcustoms.trle_scraper import TRLEScraper

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


@dataclass
class ScrapeContext:
    scraper: TRLEScraper
    no_images: bool
    no_files: bool
    num_workers: int
    quiet: bool


def process_reviewer(ctx: ScrapeContext, obj_id: int) -> None:
    trle_reviewer = ctx.scraper.fetch_reviewer(obj_id)
    if not ctx.quiet:
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


def process_author(ctx: ScrapeContext, obj_id: int) -> None:
    trle_author = ctx.scraper.fetch_author(obj_id)
    if not ctx.quiet:
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

    user.authored_levels.set(
        Level.objects.filter(trle_id__in=trle_author.level_ids)
    )


def process_level(ctx: ScrapeContext, obj_id: int) -> None:
    trle_level = ctx.scraper.fetch_level(obj_id)
    if not ctx.quiet:
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
    if level.created.date() != trle_level.release_date:
        level.created = trle_level.release_date
        level.save()

    if not ctx.no_images:
        image_urls = [trle_level.main_image_url] + trle_level.screenshot_urls
        for pos, image_url in enumerate(image_urls):
            image_content = TRLEScraper().get_bytes(image_url)
            LevelMedium.objects.update_or_create(
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

    if not ctx.no_files:
        level_content = TRLEScraper().get_bytes_parallel(
            trle_level.download_url
        )
        if level_content:
            LevelFile.objects.update_or_create(
                level=level,
                defaults=dict(
                    file=ContentFile(level_content, name="dummy.zip")
                ),
            )


def run_in_parallel(
    ctx: ScrapeContext,
    obj_ids: list[int],
    worker: Callable[[ScrapeContext, int], None],
) -> None:
    with ThreadPoolExecutor(max_workers=ctx.num_workers) as executor:
        future_to_obj_id = {
            executor.submit(worker, ctx, obj_id): obj_id for obj_id in obj_ids
        }
        for future in as_completed(future_to_obj_id):
            obj_id = future_to_obj_id[future]
            try:
                future.result()
            except Exception:
                print(
                    f"Error while calling {worker} " f"for object #{obj_id}:",
                    file=sys.stderr,
                )
                print(traceback.format_exc(), file=sys.stderr)


def handle_reviewers(ctx: ScrapeContext, reviewer_ids: list[int]) -> None:
    run_in_parallel(ctx, reviewer_ids, process_reviewer)


def handle_authors(ctx: ScrapeContext, author_ids: list[int]) -> None:
    run_in_parallel(ctx, author_ids, process_author)


def handle_levels(
    ctx: ScrapeContext,
    level_ids: list[int],
) -> None:
    run_in_parallel(ctx, level_ids, process_level)


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
            "--authors", action="store_true", help="Fetch all authors"
        )

        parser.add_argument(
            "--levels", action="store_true", help="Fetch all levels"
        )
        parser.add_argument(
            "--level", type=id_range, help="Fetch specific levels"
        )

        parser.add_argument(
            "-q",
            "--quiet",
            action="store_true",
            help="Reduce output verbosity",
        )
        parser.add_argument(
            "--no-images",
            action="store_true",
            help="Disable downloading level images",
        )
        parser.add_argument(
            "--no-files",
            action="store_true",
            help="Disable downloading level files",
        )

        parser.add_argument(
            "--num-workers",
            type=int,
            default=10,
            help="How many parallel threads to run",
        )

    def handle(self, *args, **options):
        ctx = ScrapeContext(
            scraper=TRLEScraper(),
            no_images=options["no_images"],
            no_files=options["no_files"],
            num_workers=options["num_workers"],
            quiet=options["quiet"],
        )

        if options["reviewers"]:
            handle_reviewers(ctx, sorted(ctx.scraper.fetch_all_reviewer_ids()))
        if options["reviewer"]:
            handle_reviewers(ctx, list(options["reviewer"]))

        if options["authors"]:
            handle_authors(ctx, sorted(ctx.scraper.fetch_all_author_ids()))
        if options["author"]:
            handle_authors(ctx, list(options["author"]))

        if options["levels"]:
            handle_levels(ctx, sorted(ctx.scraper.fetch_all_level_ids()))
        if options["level"]:
            handle_levels(ctx, list(options["level"]))
