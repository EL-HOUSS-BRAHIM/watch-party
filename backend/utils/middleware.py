"""
Custom middleware for Watch Party Backend
"""

from django.core.cache import cache
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import hashlib
import time


class RateLimitMiddleware(MiddlewareMixin):
    """Rate limiting middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        if self.should_rate_limit(request):
            client_ip = self.get_client_ip(request)
            endpoint = self.get_endpoint(request)
            
            # Get rate limit config for this endpoint
            config = self.get_rate_limit_config(endpoint)
            
            if self.is_rate_limited(client_ip, endpoint, config):
                return JsonResponse({
                    'error': 'Rate limit exceeded. Please try again later.',
                    'retry_after': config['window']
                }, status=429)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    def get_endpoint(self, request):
        """Get endpoint for rate limiting"""
        path = request.path
        if path.startswith('/api/auth/'):
            return 'auth'
        elif path.startswith('/api/videos/') and request.method == 'POST':
            return 'upload'
        else:
            return 'default'
    
    def get_rate_limit_config(self, endpoint):
        """Get rate limit configuration"""
        configs = getattr(settings, 'RATE_LIMIT_CONFIGS', {})
        return configs.get(endpoint, configs.get('default', {
            'requests': 100,
            'window': 3600
        }))
    
    def is_rate_limited(self, client_ip, endpoint, config):
        """Check if client is rate limited"""
        cache_key = f"rate_limit_{hashlib.md5(f'{client_ip}_{endpoint}'.encode()).hexdigest()}"
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= config['requests']:
            return True
        
        cache.set(cache_key, current_requests + 1, config['window'])
        return False
    
    def should_rate_limit(self, request):
        """Determine if request should be rate limited"""
        # Skip rate limiting for certain conditions
        if request.path.startswith('/api/webhooks/'):
            return False
        
        # Skip for premium users (if authenticated)
        if hasattr(request, 'user') and request.user.is_authenticated:
            if getattr(request.user, 'is_premium', False):
                return False
        
        return True


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Security headers middleware"""
    
    def process_response(self, request, response):
        """Add security headers to response"""
        # Basic security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # HSTS header (only in production with HTTPS)
        if getattr(settings, 'SECURE_SSL_REDIRECT', False):
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data: https:; "
            "connect-src 'self' https://api.stripe.com; "
            "frame-src https://js.stripe.com https://hooks.stripe.com; "
            "object-src 'none';"
        )
        response['Content-Security-Policy'] = csp_policy
        
        return response


class CORSMiddleware(MiddlewareMixin):
    """Custom CORS middleware for additional control"""
    
    def process_response(self, request, response):
        """Add CORS headers"""
        # This is handled by django-cors-headers, but we can add custom logic here
        origin = request.META.get('HTTP_ORIGIN')
        
        # Additional CORS logic for WebSocket connections
        if request.path.startswith('/ws/'):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
