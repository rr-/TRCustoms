from typing import Any

from rest_framework import status
from rest_framework.exceptions import APIException


class CustomAPIException(APIException):
    def __init__(
        self,
        detail: Any,
        code: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
    ) -> None:
        self.status_code = status_code
        self.code = code
        super().__init__({**detail, "code": code})
