"""
Analytics models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.parties.models import WatchParty
from apps.videos.models import Video

User = get_user_model()


class UserSession(models.Model):
    """User session tracking"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True, verbose_name='Session ID')
    
    # Session details
    start_time = models.DateTimeField(verbose_name='Session Start Time')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='Session End Time')
    duration = models.PositiveIntegerField(null=True, blank=True, verbose_name='Duration (seconds)')
    
    # Device and location information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, verbose_name='User Agent')
    device_type = models.CharField(max_length=50, blank=True, verbose_name='Device Type')
    browser = models.CharField(max_length=50, blank=True, verbose_name='Browser')
    os = models.CharField(max_length=50, blank=True, verbose_name='Operating System')
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['session_id']),
        ]
        
    def __str__(self):
        user_str = self.user.get_full_name() if self.user else 'Anonymous'
        return f"{user_str} session on {self.start_time}"


class WatchTime(models.Model):
    """Track user watch time for videos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_times')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='watch_times')
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='watch_times', null=True, blank=True)
    
    # Watch time details
    total_watch_time = models.PositiveIntegerField(default=0, verbose_name='Total Watch Time (seconds)')
    last_position = models.PositiveIntegerField(default=0, verbose_name='Last Position (seconds)')
    completion_percentage = models.FloatField(default=0.0, verbose_name='Completion Percentage')
    
    # Quality and performance
    average_quality = models.CharField(max_length=10, blank=True, verbose_name='Average Quality')
    buffering_events = models.PositiveIntegerField(default=0, verbose_name='Buffering Events')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'watch_times'
        verbose_name = 'Watch Time'
        verbose_name_plural = 'Watch Times'
        unique_together = ['user', 'video', 'party']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['video', 'created_at']),
            models.Index(fields=['party', 'created_at']),
        ]
        
    def __str__(self):
        return f"{self.user.get_full_name()} watched {self.video.title}"


class PartyAnalytics(models.Model):
    """Watch party analytics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.OneToOneField(WatchParty, on_delete=models.CASCADE, related_name='analytics')
    
    # Participant statistics
    total_participants = models.PositiveIntegerField(default=0, verbose_name='Total Participants')
    peak_concurrent_participants = models.PositiveIntegerField(default=0, verbose_name='Peak Concurrent Participants')
    avg_session_duration = models.FloatField(default=0.0, verbose_name='Average Session Duration (seconds)')
    
    # Engagement statistics
    total_messages = models.PositiveIntegerField(default=0, verbose_name='Total Chat Messages')
    total_reactions = models.PositiveIntegerField(default=0, verbose_name='Total Reactions')
    
    # Performance metrics
    sync_issues = models.PositiveIntegerField(default=0, verbose_name='Sync Issues')
    buffering_events = models.PositiveIntegerField(default=0, verbose_name='Buffering Events')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'party_analytics'
        verbose_name = 'Party Analytics'
        verbose_name_plural = 'Party Analytics'
        
    def __str__(self):
        return f"Analytics for {self.party.title}"
    
    @property
    def engagement_score(self) -> float:
        """Calculate party engagement score"""
        if self.total_participants == 0:
            return 0.0
        
        # Calculate engagement based on messages and reactions per participant
        message_score = (self.total_messages / self.total_participants) * 10
        reaction_score = (self.total_reactions / self.total_participants) * 5
        
        return round(min(message_score + reaction_score, 100.0), 2)
    
    @property
    def average_session_duration(self) -> str:
        """Get average session duration as formatted string"""
        if self.avg_session_duration == 0:
            return "0:00"
        
        hours = int(self.avg_session_duration // 3600)
        minutes = int((self.avg_session_duration % 3600) // 60)
        
        if hours > 0:
            return f"{hours}:{minutes:02d}"
        else:
            return f"{minutes}:00"


class AnalyticsEvent(models.Model):
    """Individual analytics events"""

    EVENT_TYPES = [
        ('video_play', 'Video Play'),
        ('video_pause', 'Video Pause'),
        ('video_seek', 'Video Seek'),
        ('party_join', 'Party Join'),
        ('party_leave', 'Party Leave'),
        ('chat_message', 'Chat Message'),
        ('reaction_sent', 'Reaction Sent'),
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('video_upload', 'Video Upload'),
        ('party_create', 'Party Create'),
        ('buffering', 'Video Buffering'),
        ('error', 'Error Occurred'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analytics_events',
        null=True,
        blank=True,
    )
    party = models.ForeignKey(
        WatchParty,
        on_delete=models.CASCADE,
        related_name='analytics_events',
        null=True,
        blank=True,
    )
    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name='analytics_events',
        null=True,
        blank=True,
    )

    # Event details
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    event_data = models.JSONField(default=dict, verbose_name='Event Data')
    duration = models.DurationField(null=True, blank=True, verbose_name='Event Duration')

    # Session information
    session_id = models.CharField(max_length=100, blank=True, verbose_name='Session ID')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, verbose_name='User Agent')

    # Processing status
    processed = models.BooleanField(default=False, verbose_name='Processed')

    # Timestamp
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='Event Timestamp')

    class Meta:
        db_table = 'analytics_events'
        verbose_name = 'Analytics Event'
        verbose_name_plural = 'Analytics Events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['party', 'timestamp']),
            models.Index(fields=['video', 'timestamp']),
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['processed', 'timestamp']),
            models.Index(fields=['session_id']),
        ]

    def __str__(self):
        user_str = self.user.get_full_name() if self.user else 'Anonymous'
        return f"{user_str} - {self.event_type} at {self.timestamp}"


