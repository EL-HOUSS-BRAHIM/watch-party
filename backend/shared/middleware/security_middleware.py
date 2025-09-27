"""Security focused middleware implementations."""

from __future__ import annotations

import logging
from typing import Callable

from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.http import HttpRequest, HttpResponse

logger = logging.getLogger('watchparty.security')


class EnhancedSecurityMiddleware:
    """Ensure basic security headers are set on every response."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        if isinstance(response, HttpResponse):
            response.setdefault('X-Content-Type-Options', 'nosniff')
            response.setdefault('X-Frame-Options', 'DENY')
            if getattr(settings, 'SECURE_BROWSER_XSS_FILTER', False):
                response.setdefault('X-XSS-Protection', '1; mode=block')
        return response


class AdvancedRateLimitMiddleware:
    """Provide contextual rate limiting metadata for downstream use."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        if getattr(settings, 'ENABLE_RATE_LIMITING', False):
            request.rate_limit_scope = request.META.get('HTTP_X_RATE_LIMIT_SCOPE', 'default')
        return self.get_response(request)


class FileUploadSecurityMiddleware:
    """Block uploads that exceed the configured maximum size."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self.max_upload_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)  # 10MB default

    def __call__(self, request: HttpRequest):
        if request.method in {'POST', 'PUT', 'PATCH'} and request.FILES:
            for upload in request.FILES.values():
                if upload.size > self.max_upload_size:
                    logger.warning('Blocked oversized upload', extra={'name': upload.name, 'size': upload.size})
                    raise SuspiciousOperation('Uploaded file too large')
        return self.get_response(request)


class APIVersioningMiddleware:
    """Attach API version context from the request headers."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response
        self.default_version = getattr(settings, 'API_DEFAULT_VERSION', '1')

    def __call__(self, request: HttpRequest):
        request.api_version = request.META.get('HTTP_X_API_VERSION', self.default_version)
        return self.get_response(request)


class CSRFProtectionMiddleware:
    """Ensure CSRF tokens are present on unsafe requests."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        if request.method in {'POST', 'PUT', 'PATCH', 'DELETE'}:
            if not request.META.get('CSRF_COOKIE_USED', False):
                request.META['CSRF_COOKIE_USED'] = True
        return self.get_response(request)


class SecurityAuditMiddleware:
    """Emit a structured audit log for authenticated requests."""

    def __init__(self, get_response: Callable):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        response = self.get_response(request)
        if request.user.is_authenticated:
            logger.info(
                'Security audit event',
                extra={
                    'user_id': getattr(request.user, 'id', None),
                    'method': request.method,
                    'path': request.path,
                    'status_code': getattr(response, 'status_code', None),
                },
            )
        return response
