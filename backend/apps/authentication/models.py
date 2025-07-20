"""
User model and authentication models for Watch Party Backend
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name='Email Address')
    first_name = models.CharField(max_length=150, verbose_name='First Name')
    last_name = models.CharField(max_length=150, verbose_name='Last Name')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name='Avatar')
    is_premium = models.BooleanField(default=False, verbose_name='Premium User')
    subscription_expires = models.DateTimeField(null=True, blank=True, verbose_name='Subscription Expires')
    is_email_verified = models.BooleanField(default=False, verbose_name='Email Verified')
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Date Joined')
    last_login = models.DateTimeField(null=True, blank=True, verbose_name='Last Login')
    is_active = models.BooleanField(default=True, verbose_name='Active')
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_subscription_active(self):
        """Check if user has active premium subscription"""
        if not self.is_premium or not self.subscription_expires:
            return False
        return self.subscription_expires > timezone.now()


class UserProfile(models.Model):
    """Extended user profile information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, verbose_name='Biography')
    timezone = models.CharField(max_length=50, default='UTC', verbose_name='Timezone')
    language = models.CharField(max_length=10, default='en', verbose_name='Language')
    notification_preferences = models.JSONField(default=dict, verbose_name='Notification Preferences')
    social_links = models.JSONField(default=dict, verbose_name='Social Media Links')
    privacy_settings = models.JSONField(default=dict, verbose_name='Privacy Settings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        
    def __str__(self):
        return f"Profile for {self.user.full_name}"


class EmailVerification(models.Model):
    """Email verification tokens"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=255, unique=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'email_verifications'
        verbose_name = 'Email Verification'
        verbose_name_plural = 'Email Verifications'
        
    def __str__(self):
        return f"Email verification for {self.user.email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class PasswordReset(models.Model):
    """Password reset tokens"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=255, unique=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'password_resets'
        verbose_name = 'Password Reset'
        verbose_name_plural = 'Password Resets'
        
    def __str__(self):
        return f"Password reset for {self.user.email}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class SocialAccount(models.Model):
    """Social media account connections"""
    
    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('github', 'GitHub'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    provider_id = models.CharField(max_length=100)
    provider_email = models.EmailField(blank=True)
    extra_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'social_accounts'
        unique_together = [['provider', 'provider_id']]
        verbose_name = 'Social Account'
        verbose_name_plural = 'Social Accounts'
        
    def __str__(self):
        return f"{self.provider} account for {self.user.email}"
