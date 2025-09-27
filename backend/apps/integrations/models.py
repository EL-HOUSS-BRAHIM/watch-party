from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ExternalService(models.Model):
    """Base model for external service integrations"""
    SERVICE_CHOICES = [
        ('google_drive', 'Google Drive'),
        ('aws_s3', 'AWS S3'),
        ('google_oauth', 'Google OAuth'),
        ('discord_oauth', 'Discord OAuth'),
        ('github_oauth', 'GitHub OAuth'),
    ]
    
    name = models.CharField(max_length=50, choices=SERVICE_CHOICES, unique=True)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict, help_text="Service-specific configuration")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations_external_service'
        verbose_name = 'External Service'
        verbose_name_plural = 'External Services'
    
    def __str__(self):
        return f"{self.get_name_display()} - {'Active' if self.is_active else 'Inactive'}"


class UserServiceConnection(models.Model):
    """User connections to external services"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_connections')
    service = models.ForeignKey(ExternalService, on_delete=models.CASCADE)
    
    # OAuth tokens and credentials
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    token_expires_at = models.DateTimeField(blank=True, null=True)
    
    # Service-specific data
    external_user_id = models.CharField(max_length=255, blank=True)
    external_username = models.CharField(max_length=255, blank=True)
    external_email = models.EmailField(blank=True)
    
    # Connection status
    is_connected = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(blank=True, null=True)
    
    # Additional data storage
    metadata = models.JSONField(default=dict, help_text="Service-specific metadata")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations_user_service_connection'
        unique_together = ['user', 'service']
        verbose_name = 'User Service Connection'
        verbose_name_plural = 'User Service Connections'
    
    def __str__(self):
        return f"{self.user.username} - {self.service.name} ({'Connected' if self.is_connected else 'Disconnected'})"


class GoogleDriveFile(models.Model):
    """Google Drive file metadata and streaming info"""
    connection = models.ForeignKey(UserServiceConnection, on_delete=models.CASCADE, related_name='google_drive_files')
    
    # Google Drive file info
    file_id = models.CharField(max_length=255, unique=True)
    file_name = models.CharField(max_length=500)
    mime_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField(null=True, blank=True)
    
    # Video-specific metadata
    is_video = models.BooleanField(default=False)
    duration = models.DurationField(null=True, blank=True)
    video_codec = models.CharField(max_length=50, blank=True)
    audio_codec = models.CharField(max_length=50, blank=True)
    resolution = models.CharField(max_length=20, blank=True)  # e.g., "1920x1080"
    bitrate = models.IntegerField(null=True, blank=True)
    
    # Streaming URLs (cached for performance)
    stream_url = models.URLField(blank=True, help_text="Direct streaming URL")
    thumbnail_url = models.URLField(blank=True)
    stream_url_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Status and metadata
    is_public = models.BooleanField(default=False)
    can_stream = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    # Additional Google Drive metadata
    drive_metadata = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations_google_drive_file'
        indexes = [
            models.Index(fields=['file_id']),
            models.Index(fields=['connection', 'is_video']),
            models.Index(fields=['mime_type']),
        ]
        verbose_name = 'Google Drive File'
        verbose_name_plural = 'Google Drive Files'
    
    def __str__(self):
        return f"{self.file_name} ({self.connection.user.username})"
    
    def is_stream_url_valid(self):
        """Check if the cached stream URL is still valid"""
        if not self.stream_url or not self.stream_url_expires_at:
            return False
        from django.utils import timezone
        return timezone.now() < self.stream_url_expires_at


class AWSS3Configuration(models.Model):
    """AWS S3 configuration for file storage"""
    name = models.CharField(max_length=100, unique=True, help_text="Configuration name")
    bucket_name = models.CharField(max_length=255)
    region = models.CharField(max_length=50, default='us-east-1')
    access_key_id = models.CharField(max_length=255)
    secret_access_key = models.TextField()
    
    # CDN Configuration
    cloudfront_domain = models.CharField(max_length=255, blank=True)
    use_cloudfront = models.BooleanField(default=False)
    
    # Upload settings
    max_file_size = models.BigIntegerField(default=5368709120, help_text="Max file size in bytes (default: 5GB)")
    allowed_file_types = models.JSONField(
        default=list,
        help_text="List of allowed MIME types"
    )
    
    # Security settings
    default_acl = models.CharField(max_length=50, default='private')
    enable_encryption = models.BooleanField(default=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations_aws_s3_configuration'
        verbose_name = 'AWS S3 Configuration'
        verbose_name_plural = 'AWS S3 Configurations'
    
    def __str__(self):
        return f"{self.name} ({self.bucket_name})"


class SocialOAuthProvider(models.Model):
    """Configuration for social OAuth providers"""
    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('discord', 'Discord'),
        ('github', 'GitHub'),
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
    ]
    
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, unique=True)
    client_id = models.CharField(max_length=255)
    client_secret = models.TextField()
    
    # OAuth settings
    scope = models.TextField(help_text="OAuth scopes (space-separated)")
    redirect_uri = models.URLField()
    
    # Provider-specific settings
    additional_settings = models.JSONField(default=dict)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'integrations_social_oauth_provider'
        verbose_name = 'Social OAuth Provider'
        verbose_name_plural = 'Social OAuth Providers'
    
    def __str__(self):
        return f"{self.get_provider_display()} - {'Active' if self.is_active else 'Inactive'}"
