import argparse
import hashlib
import io
import logging
import sys
import tempfile
import threading
import traceback
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from functools import cache
from pathlib import Path
from typing import Any, TypeVar

import yaml
from django.conf import settings
from django.core.files.base import ContentFile, File
from django.core.management.base import BaseCommand
from tqdm import tqdm
from unidecode import unidecode

from trcustoms.engines.models import Engine
from trcustoms.levels.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelExternalLink,
    LevelFile,
    LevelScreenshot,
)
from trcustoms.reviews.models import LevelReview
from trcustoms.signals import disable_signals
from trcustoms.tags.models import Tag
from trcustoms.trle_scraper import TRLELevel, TRLEScraper, TRLEUser
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User
from trcustoms.utils import id_range, unbounded_range

lock = threading.RLock()
logger = logging.getLogger(__name__)
P = TypeVar("P")


def get_md5sum(path: Path) -> str:
    md5 = hashlib.md5()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(8192)
            if not chunk:
                break
            md5.update(chunk)
    return md5.hexdigest()


def repr_obj(obj: Any) -> str:
    return "\n".join(
        f"  {line}" for line in yaml.dump(obj, sort_keys=False).splitlines()
    )


@dataclass
class ScrapeContext:
    scraper: TRLEScraper
    show_progress: bool
    no_basic_data: bool
    no_reviews: bool
    no_images: bool
    no_files: bool
    num_workers: int
    quiet: bool


def get_trle_user_username(trle_user: TRLEUser) -> str:
    return (
        unidecode(trle_user.nickname or trle_user.full_name)
        .replace(" ", "")
        .replace("/", "")
    )


def process_reviewer(ctx: ScrapeContext, obj_id: int) -> None:
    trle_reviewer = ctx.scraper.fetch_reviewer(obj_id)
    if not ctx.quiet:
        print(f"Reviewer #{obj_id}")
        print(repr_obj(trle_reviewer))
        print(flush=True)

    if not trle_reviewer:
        return

    if not ctx.no_basic_data:
        user, created = User.objects.update_or_create(
            username__iexact=get_trle_user_username(trle_reviewer),
            defaults=dict(
                username=get_trle_user_username(trle_reviewer),
                source=User.Source.trle,
                trle_reviewer_id=obj_id,
            ),
        )
        if created:
            user.is_active = False
            user.set_unusable_password()
            user.save()


def process_author(ctx: ScrapeContext, obj_id: int) -> None:
    trle_author = ctx.scraper.fetch_author(obj_id)
    if not ctx.quiet:
        print(f"Author #{obj_id}")
        print(repr_obj(trle_author))
        print(flush=True)

    if not trle_author:
        return

    if not ctx.no_basic_data:
        user, created = User.objects.update_or_create(
            username__iexact=get_trle_user_username(trle_author),
            defaults=dict(
                username=get_trle_user_username(trle_author),
                source=User.Source.trle,
                trle_author_id=obj_id,
            ),
        )
        if created:
            user.is_active = False
            user.set_unusable_password()
            user.save()

        user.authored_levels.set(
            Level.objects.filter(trle_id__in=trle_author.level_ids)
        )


@cache
def map_difficulty(trle_difficulty: str) -> LevelDifficulty | None:
    return LevelDifficulty.objects.filter(
        name={
            "easy": "Easy",
            "medium": "Medium",
            "challenging": "Hard",
            "very challenging": "Very hard",
            None: None,
        }[trle_difficulty]
    ).first()


@cache
def map_duration(trle_duration: str) -> LevelDuration | None:
    return LevelDuration.objects.filter(
        name={
            "short": "Short",
            "medium": "Medium",
            "long": "Long",
            "very long": "Very long",
            None: None,
        }[trle_duration]
    ).first()


@cache
def map_engine(trle_engine: str) -> Engine:
    engine, _created = Engine.objects.get_or_create(name=trle_engine)
    return engine


@cache
def map_reviewer(trle_reviewer_id: int) -> User | None:
    return User.objects.filter(trle_reviewer_id=trle_reviewer_id).first()