class UserAnalytics(models.Model):
    """User analytics and statistics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Watch time statistics
    total_watch_time_minutes = models.PositiveIntegerField(default=0, verbose_name='Total Watch Time (minutes)')
    this_week_watch_time_minutes = models.PositiveIntegerField(default=0, verbose_name='This Week Watch Time (minutes)')
    this_month_watch_time_minutes = models.PositiveIntegerField(default=0, verbose_name='This Month Watch Time (minutes)')
    
    # Party participation statistics
    total_parties_joined = models.PositiveIntegerField(default=0, verbose_name='Total Parties Joined')
    total_parties_hosted = models.PositiveIntegerField(default=0, verbose_name='Total Parties Hosted')
    this_week_parties_joined = models.PositiveIntegerField(default=0, verbose_name='This Week Parties Joined')
    this_month_parties_joined = models.PositiveIntegerField(default=0, verbose_name='This Month Parties Joined')
    
    # Chat statistics
    total_messages_sent = models.PositiveIntegerField(default=0, verbose_name='Total Messages Sent')
    this_week_messages_sent = models.PositiveIntegerField(default=0, verbose_name='This Week Messages Sent')
    this_month_messages_sent = models.PositiveIntegerField(default=0, verbose_name='This Month Messages Sent')
    
    # Feature usage
    videos_uploaded = models.PositiveIntegerField(default=0, verbose_name='Videos Uploaded')
    reactions_sent = models.PositiveIntegerField(default=0, verbose_name='Reactions Sent')
    friends_added = models.PositiveIntegerField(default=0, verbose_name='Friends Added')
    
    # Engagement metrics
    average_session_duration_minutes = models.FloatField(default=0.0, verbose_name='Average Session Duration (minutes)')
    favorite_genre = models.CharField(max_length=100, blank=True, verbose_name='Favorite Genre')
    most_active_hour = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name='Most Active Hour (0-23)')
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True, verbose_name='Last Updated')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    
    class Meta:
        db_table = 'user_analytics'
        verbose_name = 'User Analytics'
        verbose_name_plural = 'User Analytics'
        
    def __str__(self):
        return f"Analytics for {self.user.get_full_name()}"
    
    @property
    def total_watch_time_hours(self):
        """Get total watch time in hours"""
        return round(self.total_watch_time_minutes / 60, 2)
    
    @property
    def average_party_duration_minutes(self):
        """Calculate average party duration for hosted parties"""
        if self.total_parties_hosted == 0:
            return 0
        # This would need to be calculated based on actual party data
        return 0
    
    def update_weekly_stats(self):
        """Reset weekly statistics"""
        self.this_week_watch_time_minutes = 0
        self.this_week_parties_joined = 0
        self.this_week_messages_sent = 0
        self.save()
    
    def update_monthly_stats(self):
        """Reset monthly statistics"""
        self.this_month_watch_time_minutes = 0
        self.this_month_parties_joined = 0
        self.this_month_messages_sent = 0
        self.save()


class VideoAnalytics(models.Model):
    """Video analytics and statistics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video = models.OneToOneField(Video, on_delete=models.CASCADE, related_name='analytics')
    
    # View statistics
    total_views = models.PositiveIntegerField(default=0, verbose_name='Total Views')
    unique_viewers = models.PositiveIntegerField(default=0, verbose_name='Unique Viewers')
    this_week_views = models.PositiveIntegerField(default=0, verbose_name='This Week Views')
    this_month_views = models.PositiveIntegerField(default=0, verbose_name='This Month Views')
    
    # Watch time statistics
    total_watch_time_minutes = models.PositiveIntegerField(default=0, verbose_name='Total Watch Time (minutes)')
    average_watch_duration = models.FloatField(default=0.0, verbose_name='Average Watch Duration (%)')
    completion_rate = models.FloatField(default=0.0, verbose_name='Completion Rate (%)')
    
    # Engagement statistics
    total_parties_created = models.PositiveIntegerField(default=0, verbose_name='Total Parties Created')
    total_reactions = models.PositiveIntegerField(default=0, verbose_name='Total Reactions')
    total_comments = models.PositiveIntegerField(default=0, verbose_name='Total Comments')
    
    # Skip pattern analysis
    common_skip_start_seconds = models.PositiveIntegerField(null=True, blank=True, verbose_name='Common Skip Start (seconds)')
    common_skip_end_seconds = models.PositiveIntegerField(null=True, blank=True, verbose_name='Common Skip End (seconds)')
    most_rewatched_start_seconds = models.PositiveIntegerField(null=True, blank=True, verbose_name='Most Rewatched Start (seconds)')
    most_rewatched_end_seconds = models.PositiveIntegerField(null=True, blank=True, verbose_name='Most Rewatched End (seconds)')
    
    # Quality and performance
    average_quality_selected = models.CharField(max_length=10, blank=True, verbose_name='Average Quality Selected')
    buffering_rate = models.FloatField(default=0.0, verbose_name='Buffering Rate (%)')
    loading_time_seconds = models.FloatField(default=0.0, verbose_name='Average Loading Time (seconds)')
    
    # User feedback aggregation
    average_rating = models.FloatField(default=0.0, verbose_name='Average Rating')
    total_ratings = models.PositiveIntegerField(default=0, verbose_name='Total Ratings')
    thumbs_up = models.PositiveIntegerField(default=0, verbose_name='Thumbs Up')
    thumbs_down = models.PositiveIntegerField(default=0, verbose_name='Thumbs Down')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        db_table = 'video_analytics'
        verbose_name = 'Video Analytics'
        verbose_name_plural = 'Video Analytics'
        indexes = [
            models.Index(fields=['total_views']),
            models.Index(fields=['unique_viewers']),
            models.Index(fields=['average_rating']),
        ]
        
    def __str__(self):
        return f"Analytics for {self.video.title}"
    
    @property
    def popularity_score(self):
        """Calculate video popularity score"""
        # Weighted score based on views, engagement, and ratings
        view_score = min(self.total_views / 100, 50)  # Max 50 points for views
        engagement_score = min((self.total_reactions + self.total_comments) / 10, 30)  # Max 30 points
        rating_score = self.average_rating * 4  # Max 20 points (5 stars * 4)
        
        return round(view_score + engagement_score + rating_score, 2)
    
    @property
    def engagement_rate(self):
        """Calculate engagement rate"""
        if self.unique_viewers == 0:
            return 0
        engagement_actions = self.total_reactions + self.total_comments + self.total_parties_created
        return round((engagement_actions / self.unique_viewers) * 100, 2)
    
    def update_weekly_stats(self):
        """Reset weekly statistics"""
        self.this_week_views = 0
        self.save()
    
    def update_monthly_stats(self):
        """Reset monthly statistics"""
        self.this_month_views = 0
        self.save()


class SystemAnalytics(models.Model):
    """System-wide analytics and metrics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True, verbose_name='Date')
    
    # User metrics
    total_registered_users = models.PositiveIntegerField(default=0)
    active_users_today = models.PositiveIntegerField(default=0)
    new_users_today = models.PositiveIntegerField(default=0)
    premium_users = models.PositiveIntegerField(default=0)
    
    # Content metrics
    total_videos = models.PositiveIntegerField(default=0)
    videos_uploaded_today = models.PositiveIntegerField(default=0)
    total_parties = models.PositiveIntegerField(default=0)
    parties_created_today = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    total_watch_time_hours = models.FloatField(default=0.0)
    total_chat_messages = models.PositiveIntegerField(default=0)
    total_reactions = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    average_load_time_seconds = models.FloatField(default=0.0)
    error_count = models.PositiveIntegerField(default=0)
    uptime_percentage = models.FloatField(default=100.0)
    
    # Storage metrics
    total_storage_gb = models.FloatField(default=0.0)
    bandwidth_used_gb = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'system_analytics'
        verbose_name = 'System Analytics'
        verbose_name_plural = 'System Analytics'
        ordering = ['-date']
        
    def __str__(self):
        return f"System Analytics for {self.date}"
