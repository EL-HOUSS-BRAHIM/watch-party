"""
Enhanced throttling classes for API rate limiting
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache
from django.conf import settings
import time


class CustomUserRateThrottle(UserRateThrottle):
    """Enhanced user throttling with configurable rates"""
    
    def get_rate(self):
        """Get rate from settings or fallback to default"""
        if hasattr(settings, 'RATE_LIMIT_CONFIGS'):
            config = settings.RATE_LIMIT_CONFIGS.get('default', {})
            requests = config.get('requests', 1000)
            window = config.get('window', 3600)
            return f"{requests}/{window}s"
        return "1000/hour"


class AuthRateThrottle(UserRateThrottle):
    """Stricter throttling for authentication endpoints"""
    
    scope = 'auth'
    
    def get_rate(self):
        """Get auth-specific rate from settings"""
        if hasattr(settings, 'RATE_LIMIT_CONFIGS'):
            config = settings.RATE_LIMIT_CONFIGS.get('auth', {})
            requests = config.get('requests', 30)
            window = config.get('window', 900)
            return f"{requests}/{window}s"
        return "30/15min"


class UploadRateThrottle(UserRateThrottle):
    """Rate limiting for file uploads"""
    
    scope = 'upload'
    
    def get_rate(self):
        """Get upload-specific rate from settings"""
        if hasattr(settings, 'RATE_LIMIT_CONFIGS'):
            config = settings.RATE_LIMIT_CONFIGS.get('upload', {})
            requests = config.get('requests', 20)
            window = config.get('window', 3600)
            return f"{requests}/{window}s"
        return "20/hour"


class APIRateThrottle(UserRateThrottle):
    """General API rate limiting"""
    
    scope = 'api'
    
    def get_rate(self):
        """Get API-specific rate from settings"""
        if hasattr(settings, 'RATE_LIMIT_CONFIGS'):
            config = settings.RATE_LIMIT_CONFIGS.get('api', {})
            requests = config.get('requests', 10000)
            window = config.get('window', 3600)
            return f"{requests}/{window}s"
        return "10000/hour"


class CustomAnonRateThrottle(AnonRateThrottle):
    """Enhanced anonymous user throttling"""
    
    def get_rate(self):
        """More restrictive rate for anonymous users"""
        return "100/hour"


class SecurityThrottle(UserRateThrottle):
    """Special throttling for security-sensitive endpoints"""
    
    scope = 'security'
    
    def get_rate(self):
        """Very restrictive rate for security endpoints"""
        return "10/15min"
