"""
Notifications models for Watch Party Backend with enhanced features
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.template import Template, Context
from apps.parties.models import WatchParty
from apps.videos.models import Video

User = get_user_model()


class NotificationTemplate(models.Model):
    """Templates for different types of notifications with rich formatting"""
    
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
        ('weekly_digest', 'Weekly Digest'),
        ('content_recommendation', 'Content Recommendation'),
        ('achievement_unlocked', 'Achievement Unlocked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, unique=True)
    
    # Template content
    title_template = models.CharField(max_length=200, verbose_name='Title Template')
    content_template = models.TextField(verbose_name='Content Template')
    html_template = models.TextField(blank=True, verbose_name='Rich HTML Template')
    email_subject_template = models.CharField(max_length=200, blank=True, verbose_name='Email Subject Template')
    email_content_template = models.TextField(blank=True, verbose_name='Email Content Template')
    email_html_template = models.TextField(blank=True, verbose_name='Email HTML Template')
    
    # Push notification templates
    push_title_template = models.CharField(max_length=100, blank=True, verbose_name='Push Title Template')
    push_body_template = models.CharField(max_length=200, blank=True, verbose_name='Push Body Template')
    
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
    send_email = models.BooleanField(default=False, verbose_name='Send Email by Default')
    send_push = models.BooleanField(default=True, verbose_name='Send Push Notification by Default')
    
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
    
    def render_content(self, context_data):
        """Render template with context data"""
        context = Context(context_data)
        
        title = Template(self.title_template).render(context)
        content = Template(self.content_template).render(context)
        html_content = Template(self.html_template).render(context) if self.html_template else ''
        
        result = {
            'title': title,
            'content': content,
            'html_content': html_content,
        }
        
        if self.email_subject_template:
            result['email_subject'] = Template(self.email_subject_template).render(context)
        if self.email_content_template:
            result['email_content'] = Template(self.email_content_template).render(context)
        if self.email_html_template:
            result['email_html'] = Template(self.email_html_template).render(context)
        if self.push_title_template:
            result['push_title'] = Template(self.push_title_template).render(context)
        if self.push_body_template:
            result['push_body'] = Template(self.push_body_template).render(context)
            
        return result


class NotificationChannel(models.Model):
    """Different channels for delivering notifications"""
    
    CHANNEL_TYPES = [
        ('in_app', 'In-App Notification'),
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('sms', 'SMS'),
        ('webhook', 'Webhook'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, default='Default Channel')
    channel_type = models.CharField(max_length=20, choices=CHANNEL_TYPES, default='email')
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict, blank=True)  # Channel-specific config
    delivery_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'notification_channels'
        ordering = ['delivery_order', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.get_channel_type_display()})"


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
        ('processing', 'Processing'),
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
    html_content = models.TextField(blank=True, verbose_name='Rich HTML Content')
    
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
    
    # Delivery channels
    send_email = models.BooleanField(default=False)
    send_push = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name='Scheduled For')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Sent At')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Delivered At')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Read At')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Expires At')
    
    # Retry and error tracking
    retry_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True)
    
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
            models.Index(fields=['status', 'scheduled_at']),
        ]
        
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.status = 'read'
            self.save(update_fields=['is_read', 'read_at', 'status'])
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        if self.status == 'sent':
            self.status = 'delivered'
            self.delivered_at = timezone.now()
            self.save(update_fields=['status', 'delivered_at'])


class NotificationDelivery(models.Model):
    """Track notification delivery across different channels"""
    
    DELIVERY_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='deliveries')
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE)
    
    # Delivery tracking
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='pending')
    external_id = models.CharField(max_length=200, blank=True)  # ID from external service
    
    # Timing
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'notification_deliveries'
        unique_together = ('notification', 'channel')
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['notification', 'status']),
        ]
        
    def __str__(self):
        return f"{self.notification.title} via {self.channel.name} - {self.status}"


class NotificationBatch(models.Model):
    """Batch notification sending for campaigns and announcements"""
    
    BATCH_STATUS = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Content
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    html_content = models.TextField(blank=True)
    
    # Targeting
    target_users = models.ManyToManyField(User, blank=True)
    target_criteria = models.JSONField(default=dict, blank=True)  # Dynamic user targeting
    
    # Status and timing
    status = models.CharField(max_length=20, choices=BATCH_STATUS, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    delivered_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_batches')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_batches'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Batch: {self.name} ({self.status})"


class NotificationAnalytics(models.Model):
    """Analytics data for notification performance"""
    
    date = models.DateField()
    notification_type = models.CharField(max_length=50, blank=True)
    
    # Delivery statistics
    total_sent = models.PositiveIntegerField(default=0)
    total_delivered = models.PositiveIntegerField(default=0)
    total_failed = models.PositiveIntegerField(default=0)
    total_read = models.PositiveIntegerField(default=0)
    total_clicked = models.PositiveIntegerField(default=0)
    
    # Channel breakdown
    in_app_sent = models.PositiveIntegerField(default=0)
    email_sent = models.PositiveIntegerField(default=0)
    push_sent = models.PositiveIntegerField(default=0)
    sms_sent = models.PositiveIntegerField(default=0)
    
    # Rates
    delivery_rate = models.FloatField(default=0.0)
    read_rate = models.FloatField(default=0.0)
    click_rate = models.FloatField(default=0.0)
    
    # Performance metrics
    avg_delivery_time_seconds = models.FloatField(default=0.0)
    avg_read_time_minutes = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_analytics'
        unique_together = ('date', 'notification_type')
        indexes = [
            models.Index(fields=['-date']),
            models.Index(fields=['notification_type', '-date']),
        ]
        
    def __str__(self):
        return f"Analytics: {self.date} - {self.notification_type or 'All'}"


class PushSubscription(models.Model):
    """Web push notification subscriptions"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField()
    p256dh_key = models.TextField()
    auth_key = models.TextField()
    
    # Device info
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # desktop, mobile, tablet
    
    # Status
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'push_subscriptions'
        unique_together = ('user', 'endpoint')
        
    def __str__(self):
        return f"{self.user.username} - Push Subscription"
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
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
        db_table = 'user_notification_preferences'
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
