from __future__ import annotations

import re
from dataclasses import dataclass
from html import escape
from typing import Callable

from django.conf import settings
from django.http import Http404, HttpRequest, HttpResponse

from trcustoms.community_events.models import Event
from trcustoms.levels.models import Level
from trcustoms.news.models import News
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.models import Walkthrough

BASE_TITLE = "TRCustoms"
BASE_DESCRIPTION = (
    "A website that hosts custom Tomb Raider games created by the Tomb Raider "
    "Level Editor (TRLE). Users can upload levels, review them, and more!"
)
BASE_IMAGE = "/logo.png"
SOCIAL_PREVIEW_HEADER = "HTTP_X_SOCIAL_PREVIEW"


@dataclass(frozen=True)
class SocialPreviewMetadata:
    title: str
    description: str
    image_url: str
    canonical_url: str


def build_social_preview_response(request: HttpRequest) -> HttpResponse:
    if request.META.get(SOCIAL_PREVIEW_HEADER) != "1":
        raise Http404

    metadata = resolve_social_preview_metadata(request.path)
    html = render_social_preview_html(metadata)
    return HttpResponse(html, content_type="text/html; charset=utf-8")


def resolve_social_preview_metadata(path: str) -> SocialPreviewMetadata:
    normalized_path = normalize_path(path)
    for pattern, resolver in ROUTE_RESOLVERS:
        match = pattern(normalized_path)
        if match is not None:
            return resolver(normalized_path, *match)
    return default_metadata(normalized_path)


