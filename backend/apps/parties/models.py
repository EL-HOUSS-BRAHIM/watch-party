"""
Watch Party models for Watch Party Backend
"""

import uuid
import secrets
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.videos.models import Video

User = get_user_model()


class WatchParty(models.Model):
    """Watch Party model"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('paused', 'Paused'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('friends', 'Friends Only'),
        ('private', 'Private'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name='Party Title')
    description = models.TextField(blank=True, verbose_name='Description')
    
    # Host and participants
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_parties')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='parties', null=True, blank=True)
    
    # Movie selection from Google Drive (alternative to video field)
    gdrive_file_id = models.CharField(max_length=255, blank=True, verbose_name='Google Drive File ID')
    movie_title = models.CharField(max_length=200, blank=True, verbose_name='Movie Title')
    movie_duration = models.DurationField(null=True, blank=True, verbose_name='Movie Duration')
    
    # Party settings
    room_code = models.CharField(max_length=10, unique=True, verbose_name='Room Code')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    max_participants = models.PositiveIntegerField(default=50, verbose_name='Max Participants')
    require_approval = models.BooleanField(default=False, verbose_name='Require Host Approval')
    allow_join_by_code = models.BooleanField(default=True, verbose_name='Allow Join by Room Code')
    
    # Invite settings
    invite_code = models.CharField(max_length=20, unique=True, blank=True, verbose_name='Shareable Invite Code')
    invite_code_expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Invite Code Expiry')
    allow_public_search = models.BooleanField(default=True, verbose_name='Allow in Public Search')
    
    # Analytics fields
    total_viewers = models.PositiveIntegerField(default=0, verbose_name='Total Unique Viewers')
    peak_concurrent_viewers = models.PositiveIntegerField(default=0, verbose_name='Peak Concurrent Viewers')
    total_reactions = models.PositiveIntegerField(default=0, verbose_name='Total Reactions')
    total_chat_messages = models.PositiveIntegerField(default=0, verbose_name='Total Chat Messages')
    
    # Chat settings
    allow_chat = models.BooleanField(default=True, verbose_name='Allow Chat')
    allow_reactions = models.BooleanField(default=True, verbose_name='Allow Reactions')
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_start = models.DateTimeField(null=True, blank=True, verbose_name='Scheduled Start Time')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Actually Started At')
    ended_at = models.DateTimeField(null=True, blank=True, verbose_name='Ended At')
    
    # Video synchronization
    current_timestamp = models.DurationField(default=timezone.timedelta(0), verbose_name='Current Video Position')
    is_playing = models.BooleanField(default=False, verbose_name='Is Playing')
    last_sync_at = models.DateTimeField(auto_now=True, verbose_name='Last Sync Update')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'watch_parties'
        ordering = ['-created_at']
        verbose_name = 'Watch Party'
        verbose_name_plural = 'Watch Parties'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['host', 'status']),
            models.Index(fields=['visibility', 'status']),
            models.Index(fields=['scheduled_start']),
            models.Index(fields=['room_code']),
        ]
        
    def __str__(self):
        return f"{self.title} by {self.host.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.room_code:
            self.room_code = self.generate_room_code()
        if not self.invite_code:
            self.invite_code = self.generate_invite_code()
        super().save(*args, **kwargs)
    
    def generate_room_code(self):
        """Generate unique room code"""
        while True:
            code = secrets.token_hex(4).upper()
            if not WatchParty.objects.filter(room_code=code).exists():
                return code
    
    def generate_invite_code(self):
        """Generate unique shareable invite code"""
        while True:
            code = secrets.token_urlsafe(12)
            if not WatchParty.objects.filter(invite_code=code).exists():
                return code
    
    @property
    def participant_count(self):
        return self.participants.filter(is_active=True).count()
    
    @property
    def is_full(self):
        return self.participant_count >= self.max_participants
    
    @property
    def is_invite_code_valid(self):
        if not self.invite_code_expires_at:
            return True
        return timezone.now() < self.invite_code_expires_at


class PartyParticipant(models.Model):
    """Party participant model"""
    
    ROLE_CHOICES = [
        ('participant', 'Participant'),
        ('moderator', 'Moderator'),
        ('host', 'Host'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('kicked', 'Kicked'),
        ('left', 'Left'),
    ]
    
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='party_participations')
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    is_active = models.BooleanField(default=True, verbose_name='Currently Active')
    
    # Participation tracking
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    last_seen = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'party_participants'
        unique_together = [['party', 'user']]
        verbose_name = 'Party Participant'
        verbose_name_plural = 'Party Participants'
        
    def __str__(self):
        return f"{self.user.full_name} in {self.party.title}"


class PartyReaction(models.Model):
    """Party reaction model for live reactions during video"""
    
    REACTION_CHOICES = [
        ('❤️', 'Heart'),
        ('😂', 'Laugh'),
        ('😮', 'Surprise'),
        ('😢', 'Sad'),
        ('😡', 'Angry'),
        ('👏', 'Clap'),
        ('🔥', 'Fire'),
        ('⚽', 'Football'),
        ('🎉', 'Party'),
        ('👍', 'Thumbs Up'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='party_reactions')
    
    emoji = models.CharField(max_length=10, choices=REACTION_CHOICES)
    video_timestamp = models.DurationField(verbose_name='Video Position When Reacted')
    
    # Position on screen for floating effect
    x_position = models.FloatField(default=0.5)  # 0-1 (left to right)
    y_position = models.FloatField(default=0.5)  # 0-1 (top to bottom)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'party_reactions'
        ordering = ['-created_at']
        verbose_name = 'Party Reaction'
        verbose_name_plural = 'Party Reactions'
        
    def __str__(self):
        return f"{self.user.full_name} reacted {self.emoji} in {self.party.title}"


class PartyInvitation(models.Model):
    """Party invitation model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, verbose_name='Invitation Message')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(verbose_name='Invitation Expires At')
    
    class Meta:
        db_table = 'party_invitations'
        unique_together = [['party', 'invitee']]
        ordering = ['-created_at']
        verbose_name = 'Party Invitation'
        verbose_name_plural = 'Party Invitations'
        
    def __str__(self):
        return f"Invitation from {self.inviter.full_name} to {self.invitee.full_name} for {self.party.title}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class PartyReport(models.Model):
    """Report inappropriate content or behavior in parties"""
    
    REPORT_TYPES = [
        ('inappropriate_chat', 'Inappropriate Chat'),
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('copyright', 'Copyright Violation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.ForeignKey(WatchParty, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='party_reports')
    reported_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='reported_in_parties')
    
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    description = models.TextField(verbose_name='Report Description')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, verbose_name='Admin Notes')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'party_reports'
        ordering = ['-created_at']
        verbose_name = 'Party Report'
        verbose_name_plural = 'Party Reports'
        
    def __str__(self):
        return f"Report by {self.reporter.full_name} about {self.party.title}"


class PartyEngagementAnalytics(models.Model):
    """Track detailed analytics for watch parties"""
    
    party = models.OneToOneField(WatchParty, on_delete=models.CASCADE, related_name='engagement_analytics')
    
    # Viewer engagement metrics
    average_watch_time = models.DurationField(null=True, blank=True)
    bounce_rate = models.FloatField(default=0.0, help_text="Percentage who left within first 5 minutes")
    engagement_score = models.FloatField(default=0.0, help_text="Overall engagement score 0-100")
    
    # Content performance
    most_rewound_timestamp = models.DurationField(null=True, blank=True)
    most_paused_timestamp = models.DurationField(null=True, blank=True)
    reaction_hotspots = models.JSONField(default=list, help_text="Timestamps with high reaction activity")
    
    # Social metrics
    chat_activity_score = models.FloatField(default=0.0)
    user_retention_rate = models.FloatField(default=0.0)
    invitation_conversion_rate = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'party_engagement_analytics'
        verbose_name = 'Party Engagement Analytics'
        verbose_name_plural = 'Party Engagement Analytics'
        
    def __str__(self):
        return f"Engagement Analytics for {self.party.title}"