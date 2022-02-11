from rest_framework import throttling


class UnsafeOperationsRateThrottle(throttling.SimpleRateThrottle):
    scope = "unsafe_operations"

    def allow_request(self, request, view):
        if request.method == "GET":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": request.headers["X-Real-Ip"],
        }
