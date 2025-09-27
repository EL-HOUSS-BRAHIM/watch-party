"""
Admin panel serializers for Watch Party Backend
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from typing import Dict, Any


class AdminDashboardStatsSerializer(serializers.Serializer):
    """Admin dashboard statistics"""
    total_users = serializers.IntegerField(help_text="Total number of users")
    total_parties = serializers.IntegerField(help_text="Total number of parties")
    total_videos = serializers.IntegerField(help_text="Total number of videos")
    active_subscriptions = serializers.IntegerField(help_text="Active subscriptions")
    revenue_this_month = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Revenue this month")
    new_users_this_week = serializers.IntegerField(help_text="New users this week")
    popular_videos = serializers.ListField(help_text="Popular videos")
    recent_activities = serializers.ListField(help_text="Recent activities")


class AdminAnalyticsOverviewSerializer(serializers.Serializer):
    """Admin analytics overview"""
    user_growth = serializers.DictField(help_text="User growth statistics")
    engagement_metrics = serializers.DictField(help_text="Engagement metrics")
    revenue_metrics = serializers.DictField(help_text="Revenue metrics")
    system_performance = serializers.DictField(help_text="System performance metrics")


class AdminBroadcastMessageSerializer(serializers.Serializer):
    """Admin broadcast message request"""
    title = serializers.CharField(max_length=200, help_text="Message title")
    message = serializers.CharField(help_text="Message content")
    user_filter = serializers.ChoiceField(
        choices=[('all', 'All Users'), ('premium', 'Premium Users'), ('free', 'Free Users')],
        default='all',
        help_text="User filter"
    )
    send_email = serializers.BooleanField(default=False, help_text="Send via email")
    send_push = serializers.BooleanField(default=True, help_text="Send push notification")


class AdminBroadcastResponseSerializer(serializers.Serializer):
    """Admin broadcast message response"""
    success = serializers.BooleanField(help_text="Operation success")
    message = serializers.CharField(help_text="Response message")
    users_notified = serializers.IntegerField(help_text="Number of users notified")


class AdminUserActionSerializer(serializers.Serializer):
    """Admin user action request"""
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        help_text="List of user IDs"
    )
    action = serializers.ChoiceField(
        choices=[('suspend', 'Suspend'), ('unsuspend', 'Unsuspend'), ('delete', 'Delete')],
        help_text="Action to perform"
    )
    reason = serializers.CharField(max_length=500, required=False, help_text="Reason for action")


class AdminContentModerationSerializer(serializers.Serializer):
    """Admin content moderation"""
    content_type = serializers.ChoiceField(
        choices=[('video', 'Video'), ('party', 'Party'), ('message', 'Message')],
        help_text="Content type"
    )
    content_id = serializers.UUIDField(help_text="Content ID")
    action = serializers.ChoiceField(
        choices=[('approve', 'Approve'), ('reject', 'Reject'), ('flag', 'Flag')],
        help_text="Moderation action"
    )
    reason = serializers.CharField(max_length=500, required=False, help_text="Reason for action")


class AdminSystemHealthSerializer(serializers.Serializer):
    """Admin system health response"""
    database_status = serializers.CharField(help_text="Database status")
    redis_status = serializers.CharField(help_text="Redis status")
    celery_status = serializers.CharField(help_text="Celery status")
    disk_usage = serializers.FloatField(help_text="Disk usage percentage")
    memory_usage = serializers.FloatField(help_text="Memory usage percentage")
    cpu_usage = serializers.FloatField(help_text="CPU usage percentage")
    uptime = serializers.CharField(help_text="System uptime")


class AdminGenericResponseSerializer(serializers.Serializer):
    """Generic admin response"""
    success = serializers.BooleanField(help_text="Operation success")
    message = serializers.CharField(help_text="Response message")
    data = serializers.DictField(required=False, help_text="Additional data")
