import html
import logging
import re
import tempfile
from collections.abc import Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import IO
from urllib.parse import urljoin

import dateutil.parser
import lxml.html
import requests
import urllib3

from trcustoms.markdown import html_to_markdown

logger = logging.getLogger(__name__)


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]*?>", "", value)


def get_outer_html(node) -> str:
    return lxml.html.tostring(node, encoding=str).strip()


def get_inner_html(node) -> str:
    ret = get_outer_html(node)
    ret = ret.strip()
    ret = re.sub(r"^<[^>]+>|<\/[^>]+>$", "", ret)
    ret = ret.strip()
    return ret


def get_text(node) -> str:
    return html.unescape(strip_tags(get_outer_html(node)).strip())


def unescape(text: str | None) -> str:
    return html.unescape(text or "")


def get_document_from_response(
    response: requests.Response,
) -> lxml.html.HtmlElement:
    return lxml.html.fromstring(response.text.encode())


@dataclass
class TRLELevelWalkthrough:
    level_id: int
    content: str


@dataclass
class TRLEUser:
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


@dataclass
class TRLEReviewer(TRLEUser):
    level_ids: list[int]


@dataclass
class TRLEAuthor(TRLEUser):
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
    level_id: int
    title: str
    synopsis: str | None
    release_date: date | None
    downloads: int
    difficulty: str | None
    duration: str | None
    average_rating: Decimal
    walkthrough: TRLELevelWalkthrough | None
    reviews: list[TRLELevelReview]
    file_type: str
    category: str | None
    download_url: str
    main_image_url: str
    screenshot_urls: list[str]
    author_ids: list[int]
    website_url: str | None
    showcase_urls: list[str]


class TRLEScraper:
    def __init__(self) -> None:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        self.session = requests.Session()

    def fetch_reviewer(self, reviewer_id: int) -> TRLEReviewer | None:
        doc = self.get_document(
            f"https://www.trle.net/sc/reviewerfeatures.php?rid={reviewer_id}",
        )

        level_ids = [
            int(match.group(0))
            for node in doc.cssselect(".medGText a[href*='reviews']")
            if (match := re.search(r"\d+", node.get("href")))
        ]
        image_url = urljoin(
            "https://trle.net/",
            doc.cssselect(".navText img")[0].get("src").replace(" ", "%20"),
        )
        nickname = unescape(doc.cssselect(".subHeader a")[0].text)
        if not nickname:
            return None

        texts = [
            get_text(node)
            for node in doc.cssselect(".bodyText:not([colspan])")
        ]
        attrs = {
            texts[i].rstrip(":"): unescape(texts[i + 1])
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
        doc = self.get_document(
            f"https://trle.net/sc/authorfeatures.php?aid={author_id}",
        )

        level_ids = [
            int(match.group(0))
            for node in doc.cssselect(".medGText a[href*='levelfeatures']")
            if (match := re.search(r"\d+", node.get("href")))
        ]
        image_url = urljoin(
            "https://trle.net/",
            doc.cssselect(".navText img")[0].get("src").replace(" ", "%20"),
        )
        nickname = unescape(doc.cssselect(".subHeader a")[0].text)
        if not nickname:
            return None

        texts = [
            get_text(node)
            for node in doc.cssselect(".bodyText:not([colspan])")
        ]
        attrs = {
            texts[i].rstrip(":"): unescape(texts[i + 1])
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
        doc = self.get_document(
            f"https://trle.net/sc/levelfeatures.php?lid={level_id}"
        )

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
        synopsis = html_to_markdown(
            get_inner_html(doc.cssselect("tr:nth-child(5) .medGText")[0])
        )

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
            texts[i].rstrip(":"): unescape(texts[i + 1])
            for i in range(0, len(texts), 2)
        }

        download_url = f"https://www.trle.net/scadm/trle_dl.php?lid={level_id}"
        website_url = self.get_url_redirect(download_url)
        if website_url is not None and website_url.startswith(
            "https://www.trle.net/sc/levelsfeatures"
        ):
            website_url = None

        showcase_urls: list[str] = []

        def process_yt_links(match):
            if (url := match.group(0)) not in showcase_urls:
                showcase_urls.append(url)
            return ""

        synopsis = re.sub(
            r"https?://(?:www\.)?"
            r"(?:youtube\.com|youtu\.be)/"
            r"(?:v/|/u/\w/|embed/|watch\?)?"
            r"\??(?:v=)?"
            r"([^#&?]*).*",
            process_yt_links,
            synopsis,
        )
        synopsis = synopsis.strip()
        synopsis = re.sub(r"\n\s*\n\s*\n+", "\n\n", synopsis, flags=re.M)

        return TRLELevel(
            level_id=level_id,
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
            walkthrough=self.fetch_level_walkthrough(level_id),
            reviews=list(self.fetch_level_reviews(level_id)),
            file_type=attrs["file type"],
            category=attrs["class"] if attrs["class"] != "nc" else None,
            download_url=download_url,
            main_image_url=main_image_url,
            screenshot_urls=screenshot_urls,
            author_ids=author_ids,
            website_url=website_url,
            showcase_urls=showcase_urls,
        )

    def fetch_level_walkthrough(
        self, level_id: int
    ) -> TRLELevelWalkthrough | None:
        try:
            content = self.get_raw_document(
                f"https://www.trle.net/walk/{level_id}.htm"
            )
        except requests.exceptions.RequestException:
            return None
        return TRLELevelWalkthrough(level_id=level_id, content=content)

    def fetch_level_reviews(self, level_id: int) -> Iterable[TRLELevelReview]:
        doc = self.get_document(
            f"https://trle.net/sc/reviews.php?lid={level_id}"
        )

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

            text = get_inner_html(text_node) if text_node is not None else ""
            text = re.sub(
                re.escape(f'" - <b>{reviewer_name}</b> <small>') + ".*",
                "",
                text,
            )
            text = re.sub(r"<a name[^>]*><\/a>", "", text)
            text = re.sub('^"', "", text)
            # text = " ".join(text.splitlines())
            text = html_to_markdown(text)

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

    def fetch_all_author_ids(self) -> Iterable[int]:
        doc = self.get_document("https://www.trle.net/sc/bGalleryWorld.php")

        country_urls: set[str] = set()
        for node in doc.cssselect("a[href*='bGalleryCountry.php']"):
            country_url = urljoin("https://trle.net/", node.get("href"))
            country_urls.add(country_url)

        for country_url in country_urls:
            doc = self.get_document(country_url)
            for node in doc.cssselect("a[href*='authorfeatures']"):
                if match := re.search(r"\d+", node.get("href")):
                    author_id = int(match.group(0))
                    yield author_id

    def fetch_all_level_ids(self) -> Iterable[int]:
        doc = self.get_document("https://www.trle.net/rPost.php")
        for node in doc.cssselect("[name='lid'] option"):
            if value := node.get("value"):
                level_id = int(value)
                yield level_id

    def fetch_all_reviewer_ids(self) -> Iterable[int]:
        doc = self.get_document("https://www.trle.net/rPost.php")
        for node in doc.cssselect("[name='rid'] option"):
            if value := node.get("value"):
                reviewer_id = int(value)
                yield reviewer_id

    def get_document(self, url: str) -> lxml.html.HtmlElement:
        return get_document_from_response(self._get(url))

    def get_raw_document(self, url: str) -> str:
        return self._get(url).text

    def get_size(self, url) -> int | None:
        response = self._head(url)
        match header := response.headers["Content-Length"]:
            case str(size):
                return int(size)
            case None:
                return None
            case _:
                raise ValueError(f"unknown value: {header}")

    def is_url_download(self, url) -> bool:
        response = self._head(url)
        return response.headers["Content-Type"].startswith("application/")

    def get_url_redirect(self, url) -> str | None:
        response = self._head(url, allow_redirects=False)
        return response.headers.get("Location")

    def _head(
        self,
        url: str,
        allow_redirects: bool = True,
        headers: dict[str, str] | None = None,
    ) -> requests.Response:
        logger.debug("HEAD %s %s", url, headers)
        return self.session.head(
            url,
            timeout=30,
            verify=False,
            allow_redirects=allow_redirects,
            headers=headers,
        )

    def _get(
        self,
        url: str,
        allow_redirects: bool = True,
        headers: dict[str, str] | None = None,
    ) -> requests.Response:
        logger.debug("GET %s %s", url, headers)
        return self.session.get(
            url,
            timeout=30,
            verify=False,
            allow_redirects=allow_redirects,
            headers=headers,
        )

    def get_file(self, url: str, file: IO[bytes]) -> bytes | None:
        if not self.is_url_download(url):
            return None

        chunk_size = 256 * 1024
        file_size = self.get_size(url)
        chunks = list(range(0, file_size, chunk_size))

        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)

            def download_worker(chunk: int) -> Path:
                start = chunk
                end = chunk + chunk_size - 1
                headers = {"Range": f"bytes={start}-{end}"}
                response = self._get(
                    url, allow_redirects=True, headers=headers
                )
                path = tmpdir / f"{chunk}.dat"
                with path.open("wb") as handle:
                    for part in response.iter_content(1024):
                        handle.write(part)
                return path

            with ThreadPoolExecutor(max_workers=8) as executor:
                future_to_chunk = {
                    executor.submit(download_worker, chunk): chunk
                    for chunk in chunks
                }

                chunk_to_path = {}
                for future in as_completed(future_to_chunk):
                    chunk = future_to_chunk[future]
                    path = future.result()
                    chunk_to_path[chunk] = path

            result = b""
            for chunk, path in sorted(
                chunk_to_path.items(), key=lambda kv: kv[0]
            ):
                file.write(path.read_bytes())

        assert file.tell() == file_size
        return result
