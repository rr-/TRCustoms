from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    paging_enabled = True

    def get_paginated_response(self, data):
        return Response(
            {
                "current_page": self.page.number,
                "last_page": (
                    (self.page.paginator.count + self.page_size - 1)
                    // self.page_size
                ),
                "total_count": self.page.paginator.count,
                "items_on_page": self.page_size,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

    def get_page_size(self, request):
        if not self.paging_enabled:
            return 10000

        return self.page_size
