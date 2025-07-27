"""
Performance monitoring middleware for API endpoints
"""

import time
import logging
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger('watchparty.performance')


class APIPerformanceMiddleware(MiddlewareMixin):
    """
    Middleware to monitor API performance and implement caching strategies
    """
    
    # Cache configuration for different endpoint types
    CACHE_CONFIGS = {
        '/api/store/items/': {'timeout': 300, 'cache_key': 'store_items'},  # 5 minutes
        '/api/search/discover/': {'timeout': 600, 'cache_key': 'discover_content'},  # 10 minutes
        '/api/analytics/platform-overview/': {'timeout': 120, 'cache_key': 'platform_overview'},  # 2 minutes
        '/api/support/faqs/': {'timeout': 3600, 'cache_key': 'faqs_list'},  # 1 hour
        '/api/users/leaderboard/': {'timeout': 300, 'cache_key': 'leaderboard'},  # 5 minutes
    }
    
    def process_request(self, request):
        """Start performance timing"""
        request._performance_start_time = time.time()
        
        # Check for cached responses for GET requests
        if request.method == 'GET' and hasattr(settings, 'USE_CACHE') and settings.USE_CACHE:
            cache_config = self.get_cache_config(request.path)
            if cache_config:
                cache_key = f"{cache_config['cache_key']}_{request.GET.urlencode()}"
                cached_response = cache.get(cache_key)
                if cached_response:
                    logger.info(f"Cache hit for {request.path}")
                    return JsonResponse(cached_response)
        
        return None
    
    def process_response(self, request, response):
        """Log performance metrics and cache responses"""
        if hasattr(request, '_performance_start_time'):
            duration = time.time() - request._performance_start_time
            
            # Log slow requests
            if duration > 1.0:  # Log requests taking more than 1 second
                logger.warning(
                    f"Slow request: {request.method} {request.path} took {duration:.2f}s"
                )
            
            # Log performance metrics
            logger.info(
                f"API Performance: {request.method} {request.path} "
                f"- {duration:.3f}s - Status: {response.status_code}"
            )
            
            # Cache successful GET responses
            if (request.method == 'GET' and 
                response.status_code == 200 and 
                hasattr(settings, 'USE_CACHE') and settings.USE_CACHE):
                
                cache_config = self.get_cache_config(request.path)
                if cache_config and hasattr(response, 'data'):
                    cache_key = f"{cache_config['cache_key']}_{request.GET.urlencode()}"
                    cache.set(cache_key, response.data, cache_config['timeout'])
            
            # Add performance header
            response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
    
    def get_cache_config(self, path):
        """Get cache configuration for a given path"""
        for endpoint, config in self.CACHE_CONFIGS.items():
            if path.startswith(endpoint):
                return config
        return None


class APIRateLimitingMiddleware(MiddlewareMixin):
    """
    Enhanced rate limiting middleware with different limits per endpoint type
    """
    
    RATE_LIMITS = {
        'default': {'requests': 100, 'window': 60},  # 100 requests per minute
        'auth': {'requests': 5, 'window': 60},       # 5 auth requests per minute
        'upload': {'requests': 10, 'window': 60},    # 10 uploads per minute
        'search': {'requests': 30, 'window': 60},    # 30 searches per minute
        'messaging': {'requests': 50, 'window': 60}, # 50 messages per minute
    }
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_rate_limit_key(self, request):
        """Determine rate limit category based on endpoint"""
        path = request.path
        
        if '/api/auth/' in path:
            return 'auth'
        elif '/api/videos/' in path and request.method == 'POST':
            return 'upload'
        elif '/api/search/' in path:
            return 'search'
        elif '/api/messaging/' in path:
            return 'messaging'
        else:
            return 'default'
    
    def process_request(self, request):
        """Check rate limits"""
        if not hasattr(settings, 'ENABLE_RATE_LIMITING') or not settings.ENABLE_RATE_LIMITING:
            return None
        
        client_ip = self.get_client_ip(request)
        rate_limit_key = self.get_rate_limit_key(request)
        rate_config = self.RATE_LIMITS[rate_limit_key]
        
        cache_key = f"rate_limit_{rate_limit_key}_{client_ip}"
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= rate_config['requests']:
            logger.warning(f"Rate limit exceeded for {client_ip} on {request.path}")
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'limit': rate_config['requests'],
                'window': rate_config['window']
            }, status=429)
        
        # Increment counter
        cache.set(cache_key, current_requests + 1, rate_config['window'])
        
        return None
