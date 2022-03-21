import pytest
from django.core.exceptions import ValidationError

from trcustoms.users.validators import UsernameValidator


@pytest.mark.parametrize(
    "source,expected",
    [
        ("a1", True),
        ("11", True),
        ("aa", True),
        ("1A", True),
        ("A!", True),
        ("1!", True),
        ("@$", False),
        ("!-", False),
        ("@@", False),
        ("🥶", False),
    ],
)
def test_username_validator(source: str, expected: bool) -> None:
    validator = UsernameValidator()
    if expected:
        validator(source)
    else:
        with pytest.raises(ValidationError):
            validator(source)
