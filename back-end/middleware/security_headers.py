"""
Security headers middleware for Watch Party Backend
"""

from django.conf import settings


class SecurityHeadersMiddleware:
    """
    Middleware to add security headers to all responses
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response.setdefault('X-Content-Type-Options', 'nosniff')
        response.setdefault('X-Frame-Options', 'DENY')
        response.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        
        # Add CSP - enforce by default, report-only in development
        csp_header = 'Content-Security-Policy'
        if getattr(settings, 'CSP_REPORT_ONLY', False):
            csp_header = 'Content-Security-Policy-Report-Only'
        
        if csp_header not in response and 'Content-Security-Policy' not in response:
            csp_policy = getattr(settings, 'CSP_POLICY', (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "media-src 'self'; "
                "object-src 'none'; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            ))
            response[csp_header] = csp_policy
        
        return response
