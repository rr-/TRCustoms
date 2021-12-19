import logging
import re
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from pathlib import Path
from urllib.parse import urljoin, urlparse

import dateutil.parser
import lxml.html
import requests
import urllib3

from trcustoms.cache import get_cache, put_cache

logger = logging.getLogger(__name__)


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]*?>", "", value)


def get_text(node) -> str:
    return strip_tags(lxml.html.tostring(node).decode()).strip()


@dataclass
class TRLEReviewer:
    full_name: str
    image_url: str
    nickname: str | None
    country: str | None
    city: str | None
    birthday: date | None
    occupation: str | None
    hobbies: str | None
    homepage: str | None
    email: str | None
    level_ids: list[int]


@dataclass
class TRLEAuthor:
    full_name: str
    image_url: str
    nickname: str | None
    country: str | None
    city: str | None
    birthday: date | None
    occupation: str | None
    hobbies: str | None
    homepage: str | None
    email: str | None
    level_ids: list[int]


@dataclass
class TRLELevelReview:
    level_id: int
    reviewer_id: int
    rating_gameplay: int
    rating_enemies: int
    rating_atmosphere: int
    rating_lighting: int
    publication_date: date | None
    text: str | None


@dataclass
class TRLELevel:
    title: str
    synopsis: str | None
    release_date: date | None
    downloads: int
    difficulty: str | None
    duration: str | None
    average_rating: Decimal
    reviews: list[TRLELevelReview]
    file_type: str
    category: str | None
    main_image_url: str
    screenshot_urls: list[str]
    author_ids: list[int]


