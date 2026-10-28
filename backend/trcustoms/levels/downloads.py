from datetime import timedelta

from django.core import signing

DOWNLOAD_TOKEN_SALT = "level-file-download"
DOWNLOAD_TOKEN_MAX_AGE = timedelta(days=1)


def sign_level_file_download(file_id: int) -> str:
    return signing.TimestampSigner(salt=DOWNLOAD_TOKEN_SALT).sign(str(file_id))


def is_level_file_download_token_valid(file_id: int, token: str) -> bool:
    try:
        value = signing.TimestampSigner(salt=DOWNLOAD_TOKEN_SALT).unsign(
            token, max_age=DOWNLOAD_TOKEN_MAX_AGE
        )
    except signing.BadSignature:
        return False
    return value == str(file_id)
