"""Performance and rate limiting middleware."""

from __future__ import annotations

import gzip
import logging
import time
from typing import Callable

from django.conf import settings
from django.http import HttpResponse
from django.utils.cache import patch_vary_headers

from shared.observability import observability

logger = logging.getLogger('watchparty.performance')


class ResponseCompressionMiddleware:
    """Gzip compress eligible responses for clients that support it."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if not isinstance(response, HttpResponse):
            return response

        if response.streaming or response.has_header('Content-Encoding'):
            return response

        accept_encoding = request.META.get('HTTP_ACCEPT_ENCODING', '')
        if 'gzip' not in accept_encoding.lower():
            return response

        content = response.content
        if len(content) < 500:  # Small responses gain little from compression
            return response

        compressed_content = gzip.compress(content)
        response.content = compressed_content
        response['Content-Encoding'] = 'gzip'
        response['Content-Length'] = str(len(compressed_content))
        patch_vary_headers(response, ('Accept-Encoding',))
        observability.record_event(
            "http.response.compressed",
            "Compressed response payload",
            tags={
                "path": request.path,
                "original_bytes": len(content),
                "compressed_bytes": len(compressed_content),
            },
        )
        return response


class RateLimitMiddleware:
    """Attach rate limit context to the request for downstream views."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        request.rate_limit_enabled = getattr(settings, 'ENABLE_RATE_LIMITING', False)
        return self.get_response(request)


class APIPerformanceMiddleware:
    """Measure request processing time and expose it via a response header."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start_time) * 1000

        if isinstance(response, HttpResponse):
            response.setdefault('X-Response-Time-ms', f"{duration_ms:.2f}")
            status_code = response.status_code
        else:
            status_code = getattr(response, 'status_code', 0)

        observability.record_metric(
            "http.response_time_ms",
            duration_ms,
            tags={
                'path': request.path,
                'method': request.method,
                'status': str(status_code),
            },
        )

        slow_threshold = getattr(settings, 'SLOW_REQUEST_WARNING_MS', 1500)
        if duration_ms > slow_threshold:
            observability.record_event(
                "http.request.slow",
                f"Slow request detected: {request.path}",
                severity="warning",
                tags={
                    'path': request.path,
                    'method': request.method,
                    'duration_ms': f"{duration_ms:.2f}",
                    'threshold_ms': str(slow_threshold),
                },
            )

        logger.debug('Request processed', extra={'path': request.path, 'duration_ms': duration_ms})
        return response
