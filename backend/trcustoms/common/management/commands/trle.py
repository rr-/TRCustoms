import logging
import math
import re

import lxml.html
import requests
from django.core.cache import cache
from django.core.management.base import BaseCommand

from trcustoms.levels.models import Level

logger = logging.getLogger(__name__)


def clean_title(title: str) -> str:
    cleaned = re.sub(r"[^\w\s]", "", title or "")
    cleaned = re.sub(r"\s+", " ", cleaned).strip().lower()
    return cleaned


def jaccard(a: str, b: str) -> float:
    """Compute Jaccard distance between two cleaned strings."""
    set_a = set(a.split())
    set_b = set(b.split())
    if not set_a and not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return 1.0 - (len(intersection) / len(union))


class Command(BaseCommand):
    help = "Scrape TRLE levels and match titles against local database."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--distance",
            "-d",
            type=float,
            default=0.5,
            help="Max Jaccard distance (0.0-1.0) for fuzzy matching",
        )
        parser.add_argument(
            "--exact",
            "-e",
            action="store_true",
            help="Require exact title match after cleaning",
        )

    def handle(self, *args, **options) -> None:
        distance: float = options["distance"]
        exact: bool = options["exact"]

        collected = self.fetch_levels()
        found, not_found = self.match_titles(collected, distance, exact)
        self.report_results(found, len(collected), not_found)

    def fetch_levels(self) -> list[tuple[int, str]]:
        """Fetch all paginated TRLE levels with caching. Log progress."""
        collected: list[tuple[int, str]] = []
        idx = 0
        page = 0
        total_levels: int | None = None
        total_pages: int | None = None

        while True:
            cache_key = f"trle_find_page_{idx}"
            html_content = cache.get(cache_key)
            if html_content is None:
                url = (
                    "https://www.trle.net/pFind.php?"
                    f"sortidx=8&sorttype=2&idx={idx}"
                )
                resp = requests.get(url)
                resp.raise_for_status()
                html_content = resp.text
                cache.set(cache_key, html_content, timeout=60 * 60 * 3)

            doc = lxml.html.fromstring(html_content)
            items = self.parse_items(doc)
            if not items:
                break

            if total_levels is None:
                total_levels, total_pages = self.parse_total_estimate(
                    doc, len(items)
                )

            page += 1
            collected.extend(items)
            logger.info(
                "(%.1f%% complete) Page %d: %d items, collected %d total",
                page / max(1, total_pages) * 100,
                page,
                len(items),
                len(collected),
            )

            idx += len(items)

        return collected

    def parse_items(self, doc: lxml.html.HtmlElement) -> list[tuple[int, str]]:
        """Extract level ID and title tuples from a page document."""
        results: list[tuple[int, str]] = []
        for link in doc.xpath('//a[contains(@href, "sc/levelfeatures.php")]'):
            href = link.get("href") or ""
            m = re.search(r"lid=(\d+)", href)
            if not m:
                continue
            lid = int(m.group(1))
            title = link.text_content().strip()
            results.append((lid, title))
        return results

    def parse_total_estimate(
        self, doc: lxml.html.HtmlElement, page_len: int
    ) -> tuple[int | None, int | None]:
        """Read total levels from stats and estimate total pages."""
        stats = doc.xpath(
            "//p[@class='statText'][contains(., 'Levels listed')]"
        )
        if not stats:
            return None, None

        nums = stats[0].xpath(".//strong/text()")
        total = sum(int(n) for n in nums)
        pages = math.ceil(total / page_len) if page_len else None
        logger.info("Total levels: %d; estimating %d pages", total, pages)
        return total, pages

    def match_titles(
        self,
        collected: list[tuple[int, str]],
        distance: float,
        exact: bool,
    ) -> tuple[int, list[tuple[int, str]]]:
        """Compare scraped titles to local level names, return match stats."""
        local = list(Level.objects.values_list("id", "name"))
        local_cleaned = [(lid, clean_title(name)) for lid, name in local]

        found = 0
        not_found: list[tuple[int, str]] = []
        for lid, title in collected:
            cleaned = clean_title(title)
            if exact:
                matched = any(cn == cleaned for _, cn in local_cleaned)
            else:
                matched = any(
                    jaccard(cleaned, cn) <= distance for _, cn in local_cleaned
                )
            if matched:
                found += 1
            else:
                not_found.append((lid, title))
        return found, not_found

    def report_results(
        self,
        found: int,
        total: int,
        not_found: list[tuple[int, str]],
    ) -> None:
        """Output summary and list of unmatched levels."""
        self.stdout.write(f"Found {found} of {total} titles.")
        if not not_found:
            return

        self.stdout.write("Levels not found:")
        for lid, title in not_found:
            url = f"https://www.trle.net/sc/levelfeatures.php?lid={lid}"
            self.stdout.write(f"{url} {title}")
