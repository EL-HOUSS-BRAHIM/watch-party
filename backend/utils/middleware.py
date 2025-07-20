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
    """Advanced rate limiting middleware with tiered protection"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        if self.should_rate_limit(request):
            client_ip = self.get_client_ip(request)
            user_id = self.get_user_id(request)
            endpoint = self.get_endpoint(request)
            
            # Check multiple rate limit tiers
            rate_limit_result = self.check_rate_limits(client_ip, user_id, endpoint, request)
            
            if rate_limit_result['limited']:
                return JsonResponse({
                    'error': rate_limit_result['message'],
                    'retry_after': rate_limit_result['retry_after'],
                    'limit_type': rate_limit_result['limit_type'],
                    'requests_remaining': rate_limit_result.get('remaining', 0)
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
        method = request.method
        
        if path.startswith('/api/auth/'):
            return 'auth'
        elif path.startswith('/api/videos/') and method == 'POST':
            return 'upload'
        elif path.startswith('/api/billing/') or path.startswith('/api/payments/'):
            return 'payment'
        elif path.startswith('/api/chat/') and method == 'POST':
            return 'chat'
        else:
            return 'default'
    
    def get_user_id(self, request):
        """Get user ID if authenticated"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            return str(request.user.id)
        return None
    
    def check_rate_limits(self, client_ip, user_id, endpoint, request):
        """Check multiple rate limit tiers"""
        # IP-based rate limiting (most restrictive)
        ip_result = self.check_ip_rate_limit(client_ip, endpoint)
        if ip_result['limited']:
            return ip_result
        
        # User-based rate limiting (if authenticated)
        if user_id:
            user_result = self.check_user_rate_limit(user_id, endpoint, request)
            if user_result['limited']:
                return user_result
        
        # Endpoint-specific rate limiting
        endpoint_result = self.check_endpoint_rate_limit(client_ip, user_id, endpoint)
        if endpoint_result['limited']:
            return endpoint_result
        
        return {'limited': False}
    
    def check_ip_rate_limit(self, client_ip, endpoint):
        """IP-based rate limiting"""
        config = self.get_ip_rate_limit_config(endpoint)
        cache_key = f"rate_limit_ip_{hashlib.md5(f'{client_ip}_{endpoint}'.encode()).hexdigest()}"
        
        return self.apply_rate_limit(cache_key, config, 'IP-based')
    
    def check_user_rate_limit(self, user_id, endpoint, request):
        """User-based rate limiting with tier support"""
        user_tier = self.get_user_tier(request)
        config = self.get_user_rate_limit_config(endpoint, user_tier)
        cache_key = f"rate_limit_user_{user_id}_{endpoint}"
        
        return self.apply_rate_limit(cache_key, config, f'{user_tier} user')
    
    def check_endpoint_rate_limit(self, client_ip, user_id, endpoint):
        """Endpoint-specific rate limiting"""
        if endpoint in ['upload', 'auth', 'payment']:
            identifier = user_id or client_ip
            config = self.get_endpoint_specific_config(endpoint)
            cache_key = f"rate_limit_endpoint_{endpoint}_{hashlib.md5(str(identifier).encode()).hexdigest()}"
            
            return self.apply_rate_limit(cache_key, config, f'{endpoint} endpoint')
        
        return {'limited': False}
    
    def apply_rate_limit(self, cache_key, config, limit_type):
        """Apply rate limit logic"""
        current_time = int(time.time())
        window_start = current_time - config['window']
        
        # Get request timestamps within window
        requests_key = f"{cache_key}_requests"
        request_times = cache.get(requests_key, [])
        
        # Remove old requests outside window
        request_times = [t for t in request_times if t > window_start]
        
        if len(request_times) >= config['requests']:
            oldest_request = min(request_times)
            retry_after = oldest_request + config['window'] - current_time
            
            return {
                'limited': True,
                'message': f'Rate limit exceeded for {limit_type}. Try again in {retry_after} seconds.',
                'retry_after': retry_after,
                'limit_type': limit_type,
                'remaining': 0
            }
        
        # Add current request
        request_times.append(current_time)
        cache.set(requests_key, request_times, config['window'] + 60)  # Extra time for cleanup
        
        return {
            'limited': False,
            'remaining': config['requests'] - len(request_times)
        }
    
    def get_user_tier(self, request):
        """Get user subscription tier"""
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'subscription') and request.user.subscription.is_active:
                return request.user.subscription.plan.name.lower()
            elif getattr(request.user, 'is_staff', False):
                return 'admin'
            else:
                return 'free'
        return 'anonymous'
    
    def get_ip_rate_limit_config(self, endpoint):
        """Get IP-based rate limit config"""
        configs = {
            'auth': {'requests': 5, 'window': 900},  # 5 per 15 minutes
            'upload': {'requests': 3, 'window': 1800},  # 3 per 30 minutes
            'payment': {'requests': 10, 'window': 3600},  # 10 per hour
            'default': {'requests': 60, 'window': 3600}  # 60 per hour
        }
        return configs.get(endpoint, configs['default'])
    
    def get_user_rate_limit_config(self, endpoint, user_tier):
        """Get user-based rate limit config with tier support"""
        tier_multipliers = {
            'admin': 10,
            'premium': 5,
            'pro': 3,
            'free': 1,
            'anonymous': 0.5
        }
        
        base_configs = {
            'auth': {'requests': 20, 'window': 900},
            'upload': {'requests': 10, 'window': 1800},
            'payment': {'requests': 50, 'window': 3600},
            'default': {'requests': 200, 'window': 3600}
        }
        
        base_config = base_configs.get(endpoint, base_configs['default'])
        multiplier = tier_multipliers.get(user_tier, 1)
        
        return {
            'requests': int(base_config['requests'] * multiplier),
            'window': base_config['window']
        }
    
    def get_endpoint_specific_config(self, endpoint):
        """Get endpoint-specific configurations"""
        configs = {
            'upload': {'requests': 5, 'window': 3600},  # 5 uploads per hour
            'auth': {'requests': 10, 'window': 900},    # 10 auth attempts per 15 min
            'payment': {'requests': 20, 'window': 3600} # 20 payment actions per hour
        }
        return configs.get(endpoint, {'requests': 100, 'window': 3600})
    
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
