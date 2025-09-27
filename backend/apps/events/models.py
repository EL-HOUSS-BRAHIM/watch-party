from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator

User = get_user_model()


class Event(models.Model):
    """
    Event model for managing watch party events
    """
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('friends_only', 'Friends Only'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, help_text="Physical or virtual location")
    max_attendees = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1)],
        help_text="Leave blank for unlimited attendees"
    )
    require_approval = models.BooleanField(default=False)
    privacy = models.CharField(max_length=20, choices=PRIVACY_CHOICES, default='public')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    
    # Event details
    banner_image = models.URLField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['start_time']),
            models.Index(fields=['status']),
            models.Index(fields=['organizer']),
            models.Index(fields=['privacy']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def is_upcoming(self):
        return self.start_time > timezone.now()
    
    @property
    def is_ongoing(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time
    
    @property
    def is_past(self):
        return self.end_time < timezone.now()
    
    @property
    def attendee_count(self):
        return self.attendees.filter(status='attending').count()
    
    @property
    def is_full(self):
        if self.max_attendees is None:
            return False
        return self.attendee_count >= self.max_attendees


class EventAttendee(models.Model):
    """
    Model for tracking event attendance
    """
    STATUS_CHOICES = [
        ('attending', 'Attending'),
        ('maybe', 'Maybe'),
        ('not_attending', 'Not Attending'),
        ('pending', 'Pending Approval'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rsvp_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional notes from attendee")
    
    class Meta:
        unique_together = ('event', 'user')
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title} ({self.status})"


class EventInvitation(models.Model):
    """
    Model for managing event invitations
    """
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_event_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_event_invitations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    message = models.TextField(blank=True, help_text="Personal message from inviter")
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('event', 'invitee')
        indexes = [
            models.Index(fields=['invitee', 'status']),
            models.Index(fields=['event', 'status']),
        ]
    
    def __str__(self):
        return f"Invitation to {self.invitee.username} for {self.event.title}"
    
    @property
    def is_expired(self):
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at


class EventReminder(models.Model):
    """
    Model for managing event reminders
    """
    REMINDER_TYPES = [
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('sms', 'SMS'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reminders')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_reminders')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPES)
    minutes_before = models.PositiveIntegerField(help_text="Minutes before event start")
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('event', 'user', 'reminder_type', 'minutes_before')
        indexes = [
            models.Index(fields=['event', 'is_sent']),
            models.Index(fields=['user', 'is_sent']),
        ]
    
    def __str__(self):
        return f"Reminder for {self.user.username} - {self.event.title}"
