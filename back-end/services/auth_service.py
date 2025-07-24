"""
Authentication service for Watch Party Backend
Handles JWT token generation, validation, and user authentication
"""

import jwt
import hashlib
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from core.exceptions import AuthenticationError
from core.utils import generate_secure_token, create_cache_key

User = get_user_model()


class AuthenticationService:
    """Service for handling authentication operations"""
    
    def __init__(self):
        self.access_token_lifetime = timedelta(hours=1)
        self.refresh_token_lifetime = timedelta(days=7)
        self.secret_key = settings.SECRET_KEY
        self.algorithm = 'HS256'
    
    def generate_tokens(self, user):
        """Generate access and refresh tokens for user"""
        try:
            # Generate access token
            access_payload = {
                'user_id': str(user.id),
                'email': user.email,
                'type': 'access',
                'exp': datetime.utcnow() + self.access_token_lifetime,
                'iat': datetime.utcnow(),
            }
            access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
            
            # Generate refresh token
            refresh_payload = {
                'user_id': str(user.id),
                'type': 'refresh',
                'exp': datetime.utcnow() + self.refresh_token_lifetime,
                'iat': datetime.utcnow(),
            }
            refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)
            
            # Store refresh token in cache for validation
            cache_key = create_cache_key('refresh_token', user.id)
            cache.set(cache_key, refresh_token, timeout=int(self.refresh_token_lifetime.total_seconds()))
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'access_expires_in': int(self.access_token_lifetime.total_seconds()),
                'refresh_expires_in': int(self.refresh_token_lifetime.total_seconds()),
            }
        except Exception as e:
            raise AuthenticationError(f"Failed to generate tokens: {str(e)}")
    
    def validate_access_token(self, token):
        """Validate access token and return user"""
        try:
            # Check if token is blacklisted first (quick cache lookup)
            if self.is_token_blacklisted(token):
                raise AuthenticationError("Token has been revoked")
            
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get('type') != 'access':
                raise AuthenticationError("Invalid token type")
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationError("Invalid token payload")
            
            # Check if user exists and is active
            try:
                user = User.objects.get(id=user_id, is_active=True)
                return user
            except User.DoesNotExist:
                raise AuthenticationError("User not found or inactive")
                
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid token")
    
    def blacklist_token(self, token):
        """Add token to blacklist"""
        try:
            # Decode token to get expiry time
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], options={"verify_exp": False})
            exp_timestamp = payload.get('exp')
            
            if exp_timestamp:
                # Calculate remaining time until expiry
                exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
                remaining_time = exp_datetime - datetime.utcnow()
                
                if remaining_time.total_seconds() > 0:
                    # Only blacklist if token hasn't expired
                    cache_key = create_cache_key('blacklisted_token', hashlib.md5(token.encode()).hexdigest())
                    cache.set(cache_key, True, timeout=int(remaining_time.total_seconds()))
        except Exception as e:
            # If we can't decode the token, we can't blacklist it effectively
            pass
    
    def is_token_blacklisted(self, token):
        """Check if token is blacklisted"""
        cache_key = create_cache_key('blacklisted_token', hashlib.md5(token.encode()).hexdigest())
        return cache.get(cache_key, False)
    
    def revoke_all_user_tokens(self, user):
        """Revoke all tokens for a user"""
        # Clear refresh token cache
        refresh_cache_key = create_cache_key('refresh_token', user.id)
        cache.delete(refresh_cache_key)
        
        # Set a user token revocation timestamp
        revocation_cache_key = create_cache_key('token_revocation', user.id)
        cache.set(revocation_cache_key, datetime.utcnow().timestamp(), timeout=7 * 24 * 3600)  # 7 days
