"""
Chat models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.parties.models import WatchParty

User = get_user_model()


class ChatRoom(models.Model):
    """Chat room associated with a watch party"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    party = models.OneToOneField(WatchParty, on_delete=models.CASCADE, related_name='chat_room')
    name = models.CharField(max_length=200, verbose_name='Room Name')
    description = models.TextField(blank=True, verbose_name='Room Description')
    
    # Room settings
    max_users = models.PositiveIntegerField(default=100, verbose_name='Max Users')
    is_moderated = models.BooleanField(default=False, verbose_name='Moderated Room')
    allow_anonymous = models.BooleanField(default=False, verbose_name='Allow Anonymous Users')
    slow_mode_seconds = models.PositiveIntegerField(default=0, verbose_name='Slow Mode (seconds)')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    # Active users (many-to-many relationship)
    active_users = models.ManyToManyField(User, blank=True, related_name='active_chat_rooms')
    
    class Meta:
        db_table = 'chat_rooms'
        verbose_name = 'Chat Room'
        verbose_name_plural = 'Chat Rooms'
        
    def __str__(self):
        return f"Chat Room for {self.party.title}"
    
    @property
    def active_user_count(self):
        """Get count of currently active users"""
        return self.active_users.count()
    
    def is_user_active(self, user):
        """Check if user is currently active in this room"""
        return self.active_users.filter(id=user.id).exists()
    
    def add_user(self, user):
        """Add user to active users list"""
        self.active_users.add(user)
    
    def remove_user(self, user):
        """Remove user from active users list"""
        self.active_users.remove(user)


class ChatMessage(models.Model):
    """Chat message in a room"""
    
    MESSAGE_TYPES = [
        ('text', 'Text Message'),
        ('emoji', 'Emoji Only'),
        ('system', 'System Message'),
        ('join', 'User Joined'),
        ('leave', 'User Left'),
        ('reaction', 'Video Reaction'),
    ]
    
    MODERATION_STATUS = [
        ('active', 'Active'),
        ('hidden', 'Hidden'),
        ('deleted', 'Deleted'),
        ('flagged', 'Flagged for Review'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_chat_messages', null=True, blank=True)
    
    # Message content
    content = models.TextField(verbose_name='Message Content')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    
    # Reply threading
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    # Moderation
    moderation_status = models.CharField(max_length=20, choices=MODERATION_STATUS, default='active')
    moderated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_chat_messages')
    moderation_reason = models.CharField(max_length=500, blank=True, verbose_name='Moderation Reason')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True, verbose_name='Additional Metadata')
    
    class Meta:
        db_table = 'chat_room_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['moderation_status']),
        ]
        
    def __str__(self):
        user_name = self.user.full_name if self.user else 'System'
        return f"{user_name}: {self.content[:50]}..."
    
    @property
    def is_system_message(self):
        """Check if this is a system message"""
        return self.message_type in ['system', 'join', 'leave']
    
    @property
    def is_visible(self):
        """Check if message is visible to users"""
        return self.moderation_status == 'active'
    
    @property
    def reply_count(self):
        """Get count of replies to this message"""
        return self.replies.filter(moderation_status='active').count()


class ChatModerationLog(models.Model):
    """Log of moderation actions taken on chat messages"""
    
    ACTION_TYPES = [
        ('hide', 'Message Hidden'),
        ('delete', 'Message Deleted'),
        ('flag', 'Message Flagged'),
        ('unflag', 'Message Unflagged'),
        ('ban_user', 'User Banned'),
        ('unban_user', 'User Unbanned'),
        ('timeout_user', 'User Timed Out'),
        ('promote_mod', 'User Promoted to Moderator'),
        ('demote_mod', 'User Demoted from Moderator'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='moderation_logs')
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_actions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_received', null=True, blank=True)
    message = models.ForeignKey(ChatMessage, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderation_logs')
    
    # Action details
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    reason = models.TextField(verbose_name='Reason for Action')
    duration = models.DurationField(null=True, blank=True, verbose_name='Action Duration')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Action Taken At')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Action Expires At')
    
    class Meta:
        db_table = 'chat_moderation_logs'
        verbose_name = 'Chat Moderation Log'
        verbose_name_plural = 'Chat Moderation Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['moderator', 'created_at']),
            models.Index(fields=['target_user', 'created_at']),
        ]
        
    def __str__(self):
        return f"{self.moderator.full_name} {self.action_type} in {self.room}"
    
    @property
    def is_active(self):
        """Check if moderation action is still active"""
        if not self.expires_at:
            return True
        return timezone.now() < self.expires_at


class ChatBan(models.Model):
    """User bans from chat rooms"""
    
    BAN_TYPES = [
        ('permanent', 'Permanent Ban'),
        ('temporary', 'Temporary Ban'),
        ('timeout', 'Timeout'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='banned_users')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_bans')
    banned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_bans_issued')
    
    # Ban details
    ban_type = models.CharField(max_length=20, choices=BAN_TYPES, default='temporary')
    reason = models.TextField(verbose_name='Ban Reason')
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Banned At')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Ban Expires At')
    is_active = models.BooleanField(default=True, verbose_name='Ban Active')
    
    class Meta:
        db_table = 'chat_bans'
        verbose_name = 'Chat Ban'
        verbose_name_plural = 'Chat Bans'
        unique_together = ['room', 'user']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room', 'is_active']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['expires_at']),
        ]
        
    def __str__(self):
        return f"{self.user.full_name} banned from {self.room}"
    
    def is_ban_active(self):
        """Check if ban is currently active"""
        if not self.is_active:
            return False
        if self.ban_type == 'permanent':
            return True
        if self.expires_at and timezone.now() >= self.expires_at:
            self.is_active = False
            self.save()
            return False
        return True
    
    def lift_ban(self):
        """Lift the ban"""
        self.is_active = False
        self.save()
