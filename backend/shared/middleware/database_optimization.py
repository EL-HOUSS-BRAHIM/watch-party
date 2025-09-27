"""Database related middleware implementations."""

from __future__ import annotations

import logging
from typing import Callable

from django.conf import settings
from django.core.cache import caches
from django.db import connection
from django.utils.deprecation import MiddlewareMixin

from shared.observability import observability

logger = logging.getLogger('watchparty.database')


class DatabaseConnectionMiddleware:
    """Ensure database connections remain healthy during the request lifecycle."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        connection.close_if_unusable_or_obsolete()
        return response


class CacheOptimizationMiddleware:
    """Expose the default cache on the request object for downstream use."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self.cache = caches['default']

    def __call__(self, request):
        request.cache = self.cache
        observability.record_metric(
            'cache.backend.attached',
            1,
            tags={
                'backend': self.cache.__class__.__name__,
                'path': getattr(request, 'path', 'unknown'),
            },
        )
        return self.get_response(request)


class QueryOptimizationMiddleware(MiddlewareMixin):
    """Log slow queries when query logging is enabled."""

    def __init__(self, get_response: Callable | None = None):  # pragma: no cover - MiddlewareMixin handles call
        super().__init__(get_response)
        self.slow_threshold = getattr(settings, 'SLOW_QUERY_THRESHOLD_MS', 500)
        self.log_queries = getattr(settings, 'ENABLE_QUERY_LOGGING', False) or settings.DEBUG

    def process_response(self, request, response):  # pragma: no cover - exercised via Django middleware hooks
        if not self.log_queries:
            return response

        for query in connection.queries:
            try:
                duration_ms = float(query.get('time', 0)) * 1000
            except (TypeError, ValueError):
                continue

            if duration_ms >= self.slow_threshold:
                logger.warning(
                    "Slow query detected", extra={"sql": query.get('sql', ''), "duration_ms": duration_ms}
                )
                observability.record_event(
                    'database.slow_query',
                    'Slow query detected',
                    severity='warning',
                    tags={
                        'duration_ms': f"{duration_ms:.2f}",
                        'path': getattr(request, 'path', 'unknown'),
                    },
                )
        return response


class QueryCountLimitMiddleware:
    """Warn when a request exceeds the configured query budget."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self.max_queries = getattr(settings, 'MAX_QUERIES_PER_REQUEST', None)

    def __call__(self, request):
        if not self.max_queries:
            return self.get_response(request)

        start_count = len(connection.queries)
        response = self.get_response(request)
        total_queries = len(connection.queries) - start_count

        if total_queries > self.max_queries:
            logger.warning(
                "Query count exceeded budget", extra={"path": request.path, "count": total_queries}
            )
            response.setdefault('X-Query-Count', str(total_queries))
            observability.record_metric(
                'database.query_budget_exceeded',
                total_queries,
                tags={'path': request.path, 'budget': str(self.max_queries)},
            )
            observability.record_event(
                'database.query_budget_exceeded',
                'Query count exceeded budget',
                severity='warning',
                tags={'path': request.path, 'count': str(total_queries)},
            )
        return response


class DatabaseIndexHintMiddleware:
    """Annotate the request to indicate index hinting is available."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request):
        request.supports_index_hints = True
        return self.get_response(request)
