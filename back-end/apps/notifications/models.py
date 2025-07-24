"""
Notifications models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.parties.models import WatchParty
from apps.videos.models import Video

User = get_user_model()


class NotificationTemplate(models.Model):
    """Templates for different types of notifications"""
    
    NOTIFICATION_TYPES = [
        ('party_invite', 'Party Invitation'),
        ('party_started', 'Party Started'),
        ('party_reminder', 'Party Reminder'),
        ('friend_request', 'Friend Request'),
        ('friend_accepted', 'Friend Request Accepted'),
        ('video_uploaded', 'Video Uploaded'),
        ('video_processed', 'Video Processing Complete'),
        ('comment_reply', 'Comment Reply'),
        ('system_update', 'System Update'),
        ('subscription_expiring', 'Subscription Expiring'),
        ('subscription_expired', 'Subscription Expired'),
        ('payment_success', 'Payment Successful'),
        ('payment_failed', 'Payment Failed'),
        ('account_security', 'Account Security Alert'),
        ('maintenance_notice', 'Maintenance Notice'),
        ('feature_announcement', 'New Feature'),
        ('community_update', 'Community Update'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, unique=True)
    
    # Template content
    title_template = models.CharField(max_length=200, verbose_name='Title Template')
    content_template = models.TextField(verbose_name='Content Template')
    email_subject_template = models.CharField(max_length=200, blank=True, verbose_name='Email Subject Template')
    email_content_template = models.TextField(blank=True, verbose_name='Email Content Template')
    
    # Display settings
    icon = models.CharField(max_length=50, blank=True, verbose_name='Icon Class')
    color = models.CharField(max_length=20, default='blue', verbose_name='Notification Color')
    priority = models.CharField(
        max_length=20, 
        choices=[('low', 'Low'), ('normal', 'Normal'), ('high', 'High'), ('urgent', 'Urgent')],
        default='normal'
    )
    
    # Delivery settings
    can_disable = models.BooleanField(default=True, verbose_name='Users Can Disable')
    requires_action = models.BooleanField(default=False, verbose_name='Requires User Action')
    auto_expire_hours = models.PositiveIntegerField(null=True, blank=True, verbose_name='Auto Expire (hours)')
    
    # Metadata
    is_active = models.BooleanField(default=True, verbose_name='Template Active')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
        
    def __str__(self):
        return f"{self.get_notification_type_display()} Template"


class Notification(models.Model):
    """Individual notifications sent to users"""
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('dismissed', 'Dismissed'),
        ('expired', 'Expired'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    
    # Content
    title = models.CharField(max_length=200, verbose_name='Notification Title')
    content = models.TextField(verbose_name='Notification Content')
    
    # Related objects
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    related_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='related_notifications', null=True, blank=True)
    
    # Display settings
    icon = models.CharField(max_length=50, blank=True, verbose_name='Icon Class')
    color = models.CharField(max_length=20, default='blue', verbose_name='Notification Color')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    # Action settings
    action_url = models.URLField(blank=True, verbose_name='Action URL')
    action_text = models.CharField(max_length=50, blank=True, verbose_name='Action Button Text')
    requires_action = models.BooleanField(default=False, verbose_name='Requires User Action')
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_read = models.BooleanField(default=False, verbose_name='Read Status')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name='Scheduled For')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Sent At')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Delivered At')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Read At')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Expires At')
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True, verbose_name='Additional Metadata')
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['scheduled_at']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['priority']),
        ]
        
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.status = 'read'
            self.save()
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        if self.status in ['pending', 'sent']:
            self.status = 'delivered'
            self.delivered_at = timezone.now()
            self.save()
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        if self.status == 'pending':
            self.status = 'sent'
            self.sent_at = timezone.now()
            self.save()
    
    def mark_as_failed(self):
        """Mark notification as failed"""
        self.status = 'failed'
        self.save()
    
    @property
    def is_expired(self):
        """Check if notification has expired"""
        return self.expires_at and timezone.now() > self.expires_at
    
    @property
    def time_since_created(self):
        """Get time since notification was created"""
        return timezone.now() - self.created_at
    
    @property
    def is_urgent(self):
        """Check if notification is urgent priority"""
        return self.priority == 'urgent'


class NotificationPreferences(models.Model):
    """User notification preferences"""
    
    CHANNEL_CHOICES = [
        ('in_app', 'In-App Notifications'),
        ('email', 'Email Notifications'),
        ('push', 'Push Notifications'),
        ('sms', 'SMS Notifications'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Global settings
    notifications_enabled = models.BooleanField(default=True, verbose_name='Enable Notifications')
    quiet_hours_start = models.TimeField(null=True, blank=True, verbose_name='Quiet Hours Start')
    quiet_hours_end = models.TimeField(null=True, blank=True, verbose_name='Quiet Hours End')
    user_timezone = models.CharField(max_length=50, default='UTC', verbose_name='User Timezone')
    
    # Channel preferences
    in_app_enabled = models.BooleanField(default=True, verbose_name='In-App Notifications')
    email_enabled = models.BooleanField(default=True, verbose_name='Email Notifications')
    push_enabled = models.BooleanField(default=False, verbose_name='Push Notifications')
    sms_enabled = models.BooleanField(default=False, verbose_name='SMS Notifications')
    
    # Category preferences
    party_invites = models.BooleanField(default=True, verbose_name='Party Invitations')
    party_updates = models.BooleanField(default=True, verbose_name='Party Updates')
    friend_requests = models.BooleanField(default=True, verbose_name='Friend Requests')
    video_updates = models.BooleanField(default=True, verbose_name='Video Updates')
    system_updates = models.BooleanField(default=True, verbose_name='System Updates')
    billing_notifications = models.BooleanField(default=True, verbose_name='Billing Notifications')
    security_alerts = models.BooleanField(default=True, verbose_name='Security Alerts')
    marketing_emails = models.BooleanField(default=False, verbose_name='Marketing Emails')
    
    # Email frequency settings
    email_frequency = models.CharField(
        max_length=20,
        choices=[
            ('instant', 'Instant'),
            ('hourly', 'Hourly Digest'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('never', 'Never'),
        ],
        default='instant'
    )
    
    # Push notification settings
    push_token = models.CharField(max_length=500, blank=True, verbose_name='Push Token')
    push_device_type = models.CharField(max_length=20, blank=True, verbose_name='Device Type')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preferences'
        verbose_name_plural = 'Notification Preferences'
        
    def __str__(self):
        return f"Preferences for {self.user.full_name}"
    
    def is_channel_enabled(self, channel):
        """Check if a notification channel is enabled"""
        channel_map = {
            'in_app': self.in_app_enabled,
            'email': self.email_enabled,
            'push': self.push_enabled,
            'sms': self.sms_enabled,
        }
        return self.notifications_enabled and channel_map.get(channel, False)
    
    def is_category_enabled(self, category):
        """Check if a notification category is enabled"""
        category_map = {
            'party_invite': self.party_invites,
            'party_started': self.party_updates,
            'party_reminder': self.party_updates,
            'friend_request': self.friend_requests,
            'friend_accepted': self.friend_requests,
            'video_uploaded': self.video_updates,
            'video_processed': self.video_updates,
            'system_update': self.system_updates,
            'subscription_expiring': self.billing_notifications,
            'subscription_expired': self.billing_notifications,
            'payment_success': self.billing_notifications,
            'payment_failed': self.billing_notifications,
            'account_security': self.security_alerts,
        }
        return category_map.get(category, True)
    
    def is_quiet_time(self):
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_start or not self.quiet_hours_end:
            return False
        
        now = timezone.now().time()
        
        # Handle quiet hours that span midnight
        if self.quiet_hours_start > self.quiet_hours_end:
            return now >= self.quiet_hours_start or now <= self.quiet_hours_end
        else:
            return self.quiet_hours_start <= now <= self.quiet_hours_end


class NotificationDelivery(models.Model):
    """Track notification delivery across different channels"""
    
    DELIVERY_CHANNELS = [
        ('in_app', 'In-App'),
        ('email', 'Email'),
        ('push', 'Push'),
        ('sms', 'SMS'),
    ]
    
    DELIVERY_STATUS = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='deliveries')
    
    # Delivery details
    channel = models.CharField(max_length=20, choices=DELIVERY_CHANNELS)
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='pending')
    
    # Channel-specific identifiers
    provider_message_id = models.CharField(max_length=200, blank=True, verbose_name='Provider Message ID')
    recipient_address = models.CharField(max_length=200, blank=True, verbose_name='Recipient Address')
    
    # Delivery tracking
    attempts = models.PositiveIntegerField(default=0, verbose_name='Delivery Attempts')
    max_attempts = models.PositiveIntegerField(default=3, verbose_name='Max Attempts')
    
    # Error handling
    error_message = models.TextField(blank=True, verbose_name='Error Message')
    error_code = models.CharField(max_length=50, blank=True, verbose_name='Error Code')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Sent At')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Delivered At')
    failed_at = models.DateTimeField(null=True, blank=True, verbose_name='Failed At')
    next_retry_at = models.DateTimeField(null=True, blank=True, verbose_name='Next Retry At')
    
    class Meta:
        db_table = 'notification_deliveries'
        verbose_name = 'Notification Delivery'
        verbose_name_plural = 'Notification Deliveries'
        unique_together = ['notification', 'channel']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['channel', 'status']),
            models.Index(fields=['next_retry_at']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return f"{self.notification.title} via {self.channel} - {self.status}"
    
    def mark_as_sent(self):
        """Mark delivery as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        """Mark delivery as delivered"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_message='', error_code=''):
        """Mark delivery as failed"""
        self.status = 'failed'
        self.failed_at = timezone.now()
        self.error_message = error_message
        self.error_code = error_code
        self.attempts += 1
        
        # Schedule retry if attempts remaining
        if self.attempts < self.max_attempts:
            retry_delay = min(2 ** self.attempts * 60, 3600)  # Exponential backoff, max 1 hour
            self.next_retry_at = timezone.now() + timezone.timedelta(seconds=retry_delay)
        
        self.save()
    
    @property
    def can_retry(self):
        """Check if delivery can be retried"""
        return (
            self.status == 'failed' and 
            self.attempts < self.max_attempts and 
            self.next_retry_at and 
            timezone.now() >= self.next_retry_at
        )


class NotificationQueue(models.Model):
    """Queue for batch processing of notifications"""
    
    QUEUE_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Queue details
    name = models.CharField(max_length=100, verbose_name='Queue Name')
    description = models.TextField(blank=True, verbose_name='Description')
    status = models.CharField(max_length=20, choices=QUEUE_STATUS, default='pending')
    
    # Processing details
    total_notifications = models.PositiveIntegerField(default=0, verbose_name='Total Notifications')
    processed_count = models.PositiveIntegerField(default=0, verbose_name='Processed Count')
    failed_count = models.PositiveIntegerField(default=0, verbose_name='Failed Count')
    
    # Scheduling
    scheduled_at = models.DateTimeField(verbose_name='Scheduled At')
    priority = models.IntegerField(default=0, verbose_name='Priority')
    
    # Processing tracking
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Started At')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Completed At')
    
    # Error handling
    error_message = models.TextField(blank=True, verbose_name='Error Message')
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_queues', null=True, blank=True)
    
    class Meta:
        db_table = 'notification_queues'
        verbose_name = 'Notification Queue'
        verbose_name_plural = 'Notification Queues'
        ordering = ['-priority', 'scheduled_at']
        indexes = [
            models.Index(fields=['status', 'scheduled_at']),
            models.Index(fields=['priority', 'scheduled_at']),
        ]
        
    def __str__(self):
        return f"Queue: {self.name} ({self.status})"
    
    @property
    def progress_percentage(self):
        """Calculate processing progress percentage"""
        if self.total_notifications == 0:
            return 0
        return round((self.processed_count / self.total_notifications) * 100, 2)
    
    @property
    def success_rate(self):
        """Calculate success rate percentage"""
        if self.processed_count == 0:
            return 0
        successful = self.processed_count - self.failed_count
        return round((successful / self.processed_count) * 100, 2)


class NotificationChannel(models.Model):
    """User notification channel preferences"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_channels')
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True, verbose_name='Email Notifications')
    push_enabled = models.BooleanField(default=True, verbose_name='Push Notifications')
    sms_enabled = models.BooleanField(default=False, verbose_name='SMS Notifications')
    in_app_enabled = models.BooleanField(default=True, verbose_name='In-App Notifications')
    
    # Specific notification type preferences
    party_invites = models.BooleanField(default=True, verbose_name='Party Invitations')
    party_updates = models.BooleanField(default=True, verbose_name='Party Updates')
    friend_requests = models.BooleanField(default=True, verbose_name='Friend Requests')
    video_uploads = models.BooleanField(default=True, verbose_name='Video Upload Notifications')
    system_updates = models.BooleanField(default=True, verbose_name='System Updates')
    marketing = models.BooleanField(default=False, verbose_name='Marketing Communications')
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False, verbose_name='Enable Quiet Hours')
    quiet_start_time = models.TimeField(null=True, blank=True, verbose_name='Quiet Start Time')
    quiet_end_time = models.TimeField(null=True, blank=True, verbose_name='Quiet End Time')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    class Meta:
        db_table = 'notification_channels'
        verbose_name = 'Notification Channel'
        verbose_name_plural = 'Notification Channels'
    
    def __str__(self):
        return f"Notification preferences for {self.user.username}"
    
    def is_enabled_for_type(self, notification_type: str) -> bool:
        """Check if notifications are enabled for a specific type"""
        type_mapping = {
            'party_invite': self.party_invites,
            'party_started': self.party_updates,
            'party_reminder': self.party_updates,
            'friend_request': self.friend_requests,
            'friend_accepted': self.friend_requests,
            'video_uploaded': self.video_uploads,
            'video_processed': self.video_uploads,
            'system_update': self.system_updates,
            'maintenance_notice': self.system_updates,
            'feature_announcement': self.marketing,
            'community_update': self.marketing,
        }
        return type_mapping.get(notification_type, True)
    
    def is_in_quiet_hours(self) -> bool:
        """Check if current time is within quiet hours"""
        if not self.quiet_hours_enabled or not self.quiet_start_time or not self.quiet_end_time:
            return False
        
        current_time = timezone.now().time()
        
        if self.quiet_start_time <= self.quiet_end_time:
            # Same day quiet hours (e.g., 10 PM to 8 AM)
            return self.quiet_start_time <= current_time <= self.quiet_end_time
        else:
            # Cross-midnight quiet hours (e.g., 10 PM to 8 AM next day)
            return current_time >= self.quiet_start_time or current_time <= self.quiet_end_time


