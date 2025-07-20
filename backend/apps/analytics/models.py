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
        return f"Analytics for {self.user.full_name}"
    
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


class PartyAnalytics(models.Model):
    """Watch party analytics and statistics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.OneToOneField(WatchParty, on_delete=models.CASCADE, related_name='analytics')
    
    # Viewer statistics
    total_viewers = models.PositiveIntegerField(default=0, verbose_name='Total Unique Viewers')
    peak_concurrent_viewers = models.PositiveIntegerField(default=0, verbose_name='Peak Concurrent Viewers')
    average_viewers = models.FloatField(default=0.0, verbose_name='Average Concurrent Viewers')
    
    # Duration statistics
    total_duration_minutes = models.PositiveIntegerField(default=0, verbose_name='Total Duration (minutes)')
    actual_watch_duration_minutes = models.PositiveIntegerField(default=0, verbose_name='Actual Watch Duration (minutes)')
    pause_time_minutes = models.PositiveIntegerField(default=0, verbose_name='Total Pause Time (minutes)')
    
    # Engagement statistics
    total_chat_messages = models.PositiveIntegerField(default=0, verbose_name='Total Chat Messages')
    total_reactions = models.PositiveIntegerField(default=0, verbose_name='Total Reactions')
    average_messages_per_viewer = models.FloatField(default=0.0, verbose_name='Average Messages Per Viewer')
    
    # Join/leave statistics
    total_joins = models.PositiveIntegerField(default=0, verbose_name='Total Joins')
    total_leaves = models.PositiveIntegerField(default=0, verbose_name='Total Leaves')
    completion_rate = models.FloatField(default=0.0, verbose_name='Completion Rate (%)')
    
    # Quality metrics
    buffering_events = models.PositiveIntegerField(default=0, verbose_name='Total Buffering Events')
    sync_issues = models.PositiveIntegerField(default=0, verbose_name='Synchronization Issues')
    technical_problems = models.PositiveIntegerField(default=0, verbose_name='Technical Problems Reported')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        db_table = 'party_analytics'
        verbose_name = 'Party Analytics'
        verbose_name_plural = 'Party Analytics'
        
    def __str__(self):
        return f"Analytics for {self.party.title}"
    
    @property
    def engagement_score(self):
        """Calculate engagement score based on various metrics"""
        if self.total_viewers == 0:
            return 0
        
        # Weighted score based on different factors
        chat_score = min((self.total_chat_messages / self.total_viewers) * 10, 50)  # Max 50 points
        reaction_score = min((self.total_reactions / self.total_viewers) * 5, 25)    # Max 25 points
        completion_score = min(self.completion_rate * 0.25, 25)                     # Max 25 points
        
        return round(chat_score + reaction_score + completion_score, 2)
    
    @property
    def average_session_duration(self):
        """Calculate average session duration"""
        if self.total_joins == 0:
            return 0
        return round(self.actual_watch_duration_minutes / self.total_joins, 2)


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


class AnalyticsEvent(models.Model):
    """Individual analytics events for detailed tracking"""
    
    EVENT_TYPES = [
        ('view_start', 'Video View Started'),
        ('view_end', 'Video View Ended'),
        ('party_join', 'Party Joined'),
        ('party_leave', 'Party Left'),
        ('chat_message', 'Chat Message Sent'),
        ('reaction_sent', 'Reaction Sent'),
        ('video_upload', 'Video Uploaded'),
        ('friend_request', 'Friend Request Sent'),
        ('buffering', 'Video Buffering'),
        ('quality_change', 'Quality Changed'),
        ('sync_issue', 'Synchronization Issue'),
        ('error_occurred', 'Error Occurred'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_events', null=True, blank=True)
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='analytics_events', null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='analytics_events', null=True, blank=True)
    
    # Event details
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    event_data = models.JSONField(default=dict, verbose_name='Event Data')
    
    # Session information
    session_id = models.CharField(max_length=100, verbose_name='Session ID')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, verbose_name='User Agent')
    
    # Timing information
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='Event Timestamp')
    duration = models.DurationField(null=True, blank=True, verbose_name='Event Duration')
    
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
            models.Index(fields=['session_id']),
        ]
        
    def __str__(self):
        user_str = self.user.full_name if self.user else 'Anonymous'
        return f"{user_str} - {self.event_type} at {self.timestamp}"


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
