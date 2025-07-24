"""
Authentication service for Watch Party Backend
Handles JWT token generation, validation, and user authentication
"""

import jwt
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
    
    def validate_refresh_token(self, token):
        """Validate refresh token and return user"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get('type') != 'refresh':
                raise AuthenticationError("Invalid token type")
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationError("Invalid token payload")
            
            # Check if token exists in cache (not revoked)
            cache_key = create_cache_key('refresh_token', user_id)
            cached_token = cache.get(cache_key)
            if cached_token != token:
                raise AuthenticationError("Token has been revoked")
            
            # Check if user exists and is active
            try:
                user = User.objects.get(id=user_id, is_active=True)
                return user
            except User.DoesNotExist:
                raise AuthenticationError("User not found or inactive")
                
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Refresh token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid refresh token")
    
    def refresh_access_token(self, refresh_token):
        """Generate new access token using refresh token"""
        user = self.validate_refresh_token(refresh_token)
        
        # Generate new access token
        access_payload = {
            'user_id': str(user.id),
            'email': user.email,
            'type': 'access',
            'exp': datetime.utcnow() + self.access_token_lifetime,
            'iat': datetime.utcnow(),
        }
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
        
        return {
            'access_token': access_token,
            'expires_in': int(self.access_token_lifetime.total_seconds()),
        }
    
    def revoke_refresh_token(self, user_id):
        """Revoke refresh token for user"""
        cache_key = create_cache_key('refresh_token', user_id)
        cache.delete(cache_key)
    
    def revoke_all_tokens(self, user_id):
        """Revoke all tokens for user"""
        # Revoke refresh token
        self.revoke_refresh_token(user_id)
        
        # Add access token to blacklist
        # Note: In production, you might want to maintain a blacklist of active access tokens
        # For now, we'll just revoke the refresh token
    
    def generate_password_reset_token(self, user):
        """Generate password reset token"""
        payload = {
            'user_id': str(user.id),
            'type': 'password_reset',
            'exp': datetime.utcnow() + timedelta(hours=1),  # 1 hour expiry
            'iat': datetime.utcnow(),
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        
        # Store token in cache for validation
        cache_key = create_cache_key('password_reset_token', user.id)
        cache.set(cache_key, token, timeout=3600)  # 1 hour
        
        return token
    
    def validate_password_reset_token(self, token):
        """Validate password reset token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get('type') != 'password_reset':
                raise AuthenticationError("Invalid token type")
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationError("Invalid token payload")
            
            # Check if token exists in cache
            cache_key = create_cache_key('password_reset_token', user_id)
            cached_token = cache.get(cache_key)
            if cached_token != token:
                raise AuthenticationError("Token has been used or revoked")
            
            # Get user
            try:
                user = User.objects.get(id=user_id, is_active=True)
                return user
            except User.DoesNotExist:
                raise AuthenticationError("User not found or inactive")
                
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Password reset token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid password reset token")
    
    def use_password_reset_token(self, token):
        """Use password reset token (marks it as used)"""
        user = self.validate_password_reset_token(token)
        
        # Remove token from cache to prevent reuse
        cache_key = create_cache_key('password_reset_token', user.id)
        cache.delete(cache_key)
        
        return user
    
    def generate_email_verification_token(self, user):
        """Generate email verification token"""
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'type': 'email_verification',
            'exp': datetime.utcnow() + timedelta(days=7),  # 7 days expiry
            'iat': datetime.utcnow(),
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        
        # Store token in cache
        cache_key = create_cache_key('email_verification_token', user.id)
        cache.set(cache_key, token, timeout=7 * 24 * 3600)  # 7 days
        
        return token
    
    def validate_email_verification_token(self, token):
        """Validate email verification token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get('type') != 'email_verification':
                raise AuthenticationError("Invalid token type")
            
            user_id = payload.get('user_id')
            email = payload.get('email')
            if not user_id or not email:
                raise AuthenticationError("Invalid token payload")
            
            # Check if token exists in cache
            cache_key = create_cache_key('email_verification_token', user_id)
            cached_token = cache.get(cache_key)
            if cached_token != token:
                raise AuthenticationError("Token has been used or revoked")
            
            # Get user and verify email matches
            try:
                user = User.objects.get(id=user_id, email=email)
                return user
            except User.DoesNotExist:
                raise AuthenticationError("User not found or email mismatch")
                
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Email verification token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationError("Invalid email verification token")
    
    def verify_email(self, token):
        """Verify user email using token"""
        user = self.validate_email_verification_token(token)
        
        # Mark email as verified
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        
        # Remove token from cache
        cache_key = create_cache_key('email_verification_token', user.id)
        cache.delete(cache_key)
        
        return user
    
    def is_token_blacklisted(self, token):
        """Check if token is blacklisted"""
        # For now, we don't maintain an active blacklist for access tokens
        # In production, you might want to implement this for immediate token revocation
        return False
    
    def blacklist_token(self, token):
        """Add token to blacklist"""
        # Implementation for token blacklisting
        # This would be useful for immediate token revocation
        pass


class TwoFactorAuthService:
    """Service for handling two-factor authentication"""
    
    def __init__(self):
        self.issuer = "Watch Party"
    
    def generate_secret(self):
        """Generate 2FA secret for user"""
        import pyotp
        return pyotp.random_base32()
    
    def generate_qr_code(self, user, secret):
        """Generate QR code for 2FA setup"""
        import pyotp
        import qrcode
        import io
        import base64
        
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name=self.issuer
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        # Convert to base64 image
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_data = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{qr_code_data}"
    
    def verify_token(self, secret, token):
        """Verify 2FA token"""
        import pyotp
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 window tolerance
    
    def generate_backup_codes(self, count=10):
        """Generate backup codes for 2FA"""
        return [generate_secure_token(8) for _ in range(count)]


# Singleton instances
auth_service = AuthenticationService()
two_factor_service = TwoFactorAuthService()
