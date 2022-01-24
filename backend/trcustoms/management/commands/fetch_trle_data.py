import argparse
import hashlib
import logging
import sys
import tempfile
import traceback
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any, TypeVar

import yaml
from django.core.files.base import ContentFile, File
from django.core.management.base import BaseCommand
from unidecode import unidecode

from trcustoms.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelExternalLink,
    LevelFile,
    LevelReview,
    LevelScreenshot,
    LevelTag,
    UploadedFile,
    User,
)
from trcustoms.trle_scraper import TRLELevel, TRLEScraper, TRLEUser
from trcustoms.utils import id_range, unbounded_range

logger = logging.getLogger(__name__)
P = TypeVar("P")


def get_md5sum(path: Path) -> str:
    md5 = hashlib.md5()
    with path.open("rb") as handle:
        chunk = handle.read(8192)
        if chunk:
            md5.update(chunk)
    return md5.hexdigest()


def repr_obj(obj: Any) -> str:
    return "\n".join(
        f"  {line}" for line in yaml.dump(obj, sort_keys=False).splitlines()
    )


@dataclass
class ScrapeContext:
    scraper: TRLEScraper
    no_basic_data: bool
    no_reviews: bool
    no_images: bool
    no_files: bool
    num_workers: int
    quiet: bool


def get_trle_user_username(trle_user: TRLEUser) -> str:
    return unidecode(trle_user.nickname or trle_user.full_name).replace(
        " ", "_"
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
                trle_reviewer_id=obj_id,
            ),
        )
        if created:
            user.is_active = False
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
                trle_author_id=obj_id,
            ),
        )
        if created:
            user.is_active = False
            user.save()

        user.authored_levels.set(
            Level.objects.filter(trle_id__in=trle_author.level_ids)
        )


def process_level_basic_data(obj_id: int, trle_level: TRLELevel) -> Level:
    engine, _created = LevelEngine.objects.get_or_create(
        name=trle_level.file_type
    )
    level, _created = Level.objects.update_or_create(
        trle_id=obj_id,
        defaults=dict(
            name=trle_level.title,
            description=trle_level.synopsis,
            difficulty=LevelDifficulty.objects.filter(
                name={
                    "easy": "Easy",
                    "medium": "Medium",
                    "challenging": "Hard",
                    "very challenging": "Very hard",
                    None: None,
                }[trle_level.difficulty]
            ).first(),
            duration=LevelDuration.objects.filter(
                name={
                    "short": "Short",
                    "medium": "Medium",
                    "long": "Long",
                    "very long": "Very long",
                    None: None,
                }[trle_level.duration]
            ).first(),
            engine=engine,
        ),
        is_approved=True,
    )
    if level.created.date() != trle_level.release_date:
        level.created = trle_level.release_date
        level.save()

    if trle_level.category:
        tag, _created = LevelTag.objects.get_or_create(
            name=trle_level.category
        )
        level.tags.add(tag)

    for user in User.objects.filter(trle_author_id__in=trle_level.author_ids):
        level.authors.add(user)

    external_links: list[str, LevelExternalLink.LinkType] = []
    if url := trle_level.website_url:
        external_links.append((url, LevelExternalLink.LinkType.MAIN))
    for url in trle_level.showcase_urls:
        external_links.append((url, LevelExternalLink.LinkType.SHOWCASE))

    LevelExternalLink.objects.filter(
        position__gte=len(external_links)
    ).delete()
    for i, (url, link_type) in enumerate(external_links):
        LevelExternalLink.objects.update_or_create(
            level=level,
            url=url,
            defaults=dict(position=i, link_type=link_type),
        )
    for i, (url, link_type) in enumerate(external_links):
        LevelExternalLink.objects.update_or_create(
            level=level,
            position=i,
            defaults=dict(url=url, link_type=link_type),
        )

    return level


def process_level_reviews(level: Level, trle_level: TRLELevel) -> None:
    for trle_review in trle_level.reviews:
        reviewer = User.objects.filter(
            trle_reviewer_id=trle_review.reviewer_id
        ).first()
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
            review, _created = LevelReview.objects.update_or_create(
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


def process_level_images(level: Level, trle_level: TRLELevel) -> None:
    image_urls = [trle_level.main_image_url] + trle_level.screenshot_urls
    for pos, image_url in enumerate(image_urls):
        image_content = TRLEScraper().get_bytes(image_url)
        md5sum = hashlib.md5(image_content).hexdigest()
        uploaded_file, _created = UploadedFile.objects.get_or_create(
            md5sum=md5sum,
            defaults=dict(
                upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
                content=ContentFile(image_content, name=Path(image_url).name),
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


def process_level_files(level: Level, trle_level: TRLELevel) -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        path = Path(tmpdir) / "dummy.zip"
        with path.open("wb") as handle:
            TRLEScraper().get_bytes_parallel(
                trle_level.download_url, file=handle
            )
        if path.stat().st_size:
            md5sum = get_md5sum(path)
            with path.open("rb") as handle:
                uploaded_file, _created = UploadedFile.objects.get_or_create(
                    md5sum=md5sum,
                    defaults=dict(
                        upload_type=UploadedFile.UploadType.LEVEL_FILE,
                        content=File(handle, name=path.name),
                    ),
                )
                LevelFile.objects.update_or_create(
                    level=level, defaults=dict(file=uploaded_file)
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
        process_level_images(level, trle_level)
    if not ctx.no_files:
        process_level_files(level, trle_level)


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
            "--no-cache",
            action="store_true",
            help="Disable cache",
        )

        parser.add_argument(
            "--num-workers",
            type=int,
            default=10,
            help="How many parallel threads to run",
        )

    def handle(self, *args, **options):
        ctx = ScrapeContext(
            scraper=TRLEScraper(disable_cache=options["no_cache"]),
            no_basic_data=options["no_basic_data"],
            no_reviews=options["no_reviews"],
            no_images=options["no_images"],
            no_files=options["no_files"],
            num_workers=options["num_workers"],
            quiet=options["quiet"],
        )

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

        if obj_ids := get_common_obj_ids(
            "reviewers", ctx.scraper.fetch_all_reviewer_ids
        ):
            handle_reviewers(ctx, sorted(obj_ids))

        if obj_ids := get_common_obj_ids(
            "authors", ctx.scraper.fetch_all_author_ids
        ):
            handle_authors(ctx, sorted(obj_ids))

        if obj_ids := get_common_obj_ids(
            "levels", ctx.scraper.fetch_all_level_ids
        ):
            handle_levels(ctx, sorted(obj_ids))
