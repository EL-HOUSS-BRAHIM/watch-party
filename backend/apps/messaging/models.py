"""
Messaging models for Watch Party Backend
Handles private conversations and messages between users
"""

from django.db import models
from django.utils import timezone
from apps.authentication.models import User


class Conversation(models.Model):
    """Private conversations between users"""
    
    CONVERSATION_TYPE_CHOICES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    
    participants = models.ManyToManyField(
        User, 
        through='ConversationParticipant', 
        through_fields=('conversation', 'user'),
        related_name='conversations'
    )
    conversation_type = models.CharField(max_length=10, choices=CONVERSATION_TYPE_CHOICES, default='direct')
    title = models.CharField(max_length=200, blank=True, help_text="Only for group conversations")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        
    def __str__(self):
        if self.conversation_type == 'group' and self.title:
            return self.title
        
        # For direct messages, show participants
        participants_names = [p.get_full_name() for p in self.participants.all()[:2]]
        return f"Conversation: {' & '.join(participants_names)}"
    
    @property
    def last_message(self):
        """Get the last message in this conversation"""
        return self.messages.filter(is_deleted=False).order_by('-sent_at').first()
    
    @property
    def participant_count(self):
        """Get number of active participants"""
        return self.conversation_participants.filter(is_active=True).count()
    
    def add_participant(self, user, added_by=None):
        """Add a participant to the conversation"""
        participant, created = ConversationParticipant.objects.get_or_create(
            conversation=self,
            user=user,
            defaults={'added_by': added_by}
        )
        
        if not created and not participant.is_active:
            participant.is_active = True
            participant.joined_at = timezone.now()
            participant.save()
        
        return participant
    
    def remove_participant(self, user):
        """Remove a participant from the conversation"""
        try:
            participant = ConversationParticipant.objects.get(
                conversation=self,
                user=user,
                is_active=True
            )
            participant.is_active = False
            participant.left_at = timezone.now()
            participant.save()
            return True
        except ConversationParticipant.DoesNotExist:
            return False


class ConversationParticipant(models.Model):
    """Participants in conversations with their status and settings"""
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='conversation_participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False, help_text="For group conversations")
    notifications_enabled = models.BooleanField(default=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='added_participants')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['conversation', 'user']
        ordering = ['joined_at']
        
    def __str__(self):
        return f"{self.user.get_full_name()} in {self.conversation}"
    
    def mark_as_read(self, timestamp=None):
        """Mark conversation as read up to a specific timestamp"""
        if timestamp is None:
            timestamp = timezone.now()
        self.last_read_at = timestamp
        self.save(update_fields=['last_read_at'])
    
    @property
    def unread_count(self):
        """Count unread messages for this participant"""
        if not self.last_read_at:
            return self.conversation.messages.filter(is_deleted=False).count()
        
        return self.conversation.messages.filter(
            sent_at__gt=self.last_read_at,
            is_deleted=False
        ).exclude(sender=self.user).count()


class Message(models.Model):
    """Messages within conversations"""
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('file', 'File'),
        ('audio', 'Audio'),
        ('system', 'System Message'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    attachments = models.JSONField(default=list, help_text="File attachments with URLs and metadata")
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, help_text="Message-specific data")
    sent_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['sent_at']
        indexes = [
            models.Index(fields=['conversation', 'sent_at']),
            models.Index(fields=['sender', 'sent_at']),
        ]
        
    def __str__(self):
        return f"Message from {self.sender.get_full_name()} at {self.sent_at}"
    
    def edit_content(self, new_content):
        """Edit message content"""
        self.content = new_content
        self.is_edited = True
        self.edited_at = timezone.now()
        self.save()
    
    def soft_delete(self):
        """Soft delete the message"""
        self.is_deleted = True
        self.save()
    
    @property
    def is_system_message(self):
        """Check if this is a system message"""
        return self.message_type == 'system'


class MessageReaction(models.Model):
    """Reactions to messages"""
    
    REACTION_CHOICES = [
        ('like', '👍'),
        ('love', '❤️'),
        ('laugh', '😂'),
        ('angry', '😠'),
        ('sad', '😢'),
        ('wow', '😮'),
        ('thumbs_down', '👎'),
        ('heart_eyes', '😍'),
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=15, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        
    def __str__(self):
        return f"{self.user.get_full_name()} {self.get_reaction_display()} on message {self.message.id}"


class MessageAttachment(models.Model):
    """File attachments for messages"""
    
    ATTACHMENT_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='file_attachments')
    file = models.FileField(upload_to='message_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    file_type = models.CharField(max_length=10, choices=ATTACHMENT_TYPE_CHOICES)
    mime_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']
        
    def __str__(self):
        return f"Attachment: {self.filename} for message {self.message.id}"
    
    @property
    def file_size_human(self):
        """Return human-readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class ConversationDraft(models.Model):
    """Draft messages for conversations"""
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='drafts')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['conversation', 'user']
        
    def __str__(self):
        return f"Draft by {self.user.get_full_name()} in {self.conversation}"
