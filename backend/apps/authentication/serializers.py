"""
Serializers for authentication endpoints
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
import secrets
from typing import Optional, Dict, Any
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

from .models import User, UserProfile, EmailVerification, PasswordReset, SocialAccount


def create_email_verification_token(user: User) -> str:
    """Create and persist an email verification token for the given user."""

    token = secrets.token_urlsafe(32)
    EmailVerification.objects.create(
        user=user,
        token=token,
        expires_at=timezone.now() + timedelta(hours=24),
    )
    return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    promo_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password', 'first_name', 
            'last_name', 'promo_code'
        ]
        
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data = validated_data.copy()
        validated_data.pop('confirm_password')
        promo_code = validated_data.pop('promo_code', None)

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=True,
            is_email_verified=False,
        )

        # UserProfile is created automatically by signal

        # Create email verification token
        create_email_verification_token(user)

        # Handle promo code if provided
        if promo_code:
            # TODO: Implement promo code handling
            pass

        return user


# Additional serializers for views that need explicit serializer_class

class TwoFactorSetupRequestSerializer(serializers.Serializer):
    """Serializer for 2FA setup requests"""
    pass  # No input needed for setup

class TwoFactorVerifyRequestSerializer(serializers.Serializer):
    """Serializer for 2FA verification"""
    token = serializers.CharField(max_length=6, min_length=6)

class TwoFactorDisableRequestSerializer(serializers.Serializer):
    """Serializer for 2FA disable requests"""
    token = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True)

class GoogleDriveAuthRequestSerializer(serializers.Serializer):
    """Serializer for Google Drive auth requests"""
    code = serializers.CharField(required=False)
    state = serializers.CharField(required=False)

class GoogleDriveDisconnectSerializer(serializers.Serializer):
    """Serializer for Google Drive disconnect"""
    pass

class GoogleDriveStatusSerializer(serializers.Serializer):
    """Serializer for Google Drive status"""
    pass

class UserSessionsRequestSerializer(serializers.Serializer):
    """Serializer for user sessions requests"""
    pass

class SocialAuthRedirectSerializer(serializers.Serializer):
    """Serializer for social auth redirect"""
    pass

class GoogleAuthRequestSerializer(serializers.Serializer):
    """Serializer for Google OAuth requests"""
    access_token = serializers.CharField()

class GitHubAuthRequestSerializer(serializers.Serializer):
    """Serializer for GitHub OAuth requests"""
    access_token = serializers.CharField()

    def create_email_verification_token(self, user):
        """Create email verification token"""
        return create_email_verification_token(user)


class UserLoginSerializer(serializers.Serializer):
    """User login serializer"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Both email and password are required.')


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    
    full_name = serializers.ReadOnlyField()
    is_subscription_active = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'avatar', 'is_premium', 'subscription_expires', 
            'is_subscription_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Detailed user profile serializer including profile data"""
    
    profile = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)
    updated_at = serializers.DateTimeField(source='last_activity', read_only=True)
    is_verified = serializers.BooleanField(source='is_email_verified', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'avatar',
            'is_premium', 'is_verified', 'subscription_expires', 'date_joined', 
            'created_at', 'updated_at', 'profile'
        ]
        read_only_fields = ['id', 'email', 'full_name', 'date_joined', 'created_at', 'updated_at', 'is_verified']
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_avatar(self, obj):
        """Get avatar URL or None"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_profile(self, obj) -> Optional[Dict[str, Any]]:
        """Get user profile data"""
        try:
            profile = obj.profile
            return {
                'bio': profile.bio,
                'timezone': profile.timezone,
                'language': profile.language,
                'notification_preferences': profile.notification_preferences,
                'social_links': profile.social_links,
                'privacy_settings': profile.privacy_settings,
            }
        except UserProfile.DoesNotExist:
            return None


class PasswordChangeSerializer(serializers.Serializer):
    """Password change serializer"""
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Password reset request serializer"""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal whether user exists for security
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with token"""
    
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # Validate token
        try:
            reset = PasswordReset.objects.get(
                token=attrs['token'],
                is_used=False
            )
            if reset.is_expired:
                raise serializers.ValidationError("Reset token has expired.")
            attrs['reset'] = reset
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError("Invalid reset token.")
        
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Email verification serializer"""
    
    token = serializers.CharField()
    
    def validate_token(self, value):
        try:
            verification = EmailVerification.objects.get(
                token=value,
                is_used=False
            )
            if verification.is_expired:
                raise serializers.ValidationError("Verification token has expired.")
            return value
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError("Invalid verification token.")


class SocialAccountSerializer(serializers.ModelSerializer):
    """Social account serializer"""
    
    class Meta:
        model = SocialAccount
        fields = ['id', 'provider', 'provider_email', 'created_at']
        read_only_fields = ['id', 'created_at']

class EmailVerificationOTPSerializer(serializers.Serializer):
    """Serializer for verifying email with OTP"""
    
    otp_code = serializers.CharField(max_length=6, min_length=6)
    
    def validate_otp_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits")
        return value


class ResendVerificationOTPSerializer(serializers.Serializer):
    """Serializer for resending verification OTP"""
    
    email = serializers.EmailField(required=False)
    
    def validate_email(self, value):
        if value:
            try:
                user = User.objects.get(email=value)
                if user.is_email_verified:
                    raise serializers.ValidationError("Email is already verified")
            except User.DoesNotExist:
                raise serializers.ValidationError("User not found")
        return value