class PushSubscription(models.Model):
    """Push notification subscription for users"""
    
    PLATFORM_CHOICES = [
        ('web', 'Web Browser'),
        ('android', 'Android'),
        ('ios', 'iOS'),
        ('desktop', 'Desktop'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    
    # Push subscription details
    endpoint = models.URLField(verbose_name='Push Endpoint')
    p256dh_key = models.TextField(verbose_name='P256DH Key')
    auth_key = models.TextField(verbose_name='Auth Key')
    
    # Device/Browser information
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='web')
    device_name = models.CharField(max_length=100, blank=True, verbose_name='Device Name')
    user_agent = models.TextField(blank=True, verbose_name='User Agent')
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    
    # Firebase Cloud Messaging (for mobile)
    fcm_token = models.TextField(blank=True, verbose_name='FCM Token')
    apns_token = models.TextField(blank=True, verbose_name='APNS Token')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    last_used = models.DateTimeField(default=timezone.now, verbose_name='Last Used')
    
    class Meta:
        db_table = 'push_subscriptions'
        verbose_name = 'Push Subscription'
        verbose_name_plural = 'Push Subscriptions'
        unique_together = ['user', 'endpoint']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['platform', 'is_active']),
        ]
    
    def __str__(self):
        return f"Push subscription for {self.user.username} ({self.platform})"
    
    def deactivate(self):
        """Deactivate the push subscription"""
        self.is_active = False
        self.save()
    
    def update_last_used(self):
        """Update the last used timestamp"""
        self.last_used = timezone.now()
        self.save(update_fields=['last_used'])