def render_social_preview_html(metadata: SocialPreviewMetadata) -> str:
    title = escape(metadata.title)
    description = escape(metadata.description)
    image_url = escape(metadata.image_url)
    canonical_url = escape(metadata.canonical_url)

    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{canonical_url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{BASE_TITLE}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{canonical_url}">
    <meta property="og:image" content="{image_url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image_url}">
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      <p><a href="{canonical_url}">Open page</a></p>
    </main>
  </body>
</html>
"""


def level_metadata(path: str, level_id: str) -> SocialPreviewMetadata:
    level = (
        Level.objects.filter(pk=level_id, is_approved=True)
        .prefetch_related("authors")
        .select_related("cover")
        .first()
    )
    if level is None:
        return default_metadata(path)

    author_names = ", ".join(
        level.authors.values_list("username", flat=True)
    ).strip()
    description = (
        f"A custom Tomb Raider level by {author_names}."
        if author_names
        else "A custom Tomb Raider level."
    )
    return SocialPreviewMetadata(
        title=build_title(level.name),
        description=description,
        image_url=absolute_asset_url(
            level.cover.content.url
            if level.cover and level.cover.content
            else BASE_IMAGE
        ),
        canonical_url=absolute_site_url(path),
    )


def user_metadata(path: str, user_id: str) -> SocialPreviewMetadata:
    user = User.objects.filter(pk=user_id, is_active=True).first()
    if user is None:
        return default_metadata(path)

    return SocialPreviewMetadata(
        title=build_title(user.username),
        description=f"Check out {user.username}'s profile page!",
        image_url=absolute_asset_url(
            user.picture.content.url
            if user.picture and user.picture.content
            else "/anonymous.svg"
        ),
        canonical_url=absolute_site_url(path),
    )


def news_metadata(path: str, news_id: str) -> SocialPreviewMetadata:
    news = News.objects.filter(pk=news_id).first()
    if news is None:
        return default_metadata(path)

    return SocialPreviewMetadata(
        title=build_title(news.subject or "News"),
        description="Read the latest news articles.",
        image_url=absolute_asset_url(BASE_IMAGE),
        canonical_url=absolute_site_url(path),
    )


def event_metadata(path: str, event_id: str) -> SocialPreviewMetadata:
    event = (
        Event.objects.filter(pk=event_id).select_related("cover_image").first()
    )
    if event is None:
        return default_metadata(path)

    description = truncate_description(event.subtitle or event.about or "")
    if not description:
        description = "Browse this TRCustoms community event."
    return SocialPreviewMetadata(
        title=build_title(event.name),
        description=description,
        image_url=absolute_asset_url(
            event.cover_image.content.url
            if event.cover_image and event.cover_image.content
            else BASE_IMAGE
        ),
        canonical_url=absolute_site_url(path),
    )


def walkthrough_metadata(
    path: str, walkthrough_id: str
) -> SocialPreviewMetadata:
    walkthrough = (
        Walkthrough.objects.filter(
            pk=walkthrough_id, status=WalkthroughStatus.APPROVED
        )
        .select_related("level__cover", "author")
        .first()
    )
    if walkthrough is None:
        return default_metadata(path)

    author_name = (
        walkthrough.author.username
        if walkthrough.author
        else walkthrough.legacy_author_name or "Unknown"
    )
    return SocialPreviewMetadata(
        title=build_title(f"Walkthrough for {walkthrough.level.name}"),
        description=f"A walkthrough by {author_name}.",
        image_url=absolute_asset_url(
            walkthrough.level.cover.content.url
            if walkthrough.level.cover and walkthrough.level.cover.content
            else BASE_IMAGE
        ),
        canonical_url=absolute_site_url(path),
    )


def static_page_metadata(
    path: str,
    page_title: str,
    description: str | None = None,
    image: str | None = None,
) -> SocialPreviewMetadata:
    return SocialPreviewMetadata(
        title=build_title(page_title),
        description=description or BASE_DESCRIPTION,
        image_url=absolute_asset_url(image or BASE_IMAGE),
        canonical_url=absolute_site_url(path),
    )


def default_metadata(path: str) -> SocialPreviewMetadata:
    return SocialPreviewMetadata(
        title=BASE_TITLE,
        description=BASE_DESCRIPTION,
        image_url=absolute_asset_url(BASE_IMAGE),
        canonical_url=absolute_site_url(path),
    )


def normalize_path(path: str) -> str:
    if not path.startswith("/"):
        path = f"/{path}"
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    return path


def build_title(page_title: str) -> str:
    return f"{BASE_TITLE} - {page_title}" if page_title else BASE_TITLE


def absolute_site_url(path: str) -> str:
    return f"{settings.HOST_SITE}{path}"


def absolute_asset_url(path: str) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return absolute_site_url(path if path.startswith("/") else f"/{path}")


def truncate_description(text: str, limit: int = 200) -> str:
    collapsed = " ".join(text.split())
    if len(collapsed) <= limit:
        return collapsed
    return collapsed[: limit - 1].rstrip() + "..."


def exact_path(match_path: str) -> Callable[[str], tuple[()] | None]:
    def matcher(path: str) -> tuple[()] | None:
        return tuple() if path == match_path else None

    return matcher


def regex_path(pattern: str) -> Callable[[str], tuple[str, ...] | None]:
    compiled = re.compile(pattern)

    def matcher(path: str) -> tuple[str] | None:
        match = compiled.fullmatch(path)
        if match is None:
            return None
        return match.groups()

    return matcher


ROUTE_RESOLVERS: list[
    tuple[
        Callable[[str], tuple[str, ...] | None],
        Callable[..., SocialPreviewMetadata],
    ]
] = [
    (exact_path("/"), default_metadata),
    (
        exact_path("/mod"),
        lambda path: static_page_metadata(
            path,
            "Moderate",
            "A page for managing and monitoring user actions.",
        ),
    ),
    (
        exact_path("/mod/how-to"),
        lambda path: static_page_metadata(path, "Moderating Guidelines"),
    ),
    (
        exact_path("/levels"),
        lambda path: static_page_metadata(
            path,
            "Level search",
            "Search our database for thousands of custom Tomb Raider games.",
        ),
    ),
    (
        exact_path("/tags"),
        lambda path: static_page_metadata(
            path,
            "Level search",
            "Search our database for thousands of custom Tomb Raider games.",
        ),
    ),
    (
        exact_path("/genres"),
        lambda path: static_page_metadata(
            path,
            "Level search",
            "Search our database for thousands of custom Tomb Raider games.",
        ),
    ),
    (
        exact_path("/news"),
        lambda path: static_page_metadata(
            path,
            "News archive",
            "Read the latest news articles.",
        ),
    ),
    (
        exact_path("/reviews"),
        lambda path: static_page_metadata(
            path,
            "Reviews",
            "Read the latest reviews posted for custom Tomb Raider games.",
            "card-reviewer_catalogue.jpg",
        ),
    ),
    (
        exact_path("/reviews/authors"),
        lambda path: static_page_metadata(
            path,
            "Reviewer catalogue",
            "Search for custom level critics.",
            "card-reviewer_catalogue.jpg",
        ),
    ),
    (
        exact_path("/reviews/level_suggestions"),
        lambda path: static_page_metadata(
            path,
            "Less known levels",
            (
                "Find levels that don't have a lot of reviews, there might be "
                "a hidden gem somewhere."
            ),
            "card-least_reviewed_levels.jpg",
        ),
    ),
    (
        exact_path("/extras"),
        lambda path: static_page_metadata(
            path,
            "Treasure vault",
            "Explore the treasure vault.",
            "card-treasure_vault.jpg",
        ),
    ),
    (
        exact_path("/extras/treasure_vault"),
        lambda path: static_page_metadata(
            path,
            "Treasure vault",
            "Explore the treasure vault.",
            "card-treasure_vault.jpg",
        ),
    ),
    (
        exact_path("/extras/treasure_vault/award_recipients"),
        lambda path: static_page_metadata(path, "Award Recipients"),
    ),
    (
        exact_path("/extras/event_catalogue"),
        lambda path: static_page_metadata(
            path,
            "Event catalogue",
            "Browse the event catalogue.",
            "card-event_catalogue.jpg",
        ),
    ),
    (
        exact_path("/extras/user_discovery"),
        lambda path: static_page_metadata(
            path,
            "User discovery",
            "Find users and see their locations around the world.",
            "card-user_discovery.jpg",
        ),
    ),
    (exact_path("/users"), lambda path: static_page_metadata(path, "Users")),
    (exact_path("/login"), lambda path: static_page_metadata(path, "Login")),
    (
        exact_path("/register"),
        lambda path: static_page_metadata(
            path,
            "Register",
            (
                "Sign up as a user on our website to be able to upload "
                "levels, post reviews, and more!"
            ),
        ),
    ),
    (
        exact_path("/password-reset"),
        lambda path: static_page_metadata(
            path,
            "Password Reset",
            "Forgot your password? Reset it here!",
        ),
    ),
    (
        exact_path("/settings"),
        lambda path: static_page_metadata(
            path,
            "Settings",
            "Manage the website's settings to your personal preference.",
        ),
    ),
    (
        exact_path("/text-formatting-guide"),
        lambda path: static_page_metadata(path, "Text formatting guide"),
    ),
    (
        exact_path("/about"),
        lambda path: static_page_metadata(
            path,
            "About",
            (
                "TRCustoms.org is a website that hosts custom Tomb Raider "
                "games created by the Tomb Raider Level Editor."
            ),
        ),
    ),
    (
        exact_path("/about/terms"),
        lambda path: static_page_metadata(path, "Terms and Conditions"),
    ),
    (
        regex_path(
            (
                r"/levels/(\d+)"
                r"(?:/"
                r"(?:ratings|rating|reviews|review|"
                r"walkthroughs|walkthrough|edit)"
                r"(?:/[^/]+(?:/edit)?)?"
                r")?"
            )
        ),
        level_metadata,
    ),
    (
        regex_path(r"/walkthroughs/(\d+)(?:/edit)?"),
        walkthrough_metadata,
    ),
    (
        regex_path(r"/news/(\d+)(?:/edit)?"),
        news_metadata,
    ),
    (
        regex_path(r"/extras/event/(\d+)"),
        event_metadata,
    ),
    (
        regex_path(
            (
                r"/users/(\d+)"
                r"(?:/"
                r"(?:playlist|authored_levels|reviews|ratings|"
                r"walkthroughs|edit)"
                r")?"
            )
        ),
        user_metadata,
    ),
]
