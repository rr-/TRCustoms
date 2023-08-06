from typing import Any

from rest_framework.exceptions import APIException


class CustomAPIException(APIException):
    def __init__(self, detail: Any, code: str) -> None:
        self.code = code
        super().__init__({**detail, "code": code})
