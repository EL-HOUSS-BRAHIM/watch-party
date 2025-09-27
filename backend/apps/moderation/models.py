"""
Content reporting models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ContentReport(models.Model):
    """Model for user-generated content reports"""
    
    REPORT_TYPES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('copyright', 'Copyright Violation'),
        ('violence', 'Violence'),
        ('hate_speech', 'Hate Speech'),
        ('misinformation', 'Misinformation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
        ('escalated', 'Escalated'),
    ]
    
    CONTENT_TYPES = [
        ('video', 'Video'),
        ('party', 'Watch Party'),
        ('comment', 'Comment'),
        ('user_profile', 'User Profile'),
        ('message', 'Chat Message'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reporter information
    reported_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='content_reports_made'
    )
    
    # Report details
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content_id = models.UUIDField(help_text="ID of the reported content")
    
    # Optional: Direct foreign keys for specific content types
    reported_video = models.ForeignKey(
        'videos.Video', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='content_reports'
    )
    reported_party = models.ForeignKey(
        'parties.WatchParty', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='content_reports'
    )
    reported_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='content_reports_against'
    )
    
    # Report content
    description = models.TextField(help_text="Detailed description of the issue")
    evidence_url = models.URLField(blank=True, help_text="URL to evidence (screenshot, etc.)")
    
    # Status and resolution
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(
        max_length=10, 
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='medium'
    )
    
    # Moderation
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_content_reports',
        limit_choices_to={'is_staff': True}
    )
    resolution_notes = models.TextField(blank=True)
    action_taken = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'content_reports'
        verbose_name = 'Content Report'
        verbose_name_plural = 'Content Reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['content_type', 'content_id']),
            models.Index(fields=['reported_by', 'created_at']),
            models.Index(fields=['assigned_to', 'status']),
        ]
    
    def __str__(self):
        return f"Report #{self.id} - {self.get_report_type_display()} ({self.status})"
    
    def resolve(self, moderator: User, action: str, notes: str = ""):
        """Mark report as resolved"""
        self.status = 'resolved'
        self.assigned_to = moderator
        self.action_taken = action
        self.resolution_notes = notes
        self.resolved_at = timezone.now()
        self.save()
    
    def dismiss(self, moderator: User, reason: str = ""):
        """Dismiss report as invalid"""
        self.status = 'dismissed'
        self.assigned_to = moderator
        self.resolution_notes = reason
        self.resolved_at = timezone.now()
        self.save()


class ReportAction(models.Model):
    """Actions taken on reported content"""
    
    ACTION_TYPES = [
        ('warning', 'Warning Issued'),
        ('content_removed', 'Content Removed'),
        ('user_suspended', 'User Suspended'),
        ('user_banned', 'User Banned'),
        ('content_edited', 'Content Edited'),
        ('no_action', 'No Action Taken'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(ContentReport, on_delete=models.CASCADE, related_name='actions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    
    # Who took the action
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_moderation_actions')
    
    # Action details
    description = models.TextField()
    duration_days = models.PositiveIntegerField(
        null=True, 
        blank=True, 
        help_text="Duration for temporary actions (suspension, etc.)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_actions'
        verbose_name = 'Report Action'
        verbose_name_plural = 'Report Actions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_action_type_display()} - Report #{self.report.id}"
