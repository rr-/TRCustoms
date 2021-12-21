import hashlib
import pickle
from pathlib import Path
from typing import Any

from django.conf import settings

DEFAULT_SUFFIX = ".dat"


def get_cache_path(key: Any, suffix=DEFAULT_SUFFIX) -> Path:
    checksum = hashlib.md5(pickle.dumps(key)).hexdigest()
    return (settings.CACHE_DIR / checksum[0:2] / checksum).with_suffix(suffix)


def get_cache(key: Any, suffix=DEFAULT_SUFFIX) -> Any | None:
    path = get_cache_path(key, suffix=suffix)
    if path.exists():
        return pickle.loads(path.read_bytes())
    return None


def put_cache(key: Any, value: Any, suffix=DEFAULT_SUFFIX) -> None:
    path = get_cache_path(key, suffix=suffix)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(pickle.dumps(value))


def file_cache(func):
    def wrapper(*args, **kwargs):
        cache_key = (func.__qualname__, list(args), dict(kwargs))
        if not (result := get_cache(cache_key)):
            result = func(*args, **kwargs)
            put_cache(cache_key, result)
        return result

    return wrapper
