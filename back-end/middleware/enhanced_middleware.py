"""
Enhanced middleware for Watch Party Backend
Comprehensive middleware for security, monitoring, and performance
"""

import json
import time
import logging
import uuid
from datetime import datetime, timedelta
from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import connection
import hashlib
import re


User = get_user_model()
logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


def create_cache_key(*args, prefix='watchparty'):
    """Create a standardized cache key"""
    key_parts = [str(prefix)] + [str(arg) for arg in args]
    return ':'.join(key_parts)


def clean_sensitive_data(data):
    """Remove sensitive information from logs"""
    sensitive_fields = ['password', 'token', 'secret', 'key', 'authorization', 'csrf', 'session']
    cleaned = {}
    
    if not isinstance(data, dict):
        return data
    
    for key, value in data.items():
        if any(sensitive in key.lower() for sensitive in sensitive_fields):
            cleaned[key] = '[REDACTED]'
        elif isinstance(value, dict):
            cleaned[key] = clean_sensitive_data(value)
        elif isinstance(value, (list, tuple)) and value and isinstance(value[0], dict):
            cleaned[key] = [clean_sensitive_data(item) if isinstance(item, dict) else item for item in value]
        else:
            cleaned[key] = value
    return cleaned


class RequestLoggingMiddleware(MiddlewareMixin):
    """Enhanced request/response logging middleware"""
    
    def process_request(self, request):
        # Generate request ID for tracing
        request.id = str(uuid.uuid4())
        request.start_time = time.time()
        
        # Log request details
        try:
            request_data = clean_sensitive_data(request.POST.dict() if hasattr(request, 'POST') else {})
            
            log_data = {
                'request_id': request.id,
                'method': request.method,
                'path': request.path,
                'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'ip_address': get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'data': request_data,
                'timestamp': timezone.now().isoformat()
            }
            
            logger.info(f"REQUEST: {json.dumps(log_data)}")
            
        except Exception as e:
            logger.error(f"Failed to log request: {str(e)}")
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log response details
            try:
                log_data = {
                    'request_id': getattr(request, 'id', 'unknown'),
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'response_time_ms': round(duration * 1000, 2),
                    'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                    'timestamp': timezone.now().isoformat()
                }
                
                if response.status_code >= 400:
                    logger.warning(f"RESPONSE_ERROR: {json.dumps(log_data)}")
                else:
                    logger.info(f"RESPONSE: {json.dumps(log_data)}")
                    
            except Exception as e:
                logger.error(f"Failed to log response: {str(e)}")
            
            # Add request ID to response headers
            response['X-Request-ID'] = getattr(request, 'id', 'unknown')
        
        return response


