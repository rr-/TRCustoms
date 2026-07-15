from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    disable_paging = False
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return Response(
            {
                "current_page": self.page.number,
                "last_page": (
                    (
                        self.page.paginator.count
                        + self.page.paginator.per_page
                        - 1
                    )
                    // self.page.paginator.per_page
                ),
                "total_count": self.page.paginator.count,
                "items_on_page": self.page.paginator.per_page,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
                "disable_paging": self.disable_paging,
            }
        )

    def get_paginated_response_schema(self, schema):
        # Describe the shape returned by get_paginated_response above so the
        # generated OpenAPI client types match the real response.
        return {
            "type": "object",
            "required": [
                "current_page",
                "last_page",
                "total_count",
                "items_on_page",
                "results",
                "disable_paging",
            ],
            "properties": {
                "current_page": {"type": "integer"},
                "last_page": {"type": "integer"},
                "total_count": {"type": "integer"},
                "items_on_page": {"type": "integer"},
                "next": {"type": "string", "format": "uri", "nullable": True},
                "previous": {
                    "type": "string",
                    "format": "uri",
                    "nullable": True,
                },
                "results": schema,
                "disable_paging": {"type": "boolean"},
            },
        }

    def get_page_size(self, request):
        if request.query_params.get("disable_paging"):
            self.disable_paging = True

        if self.page_size_query_param:
            try:
                return pagination._positive_int(
                    request.query_params[self.page_size_query_param],
                    strict=True,
                    cutoff=self.max_page_size,
                )
            except (KeyError, ValueError):
                pass

        if self.disable_paging:
            return 10000

        return self.page_size