def process_level_basic_data(obj_id: int, trle_level: TRLELevel) -> Level:
    level, _created = Level.objects.get_or_create(
        trle_id=obj_id,
        is_approved=True,
        defaults=dict(
            name=trle_level.title,
            description=trle_level.synopsis,
            difficulty=map_difficulty(trle_level.difficulty),
            duration=map_duration(trle_level.duration),
            engine=map_engine(trle_level.file_type),
        ),
    )
    if level.created.date() != trle_level.release_date:
        level.created = trle_level.release_date
        level.save()
    if level.name != trle_level.title:
        level.name = trle_level.title
        level.save()
    if level.description != trle_level.synopsis:
        level.description = trle_level.synopsis
        level.save()

    if (
        trle_level.category
        and not level.tags.filter(name=trle_level.category).exists()
    ):
        tag, _created = Tag.objects.get_or_create(name=trle_level.category)
        level.tags.add(tag)

    if sorted(
        level.authors.values_list("trle_author_id", flat=True)
    ) != sorted(trle_level.author_ids):
        for user in User.objects.filter(
            trle_author_id__in=trle_level.author_ids
        ):
            level.authors.add(user)

    external_links: list[str, LevelExternalLink.LinkType] = []
    if url := trle_level.website_url:
        external_links.append((url, LevelExternalLink.LinkType.MAIN))
    for url in trle_level.showcase_urls:
        external_links.append((url, LevelExternalLink.LinkType.SHOWCASE))

    if sorted(level.external_links.values_list("url", flat=True)) != sorted(
        url for url, link_type in external_links
    ):
        LevelExternalLink.objects.filter(level=level).delete()
        for i, (url, link_type) in enumerate(external_links):
            LevelExternalLink.objects.create(
                level=level,
                url=url,
                position=i,
                link_type=link_type,
            )

    return level


def process_level_reviews(level: Level, trle_level: TRLELevel) -> None:
    for trle_review in trle_level.reviews:
        reviewer = map_reviewer(trle_review.reviewer_id)
        if not reviewer:
            logging.warning(
                "Reviewer #%d not found. Fetch reviewers first",
                trle_review.reviewer_id,
            )
        elif not trle_review.publication_date:
            logging.warning(
                "Review from user #%d of level #%d has no publication date",
                trle_review.reviewer_id,
                trle_level.level_id,
            )
        else:
            review, _created = LevelReview.objects.get_or_create(
                level=level,
                author=reviewer,
                review_type=LevelReview.ReviewType.TRLE,
                defaults=dict(
                    trle_rating_gameplay=trle_review.rating_gameplay,
                    trle_rating_enemies=trle_review.rating_enemies,
                    trle_rating_atmosphere=trle_review.rating_atmosphere,
                    trle_rating_lighting=trle_review.rating_lighting,
                    text=trle_review.text,
                ),
            )
            if review.created.date() != trle_review.publication_date:
                review.created = trle_review.publication_date
                review.save()


def process_level_images(
    ctx: ScrapeContext, level: Level, trle_level: TRLELevel
) -> None:
    image_urls = [trle_level.main_image_url] + trle_level.screenshot_urls
    for pos, image_url in enumerate(image_urls):
        with tempfile.TemporaryDirectory(dir=settings.CACHE_DIR) as tmpdir:
            path = Path(tmpdir) / "dummy.dat"
            with path.open("wb") as handle:
                ctx.scraper.get_file(image_url, file=handle)
            image_content = path.read_bytes()

            size = len(image_content)
            md5sum = hashlib.md5(image_content).hexdigest()
            uploaded_file, _created = UploadedFile.objects.get_or_create(
                md5sum=md5sum,
                defaults=dict(
                    upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
                    content=ContentFile(
                        image_content, name=Path(image_url).name
                    ),
                    size=size,
                ),
            )

            if pos == 0:
                if level.cover != uploaded_file:
                    level.cover = uploaded_file
                    level.save(update_fields=["cover"])
            else:
                LevelScreenshot.objects.update_or_create(
                    level=level,
                    position=pos,
                    defaults=dict(
                        file=uploaded_file,
                    ),
                )