class EnhancedRateLimitMiddleware(MiddlewareMixin):
    """Sophisticated rate limiting middleware with different limits for different endpoints"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
        
        # Rate limit configurations: (requests, window_seconds, burst_limit)
        self.rate_limits = {
            # Authentication endpoints
            '/api/auth/login/': {'requests': 5, 'window': 300, 'burst': 10},
            '/api/auth/register/': {'requests': 3, 'window': 3600, 'burst': 5},
            '/api/auth/forgot-password/': {'requests': 3, 'window': 3600, 'burst': 5},
            
            # Upload endpoints
            '/api/videos/upload/': {'requests': 10, 'window': 3600, 'burst': 20},
            
            # Party creation
            '/api/parties/create/': {'requests': 20, 'window': 3600, 'burst': 30},
            
            # Chat endpoints
            '/api/chat/': {'requests': 100, 'window': 60, 'burst': 150},
            
            # Default limit
            'default': {'requests': 100, 'window': 3600, 'burst': 200}
        }
    
    def process_request(self, request):
        if self.should_rate_limit(request):
            client_ip = get_client_ip(request)
            endpoint = request.path
            
            # Get rate limit config for this endpoint
            limit_config = self.get_rate_limit_config(endpoint)
            
            if self.is_rate_limited(client_ip, endpoint, limit_config, request.user):
                return JsonResponse({
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Try again in {limit_config["window"]} seconds.',
                    'retry_after': limit_config['window'],
                    'error_code': 'RATE_LIMITED'
                }, status=429)
    
    def get_rate_limit_config(self, endpoint):
        """Get rate limit configuration for endpoint"""
        # Check for exact match
        if endpoint in self.rate_limits:
            return self.rate_limits[endpoint]
        
        # Check for pattern matches
        for pattern, config in self.rate_limits.items():
            if pattern != 'default' and pattern in endpoint:
                return config
        
        # Return default
        return self.rate_limits['default']
    
    def is_rate_limited(self, client_ip, endpoint, config, user=None):
        """Check if request should be rate limited"""
        # Create different cache keys for authenticated vs anonymous users
        if user and user.is_authenticated:
            cache_key = create_cache_key('rate_limit', f'user_{user.id}', endpoint)
            # Premium users get higher limits
            if hasattr(user, 'is_premium') and user.is_premium:
                config = {
                    'requests': config['requests'] * 2,
                    'window': config['window'],
                    'burst': config.get('burst', config['requests']) * 2
                }
        else:
            cache_key = create_cache_key('rate_limit', f'ip_{client_ip}', endpoint)
        
        current_requests = cache.get(cache_key, 0)
        burst_limit = config.get('burst', config['requests'])
        
        # Check burst limit first
        if current_requests >= burst_limit:
            return True
        
        # Increment counter
        cache.set(cache_key, current_requests + 1, config['window'])
        return False
    
    def should_rate_limit(self, request):
        """Determine if request should be rate limited"""
        # Skip rate limiting for certain conditions
        if request.path.startswith('/api/webhooks/'):
            return False
        
        if request.user.is_authenticated and request.user.is_staff:
            return False
        
        return True


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Enhanced security headers middleware"""
    
    def process_response(self, request, response):
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Add HSTS header in production
        if not settings.DEBUG and request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Enhanced Content Security Policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' wss: https://api.stripe.com",
            "frame-src 'self' https://js.stripe.com https://www.youtube.com https://drive.google.com",
            "media-src 'self' blob: https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response['Content-Security-Policy'] = "; ".join(csp_directives)
        
        return response


class UserActivityMiddleware(MiddlewareMixin):
    """Enhanced middleware for tracking user activity and online status"""
    
    def process_request(self, request):
        if request.user.is_authenticated:
            self.update_user_activity(request.user, request)
    
    def update_user_activity(self, user, request):
        """Update user last activity and online status"""
        try:
            # Update last activity in cache (more efficient than DB)
            cache_key = create_cache_key('user_activity', user.id)
            activity_data = {
                'last_activity': timezone.now().isoformat(),
                'ip_address': get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'path': request.path
            }
            cache.set(cache_key, activity_data, 900)  # 15 minutes
            
            # Update online status
            online_key = create_cache_key('user_online', user.id)
            cache.set(online_key, True, 600)  # 10 minutes
            
            # Update last seen for WebSocket presence
            if hasattr(user, 'update_last_seen'):
                user.update_last_seen()
                
        except Exception as e:
            logger.error(f"Failed to update user activity: {str(e)}")


class PerformanceMiddleware(MiddlewareMixin):
    """Enhanced performance monitoring middleware"""
    
    def process_request(self, request):
        request.start_time = time.time()
        request.start_queries = len(connection.queries)
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            query_count = len(connection.queries) - getattr(request, 'start_queries', 0)
            
            # Log slow requests
            if duration > 1.0:  # Log requests taking more than 1 second
                logger.warning(f"SLOW_REQUEST: {request.path} took {duration:.2f}s with {query_count} queries")
            
            # Add performance headers in debug mode
            if settings.DEBUG:
                response['X-Response-Time'] = f"{duration:.3f}s"
                response['X-Query-Count'] = str(query_count)
            
            # Store performance metrics for monitoring
            self.store_performance_metrics(request, duration, query_count)
        
        return response
    
    def store_performance_metrics(self, request, response_time, query_count):
        """Store performance metrics for monitoring"""
        try:
            # Store in cache for real-time monitoring
            metrics_key = f"perf_metrics:{datetime.now().strftime('%Y%m%d%H%M')}"
            current_metrics = cache.get(metrics_key, {
                'requests': 0,
                'total_time': 0,
                'total_queries': 0,
                'slow_requests': 0
            })
            
            current_metrics['requests'] += 1
            current_metrics['total_time'] += response_time
            current_metrics['total_queries'] += query_count
            
            if response_time > 1.0:
                current_metrics['slow_requests'] += 1
            
            cache.set(metrics_key, current_metrics, 3600)  # 1 hour
            
        except Exception as e:
            logger.error(f"Failed to store performance metrics: {str(e)}")


