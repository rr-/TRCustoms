import hashlib
import pickle
from pathlib import Path
from typing import Any

from django.conf import settings


def get_cache_path(key: Any) -> Path:
    checksum = hashlib.md5(pickle.dumps(key)).hexdigest()
    return settings.CACHE_DIR / checksum[0:2] / checksum


def get_cache(key: Any) -> Any | None:
    path = get_cache_path(key)
    if path.exists():
        return pickle.loads(path.read_bytes())
    return None


def put_cache(key: Any, value: Any) -> None:
    path = get_cache_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(pickle.dumps(value))


def delete_cache(key: Any) -> None:
    path = get_cache_path(key)
    if path.exists():
        path.unlink()


def file_cache(*key: str):
    def outer(func):
        def inner(*args, **kwargs):
            cache_key = (list(key), list(args), dict(kwargs))
            if not (result := get_cache(cache_key)):
                result = func(*args, **kwargs)
                put_cache(cache_key, result)
            return result

        inner.delete_cache = delete_cache
        return inner

    return outer
