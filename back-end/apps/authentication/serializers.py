"""
Serializers for authentication endpoints
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
import uuid
import secrets

from .models import User, UserProfile, EmailVerification, PasswordReset, SocialAccount


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
        validated_data.pop('confirm_password')
        promo_code = validated_data.pop('promo_code', None)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=True,
            is_email_verified=False
        )
        
        # UserProfile is created automatically by signal
        
        # Create email verification token
        self.create_email_verification_token(user)
        
        # Handle promo code if provided
        if promo_code:
            # TODO: Implement promo code handling
            pass
            
        return user
    
    def create_email_verification_token(self, user):
        """Create email verification token"""
        token = secrets.token_urlsafe(32)
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        return token


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
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'avatar',
            'is_premium', 'subscription_expires', 'date_joined', 'profile'
        ]
        read_only_fields = ['id', 'email', 'date_joined']
    
    def get_profile(self, obj):
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


class PasswordResetSerializer(serializers.Serializer):
    """Password reset serializer"""
    
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
