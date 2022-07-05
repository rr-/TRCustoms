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