class TRLEScraper:
    def __init__(self, use_cache: bool = True) -> None:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        self.use_cache = use_cache

    def fetch_reviewer(self, reviewer_id: int) -> TRLEReviewer | None:
        response = self.get(
            f"https://www.trle.net/sc/reviewerfeatures.php?rid={reviewer_id}",
        )
        doc = lxml.html.fromstring(response.text)

        level_ids = [
            int(match.group(0))
            for node in doc.cssselect(".medGText a[href*='levelfeatures']")
            if (match := re.search(r"\d+", node.get("href")))
        ]
        image_url = urljoin(
            "https://trle.net/",
            doc.cssselect(".navText img")[0].get("src").replace(" ", "%20"),
        )
        nickname = doc.cssselect(".subHeader a")[0].text
        if not nickname:
            return None

        texts = [
            get_text(node)
            for node in doc.cssselect(".bodyText:not([colspan])")
        ]
        attrs = {
            texts[i].rstrip(":"): texts[i + 1] or ""
            for i in range(0, len(texts), 2)
        }

        country_city = attrs["country/city"]
        country, city = country_city.split("/")

        return TRLEReviewer(
            nickname=nickname,
            full_name=attrs["name"] or None,
            image_url=image_url,
            country=country or None,
            city=city or None,
            birthday=(
                dateutil.parser.parse(attrs["birthday"]).date()
                if attrs["birthday"]
                else None
            ),
            occupation=attrs["occupation"] or None,
            hobbies=attrs["hobbies"] or None,
            homepage=attrs["homepage"] or None,
            email=attrs["email"] or None,
            level_ids=level_ids,
        )

    def fetch_author(self, author_id: int) -> TRLEAuthor | None:
        response = self.get(
            f"https://trle.net/sc/authorfeatures.php?aid={author_id}",
        )
        doc = lxml.html.fromstring(response.text)

        level_ids = [
            int(match.group(0))
            for node in doc.cssselect(".medGText a[href*='levelfeatures']")
            if (match := re.search(r"\d+", node.get("href")))
        ]
        image_url = urljoin(
            "https://trle.net/",
            doc.cssselect(".navText img")[0].get("src").replace(" ", "%20"),
        )
        nickname = doc.cssselect(".subHeader a")[0].text
        if not nickname:
            return None

        texts = [
            get_text(node)
            for node in doc.cssselect(".bodyText:not([colspan])")
        ]
        attrs = {
            texts[i].rstrip(":"): texts[i + 1] or ""
            for i in range(0, len(texts), 2)
        }

        country_city = attrs["country/city"]
        country, city = country_city.split("/")

        return TRLEAuthor(
            nickname=nickname,
            full_name=attrs["name"] or None,
            image_url=image_url,
            country=country or None,
            city=city or None,
            birthday=(
                dateutil.parser.parse(attrs["birthday"]).date()
                if attrs["birthday"]
                else None
            ),
            occupation=attrs["occupation"] or None,
            hobbies=attrs["hobbies"] or None,
            homepage=attrs["homepage"] or None,
            email=attrs["email"] or None,
            level_ids=level_ids,
        )

    def fetch_level(self, level_id: int) -> TRLELevel | None:
        response = self.get(
            f"https://trle.net/sc/levelfeatures.php?lid={level_id}"
        )
        doc = lxml.html.fromstring(response.text)

        author_ids = [
            int(match.group(0))
            for node in doc.cssselect(
                ".subHeader.Stil2 a[href*='authorfeatures']"
            )
            if (match := re.search(r"\d+", node.get("href")))
        ]

        if not author_ids:
            return None

        title = get_text(doc.cssselect(".subHeader.Stil2")[0]).split("\n")[0]
        synopsis = get_text(doc.cssselect("tr:nth-child(5) .medGText")[0])

        main_image_url = urljoin(
            "https://trle.net/", doc.cssselect(".navText img")[0].get("src")
        )
        screenshot_urls = [
            urljoin("https://trle.net/", node.getparent().get("href"))
            for node in doc.cssselect("a>img[src*='screens']")
        ]

        texts = [
            strip_tags(lxml.html.tostring(node).decode()).strip()
            for node in doc.cssselect(
                "table.bodyText td.bodyText:not(:first-child):not([colspan])"
            )
        ]
        attrs = {
            texts[i].rstrip(":"): texts[i + 1] or ""
            for i in range(0, len(texts), 2)
        }

        # prefetch images to cache
        if self.use_cache:
            for image_url in [main_image_url] + screenshot_urls:
                TRLEScraper().get_bytes(image_url)

        return TRLELevel(
            title=title,
            synopsis=synopsis or None,
            release_date=(
                dateutil.parser.parse(attrs["release date"]).date()
                if attrs["release date"]
                else None
            ),
            downloads=int(attrs["# of downloads"]),
            difficulty=attrs.get("difficulty") or None,
            duration=attrs.get("duration") or None,
            average_rating=Decimal(attrs["average rating"]),
            reviews=list(self.fetch_level_reviews(level_id)),
            file_type=attrs["file type"],
            category=attrs["class"] if attrs["class"] != "nc" else None,
            main_image_url=main_image_url,
            screenshot_urls=screenshot_urls,
            author_ids=author_ids,
        )

    def fetch_level_reviews(self, level_id: int) -> Iterable[TRLELevelReview]:
        response = self.get(f"https://trle.net/sc/reviews.php?lid={level_id}")
        doc = lxml.html.fromstring(response.text)

        for row_node in doc.cssselect(
            ".FindTable tr:not(:first-child):not(:last-child)"
        ):
            match = re.search(
                r"\d+", row_node.cssselect(".medGText a")[0].get("href")
            )
            assert match
            reviewer_id = int(match.group(0))

            reviewer_name = row_node.cssselect(".medGText a")[0].text
            ratings = [
                int(get_text(node))
                for node in row_node.cssselect("td[align='center']")
            ]

            try:
                text_node = doc.cssselect(f"a[name='{reviewer_name}']")[
                    0
                ].getparent()
            except IndexError:
                text_node = None

            text = (
                text_node.xpath("node()")[1].strip()
                if text_node is not None
                else ""
            )
            if text.endswith(reviewer_name):
                text = text[: -len(reviewer_name)].strip()
            if text.endswith("-"):
                text = text[:-1].strip()
            text = text.strip('"')

            publication_date: date | None = None
            if text_node is not None and len(
                node := text_node.cssselect("small")
            ):
                publication_date = dateutil.parser.parse(
                    node[0].text.lstrip("(").rstrip(")")
                ).date()

            yield TRLELevelReview(
                level_id=level_id,
                reviewer_id=reviewer_id,
                rating_gameplay=ratings[0],
                rating_enemies=ratings[1],
                rating_atmosphere=ratings[2],
                rating_lighting=ratings[3],
                publication_date=publication_date,
                text=text or None,
            )

    def fetch_highest_level_id(self) -> int:
        response = self.get("https://www.trle.net/rPost.php")
        doc = lxml.html.fromstring(response.text)
        return max(
            [
                int(value)
                for node in doc.cssselect("[name='lid'] option")
                if (value := node.get("value"))
            ]
        )

    def fetch_highest_reviewer_id(self) -> int:
        response = self.get("https://www.trle.net/rPost.php")
        doc = lxml.html.fromstring(response.text)
        return max(
            [
                int(value)
                for node in doc.cssselect("[name='rid'] option")
                if (value := node.get("value"))
            ]
        )

    def get(self, url: str) -> requests.Response:
        logger.debug("Fetching %s", url)
        suffix = Path(urlparse(url).path).suffix
        if not self.use_cache or not (
            response := get_cache(url, suffix=suffix)
        ):
            response = requests.get(url, timeout=30, verify=False)
            put_cache(url, response, suffix=suffix)
        return response

    def get_bytes(self, url: str) -> bytes:
        return self.get(url).content
