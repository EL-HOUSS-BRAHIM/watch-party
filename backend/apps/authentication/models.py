"""
User model and authentication models for Watch Party Backend
"""

import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and return a regular user with email and password"""
        if not email:
            raise ValueError('Email address is required')
        if not first_name:
            raise ValueError('First name is required')
        if not last_name:
            raise ValueError('Last name is required')
            
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        """Create and return a superuser with email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
            
        return self.create_user(email, first_name, last_name, password, **extra_fields)


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    
    # Remove the username field
    username = None
    
    # Override groups and user_permissions with custom related_name to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='authentication_user_set',
        related_query_name='authentication_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='authentication_user_set',
        related_query_name='authentication_user',
    )
    
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
    
    # Social Authentication Fields
    google_id = models.CharField(max_length=100, null=True, blank=True, unique=True, verbose_name='Google ID')
    github_id = models.CharField(max_length=100, null=True, blank=True, unique=True, verbose_name='GitHub ID')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True, verbose_name='Profile Picture')
    
    # Additional fields from TODO requirements
    virtual_currency = models.IntegerField(default=0, verbose_name='Virtual Currency')
    total_watch_time = models.DurationField(default=timezone.timedelta(0), verbose_name='Total Watch Time')
    experience_points = models.IntegerField(default=0, verbose_name='Experience Points')
    level = models.IntegerField(default=1, verbose_name='User Level')
    onboarding_completed = models.BooleanField(default=False, verbose_name='Onboarding Completed')
    is_online = models.BooleanField(default=False, verbose_name='Online Status')
    last_activity = models.DateTimeField(auto_now=True, verbose_name='Last Activity')
    
    # Custom manager
    objects = UserManager()
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'authentication_user'
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
    
    @property
    def friends(self):
        """Get all friends of this user"""
        from apps.users.models import Friendship
        from django.db.models import Q
        
        # Get all accepted friendships where this user is involved
        friendships = Friendship.objects.filter(
            Q(from_user=self, status='accepted') |
            Q(to_user=self, status='accepted')
        )
        
        # Extract friend user IDs
        friend_ids = []
        for friendship in friendships:
            if friendship.from_user == self:
                friend_ids.append(friendship.to_user.id)
            else:
                friend_ids.append(friendship.from_user.id)
        
        # Return queryset of friend users
        return User.objects.filter(id__in=friend_ids)


class UserProfile(models.Model):
    """Extended user profile information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, verbose_name='Biography')
    timezone = models.CharField(max_length=50, default='UTC', verbose_name='Timezone')
    language = models.CharField(max_length=10, default='en', verbose_name='Language')
    notification_preferences = models.JSONField(default=dict, verbose_name='Notification Preferences')
    social_links = models.JSONField(default=dict, verbose_name='Social Media Links')
    privacy_settings = models.JSONField(default=dict, verbose_name='Privacy Settings')
    
    # Drive integration fields
    google_drive_token = models.TextField(blank=True, verbose_name='Google Drive Access Token')
    google_drive_refresh_token = models.TextField(blank=True, verbose_name='Google Drive Refresh Token')
    google_drive_connected = models.BooleanField(default=False, verbose_name='Google Drive Connected')
    google_drive_folder_id = models.CharField(max_length=255, blank=True, verbose_name='Google Drive Folder ID')
    google_drive_token_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Google Drive Token Expiry',
    )
    
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


class TwoFactorAuth(models.Model):
    """Two-Factor Authentication settings"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor_auth')
    secret_key = models.CharField(max_length=32, verbose_name='Secret Key')
    backup_codes = models.JSONField(default=list, verbose_name='Backup Codes')
    is_enabled = models.BooleanField(default=False, verbose_name='2FA Enabled')
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True, verbose_name='Last Used')
    
    class Meta:
        db_table = 'two_factor_auth'
        verbose_name = 'Two-Factor Authentication'
        verbose_name_plural = 'Two-Factor Authentications'
        
    def __str__(self):
        return f"2FA for {self.user.email} ({'enabled' if self.is_enabled else 'disabled'})"


class UserSession(models.Model):
    """User session tracking"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auth_sessions')
    refresh_token_hash = models.CharField(max_length=255, verbose_name='Refresh Token Hash')
    device_info = models.JSONField(default=dict, verbose_name='Device Information')
    ip_address = models.GenericIPAddressField(verbose_name='IP Address')
    user_agent = models.TextField(verbose_name='User Agent')
    expires_at = models.DateTimeField(verbose_name='Expires At')
    is_active = models.BooleanField(default=True, verbose_name='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"Session for {self.user.email} from {self.ip_address}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
