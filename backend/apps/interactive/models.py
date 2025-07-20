from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()


class LiveReaction(models.Model):
    """Live emoji reactions overlay on videos during watch parties"""
    
    REACTION_TYPES = [
        ('😀', 'Happy'),
        ('😂', 'Laughing'), 
        ('❤️', 'Love'),
        ('😮', 'Surprised'),
        ('😢', 'Sad'),
        ('👍', 'Thumbs Up'),
        ('👎', 'Thumbs Down'),
        ('🔥', 'Fire'),
        ('💯', 'Hundred'),
        ('👏', 'Clap'),
        ('🎉', 'Party'),
        ('😍', 'Heart Eyes'),
        ('🤔', 'Thinking'),
        ('😱', 'Shocked'),
        ('🙄', 'Eye Roll'),
    ]
    
    # Core fields
    party = models.ForeignKey('parties.Party', on_delete=models.CASCADE, related_name='live_reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_reactions')
    reaction = models.CharField(max_length=4, choices=REACTION_TYPES)
    
    # Video timing
    video_timestamp = models.FloatField(
        help_text="Video timestamp in seconds when reaction was sent"
    )
    
    # Display positioning (for overlay)
    position_x = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="X position as percentage (0-100) of video width",
        null=True, blank=True
    )
    position_y = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Y position as percentage (0-100) of video height", 
        null=True, blank=True
    )
    
    # Animation settings
    animation_type = models.CharField(
        max_length=20,
        choices=[
            ('float_up', 'Float Up'),
            ('bounce', 'Bounce'),
            ('pulse', 'Pulse'),
            ('fade_in', 'Fade In'),
            ('zoom_in', 'Zoom In'),
        ],
        default='float_up'
    )
    duration = models.FloatField(
        default=3.0,
        validators=[MinValueValidator(0.5), MaxValueValidator(10.0)],
        help_text="Animation duration in seconds"
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_live_reaction'
        indexes = [
            models.Index(fields=['party', 'video_timestamp']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.reaction} at {self.video_timestamp}s"


class VoiceChatRoom(models.Model):
    """WebRTC voice chat rooms for watch parties"""
    
    # Core fields
    party = models.OneToOneField('parties.Party', on_delete=models.CASCADE, related_name='voice_chat_room')
    room_id = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Room settings
    is_active = models.BooleanField(default=True)
    max_participants = models.IntegerField(
        default=50,
        validators=[MinValueValidator(2), MaxValueValidator(500)]
    )
    require_permission = models.BooleanField(
        default=False,
        help_text="Require host permission to join voice chat"
    )
    
    # Audio settings
    audio_quality = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low (64kbps)'),
            ('medium', 'Medium (128kbps)'),
            ('high', 'High (256kbps)'),
        ],
        default='medium'
    )
    noise_cancellation = models.BooleanField(default=True)
    echo_cancellation = models.BooleanField(default=True)
    
    # WebRTC configuration
    ice_servers = models.JSONField(
        default=list,
        help_text="STUN/TURN servers configuration"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'interactive_voice_chat_room'
        
    def __str__(self):
        return f"Voice Chat - {self.party.name}"


class VoiceChatParticipant(models.Model):
    """Participants in voice chat rooms"""
    
    room = models.ForeignKey(VoiceChatRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_chat_sessions')
    
    # Connection status
    is_connected = models.BooleanField(default=False)
    is_muted = models.BooleanField(default=False)
    is_speaking = models.BooleanField(default=False)
    
    # Audio settings
    volume_level = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Connection info
    peer_id = models.CharField(max_length=255, blank=True)
    connection_quality = models.CharField(
        max_length=10,
        choices=[
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('poor', 'Poor'),
        ],
        default='good'
    )
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_voice_chat_participant'
        unique_together = ['room', 'user']
        indexes = [
            models.Index(fields=['room', 'is_connected']),
            models.Index(fields=['user', 'joined_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} in {self.room.party.name}"


class ScreenShare(models.Model):
    """Screen sharing sessions for watch parties"""
    
    # Core fields
    party = models.ForeignKey('parties.Party', on_delete=models.CASCADE, related_name='screen_shares')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='screen_shares')
    share_id = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Share settings
    share_type = models.CharField(
        max_length=20,
        choices=[
            ('full_screen', 'Full Screen'),
            ('window', 'Application Window'),
            ('browser_tab', 'Browser Tab'),
        ],
        default='full_screen'
    )
    
    # Stream configuration
    resolution = models.CharField(
        max_length=20,
        choices=[
            ('720p', '1280x720'),
            ('1080p', '1920x1080'),
            ('1440p', '2560x1440'),
            ('4k', '3840x2160'),
        ],
        default='1080p'
    )
    frame_rate = models.IntegerField(
        default=30,
        choices=[(15, '15 FPS'), (30, '30 FPS'), (60, '60 FPS')]
    )
    bitrate = models.IntegerField(
        default=2500,
        help_text="Bitrate in kbps"
    )
    
    # Permissions
    allow_remote_control = models.BooleanField(default=False)
    viewers_can_annotate = models.BooleanField(default=False)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_recording = models.BooleanField(default=False)
    viewer_count = models.IntegerField(default=0)
    
    # WebRTC info
    peer_connection_id = models.CharField(max_length=255, blank=True)
    stream_url = models.URLField(blank=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_screen_share'
        indexes = [
            models.Index(fields=['party', 'is_active']),
            models.Index(fields=['user', 'started_at']),
        ]
    
    def __str__(self):
        return f"Screen Share by {self.user.username} in {self.party.name}"


class InteractivePoll(models.Model):
    """Real-time polls during watch parties"""
    
    POLL_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('yes_no', 'Yes/No'),
        ('rating', 'Rating (1-10)'),
        ('text_input', 'Text Input'),
        ('emoji_reaction', 'Emoji Reaction'),
    ]
    
    # Core fields
    party = models.ForeignKey('parties.Party', on_delete=models.CASCADE, related_name='polls')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_polls')
    poll_id = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Poll content
    question = models.TextField()
    poll_type = models.CharField(max_length=20, choices=POLL_TYPES)
    options = models.JSONField(
        default=list,
        help_text="Poll options for multiple choice polls"
    )
    
    # Display settings
    display_duration = models.IntegerField(
        default=30,
        validators=[MinValueValidator(10), MaxValueValidator(300)],
        help_text="How long to display poll in seconds"
    )
    show_results_live = models.BooleanField(default=True)
    show_results_after = models.BooleanField(default=True)
    
    # Video timing
    video_timestamp = models.FloatField(
        null=True, blank=True,
        help_text="Video timestamp when poll should appear"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    total_responses = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_poll'
        indexes = [
            models.Index(fields=['party', 'is_active']),
            models.Index(fields=['creator', 'created_at']),
            models.Index(fields=['video_timestamp']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Poll: {self.question[:50]}..." if len(self.question) > 50 else f"Poll: {self.question}"
    
    def publish(self):
        """Publish the poll and set expiration"""
        self.is_published = True
        self.published_at = timezone.now()
        if self.display_duration:
            self.expires_at = self.published_at + timezone.timedelta(seconds=self.display_duration)
        self.save()
    
    def is_expired(self):
        """Check if poll has expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at


class PollResponse(models.Model):
    """User responses to interactive polls"""
    
    poll = models.ForeignKey(InteractivePoll, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_responses')
    
    # Response data
    selected_option = models.IntegerField(
        null=True, blank=True,
        help_text="Index of selected option for multiple choice polls"
    )
    rating_value = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Rating value for rating polls"
    )
    text_response = models.TextField(blank=True)
    emoji_reaction = models.CharField(max_length=4, blank=True)
    
    # Metadata
    response_time = models.FloatField(
        null=True, blank=True,
        help_text="Time taken to respond in seconds"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interactive_poll_response'
        unique_together = ['poll', 'user']
        indexes = [
            models.Index(fields=['poll', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} -> {self.poll.question[:30]}..."


class InteractiveAnnotation(models.Model):
    """Annotations and drawings on shared screens"""
    
    ANNOTATION_TYPES = [
        ('draw', 'Free Drawing'),
        ('text', 'Text Note'),
        ('arrow', 'Arrow'),
        ('rectangle', 'Rectangle'),
        ('circle', 'Circle'),
        ('highlight', 'Highlight'),
        ('pointer', 'Pointer'),
    ]
    
    # Core fields
    screen_share = models.ForeignKey(ScreenShare, on_delete=models.CASCADE, related_name='annotations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='annotations')
    annotation_id = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Annotation content
    annotation_type = models.CharField(max_length=15, choices=ANNOTATION_TYPES)
    content = models.TextField(blank=True)  # Text content for text annotations
    
    # Drawing data
    drawing_data = models.JSONField(
        default=dict,
        help_text="SVG path data or shape coordinates"
    )
    
    # Style settings
    color = models.CharField(max_length=7, default='#FF0000')  # Hex color
    stroke_width = models.IntegerField(default=2)
    opacity = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(1.0)]
    )
    
    # Position and timing
    position_data = models.JSONField(default=dict)
    duration = models.FloatField(
        default=10.0,
        help_text="How long annotation stays visible"
    )
    
    # Status
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_annotation'
        indexes = [
            models.Index(fields=['screen_share', 'is_visible']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.annotation_type} by {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.expires_at and self.duration:
            self.expires_at = timezone.now() + timezone.timedelta(seconds=self.duration)
        super().save(*args, **kwargs)


class InteractiveSession(models.Model):
    """Session tracking for interactive features usage"""
    
    party = models.ForeignKey('parties.Party', on_delete=models.CASCADE, related_name='interactive_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactive_sessions')
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    
    # Feature usage
    reactions_sent = models.IntegerField(default=0)
    polls_participated = models.IntegerField(default=0)
    voice_chat_duration = models.IntegerField(default=0, help_text="Duration in seconds")
    screen_shares_initiated = models.IntegerField(default=0)
    annotations_created = models.IntegerField(default=0)
    
    # Session info
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_session'
        unique_together = ['party', 'user']
        indexes = [
            models.Index(fields=['party', 'started_at']),
            models.Index(fields=['user', 'last_activity']),
        ]
    
    def __str__(self):
        return f"Interactive session: {self.user.username} in {self.party.name}"
