from collections.abc import Iterable


def max_or_none(source: Iterable[int]) -> int | None:
    source_list = list(source)
    if not source_list:
        return None
    return max(source_list)
