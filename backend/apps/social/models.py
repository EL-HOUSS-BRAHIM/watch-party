"""
Social models for Watch Party Backend
Handles social groups, group memberships, and social interactions
"""

from django.db import models
from django.utils import timezone
from apps.authentication.models import User


class SocialGroup(models.Model):
    """Social groups for users to join and interact"""
    
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('invite_only', 'Invite Only'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('movies', 'Movies'),
        ('tv_shows', 'TV Shows'),
        ('anime', 'Anime'),
        ('documentaries', 'Documentaries'),
        ('gaming', 'Gaming'),
        ('music', 'Music'),
        ('sports', 'Sports'),
        ('comedy', 'Comedy'),
        ('horror', 'Horror'),
        ('sci_fi', 'Science Fiction'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    privacy = models.CharField(max_length=15, choices=PRIVACY_CHOICES, default='public')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(
        User, 
        through='GroupMembership', 
        through_fields=('group', 'user'),
        related_name='social_groups'
    )
    avatar = models.ImageField(upload_to='group_avatars/', null=True, blank=True)
    banner = models.ImageField(upload_to='group_banners/', null=True, blank=True)
    rules = models.TextField(blank=True, help_text="Group rules and guidelines")
    tags = models.JSONField(default=list, help_text="Group tags for discovery")
    max_members = models.IntegerField(default=1000, help_text="Maximum number of members")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'privacy']),
            models.Index(fields=['is_active', 'created_at']),
        ]
        
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        """Get number of active members"""
        return self.memberships.filter(is_active=True).count()
    
    @property
    def is_full(self):
        """Check if group has reached maximum members"""
        return self.member_count >= self.max_members
    
    def can_join(self, user):
        """Check if user can join this group"""
        if self.is_full:
            return False, "Group is full"
        
        if self.memberships.filter(user=user, is_active=True).exists():
            return False, "Already a member"
        
        if self.privacy == 'private':
            return False, "Private group - invitation required"
        
        return True, "Can join"


class GroupMembership(models.Model):
    """Group membership model with roles and permissions"""
    
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
        ('owner', 'Owner'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('banned', 'Banned'),
        ('left', 'Left'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='group_invitations_sent')
    
    class Meta:
        unique_together = ['user', 'group']
        ordering = ['-joined_at']
        
    def __str__(self):
        return f"{self.user.email} in {self.group.name} ({self.role})"
    
    def leave_group(self):
        """Leave the group"""
        self.status = 'left'
        self.is_active = False
        self.left_at = timezone.now()
        self.save()


class GroupInvitation(models.Model):
    """Group invitations for private groups"""
    
    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_group_invitations')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_group_invitations')
    message = models.TextField(blank=True)
    is_accepted = models.BooleanField(default=False)
    is_declined = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['group', 'invitee']
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Invitation to {self.group.name} for {self.invitee.email}"
    
    @property
    def is_expired(self):
        """Check if invitation has expired"""
        return timezone.now() > self.expires_at
    
    @property
    def is_pending(self):
        """Check if invitation is still pending"""
        return not (self.is_accepted or self.is_declined) and not self.is_expired
    
    def accept(self):
        """Accept the invitation"""
        if self.is_pending:
            self.is_accepted = True
            self.responded_at = timezone.now()
            self.save()
            
            # Create group membership
            GroupMembership.objects.create(
                user=self.invitee,
                group=self.group,
                invited_by=self.inviter
            )
            return True
        return False
    
    def decline(self):
        """Decline the invitation"""
        if self.is_pending:
            self.is_declined = True
            self.responded_at = timezone.now()
            self.save()
            return True
        return False


class GroupEvent(models.Model):
    """Events within groups (watch parties, discussions, etc.)"""
    
    EVENT_TYPE_CHOICES = [
        ('watch_party', 'Watch Party'),
        ('discussion', 'Discussion'),
        ('poll', 'Poll'),
        ('announcement', 'Announcement'),
        ('meetup', 'Meetup'),
    ]
    
    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, related_name='events')
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=120)
    max_participants = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, help_text="Event-specific data")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_at']
        
    def __str__(self):
        return f"{self.title} in {self.group.name}"


class GroupPost(models.Model):
    """Posts/messages within groups"""
    
    POST_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('link', 'Link'),
        ('poll', 'Poll'),
    ]
    
    group = models.ForeignKey(SocialGroup, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    post_type = models.CharField(max_length=10, choices=POST_TYPE_CHOICES, default='text')
    attachments = models.JSONField(default=list, help_text="File attachments")
    metadata = models.JSONField(default=dict, help_text="Post-specific data like poll options")
    is_pinned = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        
    def __str__(self):
        return f"Post by {self.author.email} in {self.group.name}"


class GroupPostReaction(models.Model):
    """Reactions to group posts"""
    
    REACTION_CHOICES = [
        ('like', '👍'),
        ('love', '❤️'),
        ('laugh', '😂'),
        ('angry', '😠'),
        ('sad', '😢'),
        ('wow', '😮'),
    ]
    
    post = models.ForeignKey(GroupPost, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'user']
        
    def __str__(self):
        return f"{self.user.email} {self.get_reaction_display()} on post {self.post.id}"