class ErrorHandlingMiddleware(MiddlewareMixin):
    """Centralized error handling middleware"""
    
    def process_exception(self, request, exception):
        """Handle uncaught exceptions"""
        try:
            # Log the exception
            logger.error(f"UNHANDLED_EXCEPTION: {str(exception)}", extra={
                'request_id': getattr(request, 'id', 'unknown'),
                'path': request.path,
                'method': request.method,
                'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'ip_address': get_client_ip(request),
                'exception_type': type(exception).__name__
            }, exc_info=True)
            
            # Return JSON error response for API endpoints
            if request.path.startswith('/api/'):
                error_detail = str(exception) if settings.DEBUG else "An internal server error occurred"
                
                return JsonResponse({
                    'success': False,
                    'error': 'Internal Server Error',
                    'message': error_detail,
                    'error_code': 'INTERNAL_SERVER_ERROR',
                    'request_id': getattr(request, 'id', 'unknown')
                }, status=500)
            
        except Exception as e:
            logger.error(f"Error in error handling middleware: {str(e)}")
        
        # Let Django handle the exception normally
        return None


class MaintenanceMiddleware(MiddlewareMixin):
    """Enhanced maintenance mode middleware"""
    
    def process_request(self, request):
        # Check if maintenance mode is enabled
        maintenance_mode = cache.get('maintenance_mode', False)
        
        if maintenance_mode:
            # Allow admin access
            if hasattr(request, 'user') and request.user.is_authenticated and request.user.is_staff:
                return None  # Allow staff users
            
            # Allow health check endpoints
            allowed_paths = ['/health/', '/api/health/', '/api/status/', '/admin/']
            if any(request.path.startswith(path) for path in allowed_paths):
                return None  # Allow health checks
            
            return JsonResponse({
                'success': False,
                'error': 'Service Temporarily Unavailable',
                'message': 'The service is currently under maintenance. Please try again later.',
                'error_code': 'MAINTENANCE_MODE'
            }, status=503)


class APIVersionMiddleware(MiddlewareMixin):
    """Enhanced API versioning middleware"""
    
    def process_request(self, request):
        # Extract API version from header or URL
        version = request.META.get('HTTP_API_VERSION', '1.0')
        request.api_version = version
        
        # Validate API version
        supported_versions = ['1.0', '1.1', '2.0']
        if version not in supported_versions and request.path.startswith('/api/'):
            return JsonResponse({
                'success': False,
                'error': 'Unsupported API Version',
                'message': f'API version {version} is not supported',
                'supported_versions': supported_versions,
                'error_code': 'UNSUPPORTED_API_VERSION'
            }, status=400)
    
    def process_response(self, request, response):
        # Add version to response headers
        if hasattr(request, 'api_version'):
            response['API-Version'] = request.api_version
        return response


class ContentTypeMiddleware(MiddlewareMixin):
    """Enhanced content type validation middleware"""
    
    REQUIRED_JSON_PATHS = ['/api/auth/', '/api/users/', '/api/videos/', '/api/parties/']
    
    def process_request(self, request):
        # Only validate content type for POST, PUT, PATCH requests
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_type = request.META.get('CONTENT_TYPE', '')
            
            # Skip validation for multipart forms (file uploads)
            if content_type.startswith('multipart/form-data'):
                return None
            
            # Check if this path requires JSON
            if any(path in request.path for path in self.REQUIRED_JSON_PATHS):
                # Allow multipart for file uploads
                if 'upload' in request.path.lower():
                    return None
                elif not content_type.startswith('application/json'):
                    return JsonResponse({
                        'success': False,
                        'error': 'Invalid Content Type',
                        'message': 'Content-Type must be application/json',
                        'error_code': 'INVALID_CONTENT_TYPE'
                    }, status=400)


class CorsMiddleware(MiddlewareMixin):
    """Enhanced CORS middleware"""
    
    def process_response(self, request, response):
        origin = request.META.get('HTTP_ORIGIN')
        
        # Get allowed origins from settings
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        
        if origin in allowed_origins or (settings.DEBUG and origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = (
                'Accept, Authorization, Content-Type, X-CSRF-Token, X-Requested-With, X-API-Version'
            )
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
        
        return response
