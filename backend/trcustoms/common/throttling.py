from rest_framework import throttling


class UnsafeOperationsRateThrottle(throttling.SimpleRateThrottle):
    scope = "unsafe_operations"

    def allow_request(self, request, view):
        if request.method == "GET":
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        # X-Real-IP is set by our nginx to the real peer address and
        # overwrites any client-supplied value, so it cannot be spoofed to
        # dodge the limit. X-Forwarded-For must not be used here: the client
        # controls its left portion, so keying on it lets an attacker mint a
        # fresh bucket per request. Fall back to REMOTE_ADDR when unproxied.
        ident = request.META.get("HTTP_X_REAL_IP") or request.META.get(
            "REMOTE_ADDR"
        )
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }
