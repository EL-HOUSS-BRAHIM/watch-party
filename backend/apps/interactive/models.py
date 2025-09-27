"""
Models for the Interactive app.
Handles real-time interactive features for watch parties.
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class LiveReaction(models.Model):
    """Model for live reactions during video playback"""
    
    REACTION_CHOICES = [
        ('laugh', 'Laugh 😂'),
        ('love', 'Love ❤️'),
        ('surprise', 'Surprise 😮'),
        ('cry', 'Cry 😢'),
        ('angry', 'Angry 😠'),
        ('thumbs_up', 'Thumbs Up 👍'),
        ('thumbs_down', 'Thumbs Down 👎'),
        ('fire', 'Fire 🔥'),
        ('clap', 'Clap 👏'),
        ('mind_blown', 'Mind Blown 🤯'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_reactions')
    party = models.ForeignKey('parties.WatchParty', on_delete=models.CASCADE, related_name='live_reactions')
    reaction = models.CharField(max_length=20, choices=REACTION_CHOICES)
    position_x = models.FloatField(help_text="X position on screen (0-1)")
    position_y = models.FloatField(help_text="Y position on screen (0-1)")
    video_timestamp = models.FloatField(help_text="Video timestamp when reaction was made")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_live_reactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['party', 'created_at']),
            models.Index(fields=['video_timestamp']),
            models.Index(fields=['user', 'party']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.reaction} at {self.video_timestamp}s"


class VoiceChatRoom(models.Model):
    """Model for voice chat rooms in watch parties"""
    
    AUDIO_QUALITY_CHOICES = [
        ('low', 'Low (8kHz)'),
        ('medium', 'Medium (16kHz)'),
        ('high', 'High (32kHz)'),
        ('ultra', 'Ultra (48kHz)'),
    ]
    
    id = models.AutoField(primary_key=True)
    party = models.OneToOneField('parties.WatchParty', on_delete=models.CASCADE, related_name='voice_chat_room')
    max_participants = models.IntegerField(default=50)
    require_permission = models.BooleanField(default=False, help_text="Require host permission to join")
    audio_quality = models.CharField(max_length=10, choices=AUDIO_QUALITY_CHOICES, default='medium')
    noise_cancellation = models.BooleanField(default=True)
    echo_cancellation = models.BooleanField(default=True)
    ice_servers = models.JSONField(default=list, help_text="WebRTC ICE servers configuration")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_voice_chat_rooms'
        
    def __str__(self):
        return f"Voice Chat - {self.party.name}"


class VoiceChatParticipant(models.Model):
    """Model for voice chat participants"""
    
    id = models.AutoField(primary_key=True)
    room = models.ForeignKey(VoiceChatRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_chat_sessions')
    peer_id = models.CharField(max_length=255, help_text="WebRTC peer ID")
    is_connected = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_voice_chat_participants'
        unique_together = [['room', 'user']]
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['room', 'is_connected']),
            models.Index(fields=['user', 'joined_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} in {self.room.party.name}"


class ScreenShare(models.Model):
    """Model for screen sharing sessions"""
    
    SHARE_TYPE_CHOICES = [
        ('screen', 'Full Screen'),
        ('window', 'Application Window'),
        ('tab', 'Browser Tab'),
    ]
    
    share_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='screen_shares')
    party = models.ForeignKey('parties.WatchParty', on_delete=models.CASCADE, related_name='screen_shares')
    title = models.CharField(max_length=255, help_text="Screen share title")
    description = models.TextField(blank=True)
    share_type = models.CharField(max_length=10, choices=SHARE_TYPE_CHOICES, default='screen')
    resolution = models.CharField(max_length=20, default='1920x1080', help_text="Resolution (e.g., 1920x1080)")
    frame_rate = models.IntegerField(default=30, help_text="Frames per second")
    viewer_count = models.IntegerField(default=0)
    viewers_can_annotate = models.BooleanField(default=False)
    allow_remote_control = models.BooleanField(default=False)
    is_recording = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    ice_servers = models.JSONField(default=list, help_text="WebRTC ICE servers configuration")
    
    class Meta:
        db_table = 'interactive_screen_shares'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['party', 'is_active']),
            models.Index(fields=['user', 'started_at']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.user.username}"


class InteractivePoll(models.Model):
    """Model for interactive polls during watch parties"""
    
    POLL_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('text', 'Text Response'),
        ('rating', 'Rating Scale'),
        ('yes_no', 'Yes/No'),
    ]
    
    poll_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_polls')
    party = models.ForeignKey('parties.WatchParty', on_delete=models.CASCADE, related_name='interactive_polls')
    question = models.TextField(help_text="Poll question")
    poll_type = models.CharField(max_length=20, choices=POLL_TYPE_CHOICES, default='multiple_choice')
    options = models.JSONField(default=list, help_text="Poll options for multiple choice")
    min_rating = models.IntegerField(default=1, help_text="Minimum rating value")
    max_rating = models.IntegerField(default=5, help_text="Maximum rating value")
    allows_multiple = models.BooleanField(default=False, help_text="Allow multiple selections")
    video_timestamp = models.FloatField(null=True, blank=True, help_text="Video timestamp when poll was created")
    expires_at = models.DateTimeField(help_text="When the poll expires")
    is_published = models.BooleanField(default=False)
    total_responses = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_polls'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['party', 'is_published']),
            models.Index(fields=['creator', 'created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Poll: {self.question[:50]}..."
    
    def is_expired(self):
        return self.expires_at <= timezone.now()
    
    def publish(self):
        self.is_published = True
        self.save()


class PollResponse(models.Model):
    """Model for poll responses"""
    
    id = models.AutoField(primary_key=True)
    poll = models.ForeignKey(InteractivePoll, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_responses')
    selected_option = models.IntegerField(null=True, blank=True, help_text="Index of selected option")
    text_response = models.TextField(blank=True, help_text="Text response for text polls")
    rating_value = models.IntegerField(null=True, blank=True, help_text="Rating value for rating polls")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_poll_responses'
        unique_together = [['poll', 'user']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['poll', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} response to {self.poll.question[:30]}..."


class InteractiveAnnotation(models.Model):
    """Model for annotations on screen shares"""
    
    ANNOTATION_TYPE_CHOICES = [
        ('arrow', 'Arrow'),
        ('rectangle', 'Rectangle'),
        ('circle', 'Circle'),
        ('text', 'Text'),
        ('freehand', 'Freehand Drawing'),
        ('highlight', 'Highlight'),
    ]
    
    annotation_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotations')
    screen_share = models.ForeignKey(ScreenShare, on_delete=models.CASCADE, related_name='annotations')
    annotation_type = models.CharField(max_length=20, choices=ANNOTATION_TYPE_CHOICES)
    position_x = models.FloatField(help_text="X position (0-1)")
    position_y = models.FloatField(help_text="Y position (0-1)")
    width = models.FloatField(default=0.1, help_text="Width (0-1)")
    height = models.FloatField(default=0.1, help_text="Height (0-1)")
    content = models.TextField(blank=True, help_text="Text content for text annotations")
    color = models.CharField(max_length=7, default='#FF0000', help_text="Hex color code")
    stroke_width = models.IntegerField(default=2, help_text="Stroke width in pixels")
    is_visible = models.BooleanField(default=True)
    expires_at = models.DateTimeField(default=timezone.now, help_text="When annotation expires")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_annotations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['screen_share', 'is_visible']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.annotation_type} by {self.user.username}"


class InteractiveSession(models.Model):
    """Model to track interactive session statistics"""
    
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactive_sessions')
    party = models.ForeignKey('parties.WatchParty', on_delete=models.CASCADE, related_name='interactive_sessions')
    reactions_sent = models.IntegerField(default=0)
    voice_chat_duration = models.DurationField(default=timezone.timedelta)
    screen_shares_initiated = models.IntegerField(default=0)
    polls_participated = models.IntegerField(default=0)
    annotations_created = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_sessions'
        unique_together = [['user', 'party']]
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['party', 'started_at']),
            models.Index(fields=['user', 'started_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} session in {self.party.name}"
