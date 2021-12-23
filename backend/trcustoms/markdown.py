from typing import Any

import markdownify


class CustomMarkdownConverter(markdownify.MarkdownConverter):
    convert_u = markdownify.abstract_inline_conversion(lambda self: "__")

    def convert_iframe(self, el, text, convert_as_inline):
        if source := el.attrs.get("src"):
            return f"{source}"
        return ""


def html_to_markdown(html_text: str, **options: Any) -> str:
    return CustomMarkdownConverter(**options).convert(html_text).strip()
