"""A minimal in-memory stand-in for the S3 client used by presigned uploads."""

import hashlib
import re

from botocore.exceptions import ClientError

RANGE_RE = re.compile(r"bytes=(?P<start>\d+)-(?P<end>\d+)")


class FakeBody:
    def __init__(self, data: bytes) -> None:
        self.data = data

    def __enter__(self) -> "FakeBody":
        return self

    def __exit__(self, *args) -> None:
        pass

    def read(self, size: int | None = None) -> bytes:
        return self.data if size is None else self.data[:size]

    def iter_chunks(self, chunk_size: int = 4096):
        for start in range(0, len(self.data), chunk_size):
            yield self.data[start : start + chunk_size]


class FakeS3Client:
    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    def generate_presigned_url(self, ClientMethod, ExpiresIn, Params) -> str:
        return f"https://bucket.example/{Params['Key']}?signed=1"

    def _get(self, key: str) -> bytes:
        if key not in self.objects:
            raise ClientError(
                {"Error": {"Code": "404", "Message": "Not Found"}},
                "HeadObject",
            )
        return self.objects[key]

    def head_object(self, Bucket, Key) -> dict:
        data = self._get(Key)
        return {
            "ContentLength": len(data),
            "ETag": f'"{hashlib.md5(data).hexdigest()}"',
        }

    def get_object(self, Bucket, Key, Range=None) -> dict:
        data = self._get(Key)
        if Range and (match := RANGE_RE.match(Range)):
            start = int(match.group("start"))
            data = data[start : int(match.group("end")) + 1]
        return {"Body": FakeBody(data)}

    def delete_object(self, Bucket, Key) -> dict:
        self.objects.pop(Key, None)
        return {}
