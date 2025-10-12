"""
Custom JWT Authentication that reads tokens from HTTP-only cookies
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.request import Request


class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that reads access tokens from HTTP-only cookies
    Falls back to Authorization header if cookie is not present
    """
    
    def authenticate(self, request: Request):
        """
        Try to authenticate using JWT token from cookie first,
        then fall back to Authorization header
        """
        # First, try to get token from cookie
        cookie_token = request.COOKIES.get('access_token')
        
        if cookie_token:
            try:
                # Validate the token from cookie
                validated_token = self.get_validated_token(cookie_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, AuthenticationFailed):
                # If cookie token is invalid, try Authorization header
                pass
        
        # Fall back to standard Authorization header authentication
        return super().authenticate(request)
