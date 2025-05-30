import csv
import io
import time
from datetime import datetime

import requests
from django.contrib import messages
from django.core.files.base import ContentFile

from trcustoms.community_events.models import Event, Winner
from trcustoms.levels.models import Level
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User

MAX_FETCH_ATTEMPTS = 3
USER_AGENT = "trcustoms-csv-importer/1.0"


def import_events_from_string(data: str, request) -> int:
    """
    Import events from a tab-delimited CSV string.
    Reports warnings and errors via django.contrib.messages on the request.
    Returns the number of events processed (created or updated).
    """
    reader = csv.DictReader(io.StringIO(data), delimiter="\t")
    imported = 0
    for row in reader:
        if not _has_name(row):
            continue
        _process_row(row, request)
        imported += 1
    return imported


def _has_name(row: dict) -> bool:
    return bool(row.get("Name", "").strip())


def _process_row(row: dict, request) -> bool:
    name = row.get("Name", "").strip()
    subtitle = row.get("Subtitle", "").strip() or None
    year_str = row.get("Year", "").strip()
    year = int(year_str) if year_str else None
    about = row.get("About", "").strip() or None
    collection_release = _parse_collection_release(row, request, name)
    if not collection_release:
        return False
    host = _get_host(row, request, name)
    event, created = Event.objects.update_or_create(
        name=name,
        year=year,
        defaults={
            "subtitle": subtitle,
            "about": about,
            "collection_release": collection_release,
            "host": host,
        },
    )
    if not created:
        event.levels.clear()
        event.winners.all().delete()
    _add_levels(row, request, event, name)
    _add_winners(row, request, event, name)
    _fetch_cover_image(row, request, event, name)
    return created


def _parse_collection_release(row: dict, request, name: str):
    date_str = row.get("Collection R Date", "").strip()
    time_str = row.get("Collection R Time", "").strip()
    if date_str and time_str:
        try:
            return datetime.strptime(
                f"{date_str} {time_str}", "%d/%m/%Y %H:%M:%S"
            )
        except ValueError:
            messages.warning(
                request,
                f"Invalid date/time for event '{name}': "
                f"{date_str} {time_str}. Skipping.",
            )
    else:
        messages.warning(
            request,
            f"Missing date/time for event '{name}'. Skipping.",
        )
    return None


def _get_host(row: dict, request, name: str) -> User | None:
    host_id = row.get("Host", "").strip()
    if not host_id:
        return None
    try:
        return User.objects.get(pk=int(host_id))
    except (ValueError, User.DoesNotExist):
        messages.warning(
            request,
            f"Host user id {host_id} not found for event '{name}'. "
            "Using blank host.",
        )
        return None


def _fetch_cover_image(row: dict, request, event: Event, name: str):
    url = row.get("IMG URL", "").strip()
    if not url:
        return
    headers = {"User-Agent": USER_AGENT}
    for attempt in range(1, MAX_FETCH_ATTEMPTS + 1):
        try:
            response = requests.get(
                url, timeout=10, headers=headers, verify=False
            )
            response.raise_for_status()
        except requests.RequestException:
            if attempt == MAX_FETCH_ATTEMPTS:
                messages.warning(
                    request,
                    f"Could not fetch cover URL for event '{name}': {url}. "
                    "Skipping cover image.",
                )
                return
            time.sleep(1)
        else:
            break
    content = response.content
    filename = url.split("/")[-1] or f"{name}_cover"
    cf = ContentFile(content, name=filename)
    upload = UploadedFile(
        uploader=request.user,
        upload_type=UploadType.EVENT_COVER,
        size=len(content),
    )
    upload.content.save(filename, cf)
    upload.save()
    event.cover_image = upload
    event.save(update_fields=["cover_image"])


def _add_levels(row: dict, request, event: Event, name: str):
    levels_str = row.get("Levels", "").strip()
    if not levels_str:
        return
    level_ids = [lid.strip() for lid in levels_str.split(",") if lid.strip()]
    for lid in level_ids:
        try:
            level = Level.objects.get(pk=int(lid))
            event.levels.add(level)
        except (ValueError, Level.DoesNotExist):
            messages.warning(
                request,
                f"Level id {lid} not found for event '{name}'. "
                "Skipping level.",
            )


def _add_winners(row: dict, request, event: Event, name: str):
    places_str = row.get("Win Places", "").strip()
    users_str = row.get("Win Users", "").strip()
    if not (places_str and users_str):
        return
    place_list = [p.strip() for p in places_str.split(",") if p.strip()]
    user_list = [u.strip() for u in users_str.split(",") if u.strip()]
    for place, user_id in zip(place_list, user_list):
        try:
            user = User.objects.get(pk=int(user_id))
            Winner.objects.create(event=event, place=int(place), user=user)
        except (ValueError, User.DoesNotExist):
            messages.warning(
                request,
                f"Winner user id {user_id} not found for event '{name}'. "
                "Skipping winner.",
            )
