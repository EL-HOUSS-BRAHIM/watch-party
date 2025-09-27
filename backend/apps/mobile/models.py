"""
Mobile app specific models
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class MobileDevice(models.Model):
    """Mobile device registration and management"""
    
    PLATFORM_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
        ('unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_devices')
    device_id = models.CharField(max_length=255, unique=True, verbose_name='Device ID')
    
    # Device information
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='unknown')
    model = models.CharField(max_length=100, blank=True, verbose_name='Device Model')
    os_version = models.CharField(max_length=50, blank=True, verbose_name='OS Version')
    app_version = models.CharField(max_length=20, blank=True, verbose_name='App Version')
    
    # Push notifications
    push_token = models.CharField(max_length=500, blank=True, null=True, verbose_name='Push Token')
    push_enabled = models.BooleanField(default=True, verbose_name='Push Notifications Enabled')
    
    # Sync and status
    last_sync = models.DateTimeField(null=True, blank=True, verbose_name='Last Sync')
    last_active = models.DateTimeField(null=True, blank=True, verbose_name='Last Active')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    
    # Settings
    settings = models.JSONField(default=dict, blank=True, verbose_name='Device Settings')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mobile_devices'
        verbose_name = 'Mobile Device'
        verbose_name_plural = 'Mobile Devices'
        ordering = ['-last_active']
        indexes = [
            models.Index(fields=['user', 'platform']),
            models.Index(fields=['device_id']),
            models.Index(fields=['last_active']),
        ]
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.platform} - {self.model}"
    
    def update_last_active(self):
        """Update last active timestamp"""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])


class MobileSyncData(models.Model):
    """Mobile app data synchronization tracking"""
    
    SYNC_TYPE_CHOICES = [
        ('full', 'Full Sync'),
        ('incremental', 'Incremental Sync'),
        ('emergency', 'Emergency Sync'),
    ]
    
    SYNC_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='sync_logs')
    
    # Sync details
    sync_type = models.CharField(max_length=20, choices=SYNC_TYPE_CHOICES, default='incremental')
    sync_status = models.CharField(max_length=20, choices=SYNC_STATUS_CHOICES, default='pending')
    
    # Data tracking
    data_types = models.JSONField(default=list, verbose_name='Data Types Synced')
    data_size_bytes = models.PositiveIntegerField(default=0, verbose_name='Data Size (bytes)')
    records_count = models.PositiveIntegerField(default=0, verbose_name='Records Count')
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    
    # Error handling
    error_message = models.TextField(blank=True, verbose_name='Error Message')
    retry_count = models.PositiveIntegerField(default=0, verbose_name='Retry Count')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mobile_sync_data'
        verbose_name = 'Mobile Sync Data'
        verbose_name_plural = 'Mobile Sync Data'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['device', 'sync_status']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.device.user.get_full_name()} - {self.sync_type} - {self.sync_status}"


class MobileAppCrash(models.Model):
    """Mobile app crash reports"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='crash_reports')
    
    # Crash details
    crash_id = models.CharField(max_length=255, unique=True, verbose_name='Crash ID')
    stack_trace = models.TextField(verbose_name='Stack Trace')
    exception_type = models.CharField(max_length=100, verbose_name='Exception Type')
    exception_message = models.TextField(verbose_name='Exception Message')
    
    # Context
    screen_name = models.CharField(max_length=100, blank=True, verbose_name='Screen Name')
    user_action = models.CharField(max_length=255, blank=True, verbose_name='User Action')
    memory_usage_mb = models.PositiveIntegerField(null=True, blank=True, verbose_name='Memory Usage (MB)')
    battery_level = models.PositiveIntegerField(null=True, blank=True, verbose_name='Battery Level (%)')
    
    # Status
    is_resolved = models.BooleanField(default=False, verbose_name='Is Resolved')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='Resolved At')
    resolution_notes = models.TextField(blank=True, verbose_name='Resolution Notes')
    
    # Timestamps
    crashed_at = models.DateTimeField(verbose_name='Crashed At')
    reported_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mobile_app_crashes'
        verbose_name = 'Mobile App Crash'
        verbose_name_plural = 'Mobile App Crashes'
        ordering = ['-crashed_at']
        indexes = [
            models.Index(fields=['device', 'crashed_at']),
            models.Index(fields=['crash_id']),
            models.Index(fields=['is_resolved']),
        ]
        
    def __str__(self):
        return f"Crash: {self.exception_type} - {self.device.user.get_full_name()}"


class MobileAnalytics(models.Model):
    """Mobile app analytics and usage tracking"""
    
    EVENT_TYPE_CHOICES = [
        ('app_open', 'App Open'),
        ('app_close', 'App Close'),
        ('screen_view', 'Screen View'),
        ('button_tap', 'Button Tap'),
        ('video_play', 'Video Play'),
        ('video_pause', 'Video Pause'),
        ('party_join', 'Party Join'),
        ('party_leave', 'Party Leave'),
        ('chat_message', 'Chat Message'),
        ('feature_use', 'Feature Use'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(MobileDevice, on_delete=models.CASCADE, related_name='analytics')
    
    # Event details
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    event_name = models.CharField(max_length=100, verbose_name='Event Name')
    event_data = models.JSONField(default=dict, verbose_name='Event Data')
    
    # Session context
    session_id = models.CharField(max_length=255, verbose_name='Session ID')
    screen_name = models.CharField(max_length=100, blank=True, verbose_name='Screen Name')
    
    # Performance metrics
    load_time_ms = models.PositiveIntegerField(null=True, blank=True, verbose_name='Load Time (ms)')
    memory_usage_mb = models.PositiveIntegerField(null=True, blank=True, verbose_name='Memory Usage (MB)')
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mobile_analytics'
        verbose_name = 'Mobile Analytics'
        verbose_name_plural = 'Mobile Analytics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', 'event_type']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['session_id']),
        ]
        
    def __str__(self):
        return f"{self.event_type} - {self.device.user.get_full_name()}"
