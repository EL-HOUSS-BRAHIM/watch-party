"""Additional utility middleware for logging and user activity."""

from __future__ import annotations

import logging
import time
from typing import Callable

from django.http import HttpRequest, HttpResponse

from shared.observability import observability

logger = logging.getLogger('watchparty.middleware')


class RequestLoggingMiddleware:
    """Log incoming requests with minimal metadata."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        logger.debug('Request received', extra={'method': request.method, 'path': request.path})

        with observability.span(
            'http.request',
            tags={'method': request.method, 'path': request.path},
        ) as span:
            response = self.get_response(request)
            if isinstance(response, HttpResponse):
                span.add_tag('status_code', response.status_code)
                if response.status_code >= 500:
                    span.set_status('error')
            return response


class SecurityHeadersMiddleware:
    """Ensure permissive security headers exist when not already set."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        if isinstance(response, HttpResponse):
            response.setdefault('Referrer-Policy', 'same-origin')
            response.setdefault('Permissions-Policy', 'geolocation=(self)')
        return response


class UserActivityMiddleware:
    """Attach the timestamp of the current request to the user object."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        if request.user.is_authenticated:
            setattr(request.user, 'last_request_at', time.time())
        return self.get_response(request)


class ErrorHandlingMiddleware:
    """Convert unexpected exceptions to a generic 500 response while logging the error."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        try:
            return self.get_response(request)
        except Exception:  # pragma: no cover - defensive fallback
            logger.exception('Unhandled error in request middleware', extra={'path': request.path})
            response = HttpResponse('Internal server error', status=500)
            return response


class MaintenanceMiddleware:
    """Short-circuit requests when maintenance mode is enabled."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        if getattr(request, 'maintenance_mode', False):
            return HttpResponse('Service temporarily unavailable', status=503)
        return self.get_response(request)


class APIVersionMiddleware:
    """Expose the resolved API version via a response header."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        if isinstance(response, HttpResponse):
            version = getattr(request, 'api_version', None)
            if version:
                response.setdefault('X-API-Version', str(version))
        return response


class ContentTypeMiddleware:
    """Ensure JSON content responses advertise their charset."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        if isinstance(response, HttpResponse):
            content_type = response.get('Content-Type', '')
            if content_type.startswith('application/json') and 'charset' not in content_type:
                response['Content-Type'] = f'{content_type}; charset=utf-8'
        return response
