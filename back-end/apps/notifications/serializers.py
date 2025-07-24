"""
Notifications serializers for Watch Party Backend
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Notification, NotificationPreferences, NotificationTemplate, 
    NotificationDelivery, NotificationQueue
)

User = get_user_model()


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Notification template serializer"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'notification_type', 'title_template', 'content_template',
            'email_subject_template', 'email_content_template',
            'icon', 'color', 'priority', 'can_disable', 'requires_action',
            'auto_expire_hours', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RelatedUserSerializer(serializers.ModelSerializer):
    """Basic user info for related user in notifications"""
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']
        read_only_fields = ['id', 'first_name', 'last_name', 'avatar']


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    
    template_type = serializers.CharField(source='template.notification_type', read_only=True)
    related_user = RelatedUserSerializer(read_only=True)
    party_title = serializers.CharField(source='party.title', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    time_since_created = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    is_urgent = serializers.ReadOnlyField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'content', 'template_type',
            'party', 'party_title', 'video', 'video_title', 
            'related_user', 'icon', 'color', 'priority',
            'action_url', 'action_text', 'requires_action',
            'status', 'is_read', 'is_expired', 'is_urgent',
            'created_at', 'read_at', 'expires_at', 'time_since_created',
            'metadata'
        ]
        read_only_fields = [
            'id', 'template_type', 'party_title', 'video_title',
            'time_since_created', 'is_expired', 'is_urgent', 'created_at'
        ]


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    recipient_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    send_to_all = serializers.BooleanField(write_only=True, required=False)
    
    class Meta:
        model = Notification
        fields = [
            'title', 'content', 'template', 'party', 'video', 'related_user',
            'icon', 'color', 'priority', 'action_url', 'action_text',
            'requires_action', 'scheduled_at', 'expires_at', 'metadata',
            'recipient_ids', 'send_to_all'
        ]
    
    def validate(self, data):
        recipient_ids = data.get('recipient_ids')
        send_to_all = data.get('send_to_all')
        
        if not recipient_ids and not send_to_all:
            raise serializers.ValidationError(
                "Either 'recipient_ids' or 'send_to_all' must be provided"
            )
        
        return data


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Notification preferences serializer"""
    
    class Meta:
        model = NotificationPreferences
        fields = [
            'id', 'notifications_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'timezone', 'in_app_enabled', 'email_enabled', 'push_enabled', 'sms_enabled',
            'party_invites', 'party_updates', 'friend_requests', 'video_updates',
            'system_updates', 'billing_notifications', 'security_alerts', 'marketing_emails',
            'email_frequency', 'push_token', 'push_device_type',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_quiet_hours_start(self, value):
        """Validate quiet hours start time"""
        return value
    
    def validate_quiet_hours_end(self, value):
        """Validate quiet hours end time"""
        return value
    
    def validate_timezone(self, value):
        """Validate timezone"""
        import pytz
        try:
            pytz.timezone(value)
        except pytz.exceptions.UnknownTimeZoneError:
            raise serializers.ValidationError("Invalid timezone")
        return value


class NotificationDeliverySerializer(serializers.ModelSerializer):
    """Notification delivery serializer"""
    
    can_retry = serializers.ReadOnlyField()
    notification_title = serializers.CharField(source='notification.title', read_only=True)
    
    class Meta:
        model = NotificationDelivery
        fields = [
            'id', 'notification', 'notification_title', 'channel', 'status',
            'provider_message_id', 'recipient_address', 'attempts', 'max_attempts',
            'error_message', 'error_code', 'can_retry',
            'created_at', 'sent_at', 'delivered_at', 'failed_at', 'next_retry_at'
        ]
        read_only_fields = [
            'id', 'can_retry', 'notification_title', 'created_at',
            'sent_at', 'delivered_at', 'failed_at'
        ]


class NotificationQueueSerializer(serializers.ModelSerializer):
    """Notification queue serializer"""
    
    progress_percentage = serializers.ReadOnlyField()
    success_rate = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = NotificationQueue
        fields = [
            'id', 'name', 'description', 'status', 'total_notifications',
            'processed_count', 'failed_count', 'scheduled_at', 'priority',
            'started_at', 'completed_at', 'error_message', 'progress_percentage',
            'success_rate', 'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'id', 'progress_percentage', 'success_rate', 'created_by_name',
            'started_at', 'completed_at', 'created_at'
        ]


class NotificationStatsSerializer(serializers.Serializer):
    """Notification statistics serializer"""
    
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    urgent_count = serializers.IntegerField()
    read_rate = serializers.FloatField()
    delivery_rate = serializers.FloatField()
    
    # Channel breakdown
    in_app_delivered = serializers.IntegerField()
    email_delivered = serializers.IntegerField()
    push_delivered = serializers.IntegerField()
    sms_delivered = serializers.IntegerField()
    
    # Time-based stats
    today_count = serializers.IntegerField()
    this_week_count = serializers.IntegerField()
    this_month_count = serializers.IntegerField()


class NotificationActivitySerializer(serializers.Serializer):
    """Notification activity timeline serializer"""
    
    date = serializers.DateField()
    notifications_sent = serializers.IntegerField()
    notifications_read = serializers.IntegerField()
    delivery_rate = serializers.FloatField()
    most_active_template = serializers.CharField()


class BulkNotificationRequestSerializer(serializers.Serializer):
    """Serializer for bulk notification requests"""
    
    template_id = serializers.UUIDField()
    user_filters = serializers.DictField(required=False)
    context_data = serializers.DictField(required=False)
    schedule_at = serializers.DateTimeField(required=False)
    priority = serializers.IntegerField(default=0)
    
    def validate_template_id(self, value):
        """Validate that template exists and is active"""
        if not NotificationTemplate.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Template not found or inactive")
        return value
    
    def validate_user_filters(self, value):
        """Validate user filters"""
        allowed_filters = [
            'is_premium', 'subscription_expiring', 'inactive_days',
            'last_login_before', 'registration_after', 'user_ids'
        ]
        
        for filter_key in value.keys():
            if filter_key not in allowed_filters:
                raise serializers.ValidationError(f"Invalid filter: {filter_key}")
        
        return value


class NotificationAnalyticsSerializer(serializers.Serializer):
    """Notification analytics serializer"""
    
    template_name = serializers.CharField()
    total_sent = serializers.IntegerField()
    total_delivered = serializers.IntegerField()
    total_read = serializers.IntegerField()
    delivery_rate = serializers.FloatField()
    read_rate = serializers.FloatField()
    average_read_time = serializers.FloatField()  # Hours to read
    bounce_rate = serializers.FloatField()
    click_through_rate = serializers.FloatField()


class PushNotificationSerializer(serializers.Serializer):
    """Push notification payload serializer"""
    
    title = serializers.CharField(max_length=200)
    body = serializers.CharField(max_length=500)
    icon = serializers.URLField(required=False)
    badge = serializers.URLField(required=False)
    image = serializers.URLField(required=False)
    data = serializers.DictField(required=False)
    actions = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    tag = serializers.CharField(max_length=100, required=False)
    renotify = serializers.BooleanField(default=False)
    require_interaction = serializers.BooleanField(default=False)
    silent = serializers.BooleanField(default=False)
    timestamp = serializers.DateTimeField(required=False)
    ttl = serializers.IntegerField(required=False)  # Time to live in seconds


class EmailNotificationSerializer(serializers.Serializer):
    """Email notification payload serializer"""
    
    subject = serializers.CharField(max_length=200)
    html_content = serializers.CharField()
    text_content = serializers.CharField(required=False)
    from_email = serializers.EmailField(required=False)
    from_name = serializers.CharField(max_length=100, required=False)
    reply_to = serializers.EmailField(required=False)
    headers = serializers.DictField(required=False)
    attachments = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    template_id = serializers.CharField(required=False)
    template_data = serializers.DictField(required=False)


class SMSNotificationSerializer(serializers.Serializer):
    """SMS notification payload serializer"""
    
    message = serializers.CharField(max_length=1600)  # SMS limit
    from_number = serializers.CharField(max_length=20, required=False)
    media_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False
    )
    scheduled_at = serializers.DateTimeField(required=False)


class NotificationWebhookSerializer(serializers.Serializer):
    """Webhook event serializer for notification status updates"""
    
    notification_id = serializers.UUIDField()
    delivery_id = serializers.UUIDField()
    event_type = serializers.ChoiceField(choices=[
        'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed'
    ])
    timestamp = serializers.DateTimeField()
    provider_data = serializers.DictField(required=False)
    user_agent = serializers.CharField(required=False)
    ip_address = serializers.IPAddressField(required=False)
