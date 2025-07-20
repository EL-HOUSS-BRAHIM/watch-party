"""
User management models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Friendship(models.Model):
    """Friendship relationship between users"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('blocked', 'Blocked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_requests_sent')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_requests_received')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'friendships'
        unique_together = [['from_user', 'to_user']]
        verbose_name = 'Friendship'
        verbose_name_plural = 'Friendships'
        
    def __str__(self):
        return f"{self.from_user.full_name} -> {self.to_user.full_name} ({self.status})"


class UserActivity(models.Model):
    """Track user activities for analytics and feed"""
    
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('video_upload', 'Video Upload'),
        ('video_view', 'Video View'),
        ('party_create', 'Party Create'),
        ('party_join', 'Party Join'),
        ('party_leave', 'Party Leave'),
        ('friend_request_sent', 'Friend Request Sent'),
        ('friend_request_accepted', 'Friend Request Accepted'),
        ('subscription_start', 'Subscription Started'),
        ('subscription_cancel', 'Subscription Canceled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=255, blank=True)
    
    # Optional references to related objects
    object_type = models.CharField(max_length=50, blank=True)  # 'video', 'party', etc.
    object_id = models.CharField(max_length=255, blank=True)   # UUID as string
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    extra_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        ordering = ['-created_at']
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at']),
        ]
        
    def __str__(self):
        return f"{self.user.full_name} - {self.get_activity_type_display()}"


class UserFavorite(models.Model):
    """User favorites for videos, parties, etc."""
    
    FAVORITE_TYPES = [
        ('video', 'Video'),
        ('party', 'Party'),
        ('user', 'User'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    
    favorite_type = models.CharField(max_length=20, choices=FAVORITE_TYPES)
    object_id = models.CharField(max_length=255)  # UUID as string
    
    # Optional metadata
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_favorites'
        unique_together = [['user', 'favorite_type', 'object_id']]
        ordering = ['-created_at']
        verbose_name = 'User Favorite'
        verbose_name_plural = 'User Favorites'
        
    def __str__(self):
        return f"{self.user.full_name} favorited {self.favorite_type} {self.object_id}"


class UserSettings(models.Model):
    """User preferences and settings"""
    
    NOTIFICATION_FREQUENCY_CHOICES = [
        ('immediate', 'Immediate'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
        ('never', 'Never'),
    ]
    
    PRIVACY_LEVEL_CHOICES = [
        ('public', 'Public'),
        ('friends', 'Friends Only'),
        ('private', 'Private'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    friend_request_notifications = models.CharField(max_length=20, choices=NOTIFICATION_FREQUENCY_CHOICES, default='immediate')
    party_invite_notifications = models.CharField(max_length=20, choices=NOTIFICATION_FREQUENCY_CHOICES, default='immediate')
    video_notifications = models.CharField(max_length=20, choices=NOTIFICATION_FREQUENCY_CHOICES, default='daily')
    
    # Privacy settings
    profile_visibility = models.CharField(max_length=20, choices=PRIVACY_LEVEL_CHOICES, default='friends')
    activity_visibility = models.CharField(max_length=20, choices=PRIVACY_LEVEL_CHOICES, default='friends')
    allow_friend_requests = models.BooleanField(default=True)
    show_online_status = models.BooleanField(default=True)
    
    # Video preferences
    auto_play_videos = models.BooleanField(default=True)
    default_video_quality = models.CharField(max_length=10, default='720p')
    
    # Party preferences
    auto_join_friend_parties = models.BooleanField(default=False)
    party_notifications_sound = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_settings'
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'
        
    def __str__(self):
        return f"Settings for {self.user.full_name}"


class UserReport(models.Model):
    """User reports for inappropriate behavior"""
    
    REPORT_TYPES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate_content', 'Inappropriate Content'),
        ('fake_profile', 'Fake Profile'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    description = models.TextField()
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    
    # Action taken
    action_taken = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_reports'
        ordering = ['-created_at']
        verbose_name = 'User Report'
        verbose_name_plural = 'User Reports'
        
    def __str__(self):
        return f"Report against {self.reported_user.full_name} by {self.reporter.full_name}"