def process_level_files(
    ctx: ScrapeContext, level: Level, trle_level: TRLELevel
) -> None:
    with tempfile.TemporaryDirectory(dir=settings.CACHE_DIR) as tmpdir:
        path = Path(tmpdir) / "dummy.zip"
        with path.open("wb") as handle:
            ctx.scraper.get_file(trle_level.download_url, file=handle)

        with lock, disable_signals():
            size = path.stat().st_size
            if not size:
                return
            md5sum = get_md5sum(path)
            uploaded_file = UploadedFile.objects.filter(md5sum=md5sum).first()
            if not uploaded_file:
                with path.open("rb") as handle:
                    uploaded_file = UploadedFile.objects.create(
                        md5sum=md5sum,
                        size=size,
                        upload_type=UploadedFile.UploadType.LEVEL_FILE,
                        content=File(handle, name=path.name),
                    )
            if not level.files.filter(file=uploaded_file).exists():
                LevelFile.objects.update_or_create(
                    level=level,
                    file=uploaded_file,
                    defaults=dict(
                        version=1,
                    ),
                )


def process_level(ctx: ScrapeContext, obj_id: int) -> None:
    trle_level = ctx.scraper.fetch_level(obj_id)
    if not ctx.quiet:
        print(f"Level #{obj_id}")
        print(repr_obj(trle_level))
        print(flush=True)

    if not trle_level:
        return

    if not ctx.no_basic_data:
        level = process_level_basic_data(obj_id, trle_level)
    else:
        level = Level.objects.get(trle_id=obj_id)

    if not ctx.no_reviews:
        process_level_reviews(level, trle_level)
    if not ctx.no_images:
        process_level_images(ctx, level, trle_level)
    if not ctx.no_files:
        process_level_files(ctx, level, trle_level)


def run_in_parallel(
    ctx: ScrapeContext,
    obj_ids: list[int],
    worker: Callable[[ScrapeContext, int], None],
) -> None:
    with tqdm(
        range(len(obj_ids)),
        file=sys.stderr if ctx.show_progress else io.StringIO(),
    ) as progress, ThreadPoolExecutor(max_workers=ctx.num_workers) as executor:
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
            progress.update()


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
            type=id_range,
            help="Fetch reviewers",
            nargs="?",
            default=argparse.SUPPRESS,
        )
        parser.add_argument(
            "--authors",
            type=id_range,
            help="Fetch authors",
            nargs="?",
            default=argparse.SUPPRESS,
        )
        parser.add_argument(
            "--levels",
            type=id_range,
            help="Fetch all levels",
            nargs="?",
            default=argparse.SUPPRESS,
        )

        parser.add_argument(
            "-q",
            "--quiet",
            action="store_true",
            help="Reduce output verbosity",
        )
        parser.add_argument(
            "-p",
            "--progress",
            action="store_true",
            help="Show progress",
        )
        parser.add_argument(
            "--no-basic-data",
            action="store_true",
            help="Disable fetching basic information",
        )
        parser.add_argument(
            "--no-reviews",
            action="store_true",
            help="Disable fetching level reviews",
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
            show_progress=options["progress"],
            no_basic_data=options["no_basic_data"],
            no_reviews=options["no_reviews"],
            no_images=options["no_images"],
            no_files=options["no_files"],
            num_workers=options["num_workers"],
            quiet=options["quiet"],
        )

        if ctx.show_progress:
            logging.disable(logging.WARNING)

        def get_common_obj_ids(
            opt_name: str, all_obj_ids_cb: Callable[[], Iterable[int]]
        ) -> Iterable[int]:
            if opt_name not in options:
                return
            if options[opt_name]:
                ranges = list(options[opt_name])
            else:
                ranges = [unbounded_range(start=1)]
            for num in all_obj_ids_cb():
                if any(num in r for r in ranges):
                    yield num

        if obj_ids := sorted(
            get_common_obj_ids("reviewers", ctx.scraper.fetch_all_reviewer_ids)
        ):
            handle_reviewers(ctx, obj_ids)

        if obj_ids := sorted(
            get_common_obj_ids("authors", ctx.scraper.fetch_all_author_ids)
        ):
            handle_authors(ctx, obj_ids)

        if obj_ids := sorted(
            get_common_obj_ids("levels", ctx.scraper.fetch_all_level_ids)
        ):
            handle_levels(ctx, obj_ids)
