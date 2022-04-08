import logging
import sys
import traceback
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

from django.core.management.base import BaseCommand
from tqdm import tqdm

from trcustoms.reviews.models import LevelReview
from trcustoms.trle_scraper import TRLEScraper


@dataclass
class ScrapeContext:
    scraper: TRLEScraper
    num_workers: int


def process_level(ctx: ScrapeContext, obj_id: int) -> None:
    trle_level = ctx.scraper.fetch_level(obj_id)
    if trle_level:
        for trle_review in trle_level.reviews:
            review = LevelReview.objects.filter(
                level__trle_id=trle_level.level_id,
                author__trle_reviewer_id=trle_review.reviewer_id,
                review_type=LevelReview.ReviewType.TRLE,
            ).first()
            if not review:
                continue

            if review.text != trle_review.text:
                review.text = trle_review.text
                review.save(update_fields=["text"])


def run_in_parallel(
    ctx: ScrapeContext,
    obj_ids: list[int],
    worker: Callable[[ScrapeContext, int], None],
) -> None:
    with tqdm(
        range(len(obj_ids)), file=sys.stderr
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


class Command(BaseCommand):
    help = "Fix review formatting by re-fetching data trle.net."

    def add_arguments(self, parser):
        parser.add_argument(
            "--num-workers",
            type=int,
            default=10,
            help="How many parallel threads to run",
        )

    def handle(self, *args, **options):
        ctx = ScrapeContext(
            scraper=TRLEScraper(),
            num_workers=options["num_workers"],
        )

        logging.disable(logging.WARNING)

        level_ids = sorted(ctx.scraper.fetch_all_level_ids())
        run_in_parallel(ctx, level_ids, process_level)
