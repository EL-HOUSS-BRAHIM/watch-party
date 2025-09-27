"""
Support System Models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FAQCategory(models.Model):
    """FAQ Categories for organizing help articles"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name='Category Name')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL Slug')
    description = models.TextField(blank=True, verbose_name='Category Description')
    icon = models.CharField(max_length=50, blank=True, verbose_name='Icon Class')
    
    # Ordering and visibility
    order = models.PositiveIntegerField(default=0, verbose_name='Display Order')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faq_categories'
        ordering = ['order', 'name']
        verbose_name = 'FAQ Category'
        verbose_name_plural = 'FAQ Categories'
        
    def __str__(self):
        return self.name


class FAQ(models.Model):
    """Frequently Asked Questions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(FAQCategory, on_delete=models.CASCADE, related_name='faqs')
    
    question = models.CharField(max_length=500, verbose_name='Question')
    answer = models.TextField(verbose_name='Answer')
    
    # SEO and searchability
    keywords = models.CharField(max_length=500, blank=True, verbose_name='Search Keywords')
    
    # Visibility and ordering
    is_featured = models.BooleanField(default=False, verbose_name='Featured FAQ')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    order = models.PositiveIntegerField(default=0, verbose_name='Display Order')
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0, verbose_name='View Count')
    helpful_votes = models.PositiveIntegerField(default=0, verbose_name='Helpful Votes')
    unhelpful_votes = models.PositiveIntegerField(default=0, verbose_name='Unhelpful Votes')
    
    # Authoring
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_faqs')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faqs'
        ordering = ['order', '-is_featured', '-helpful_votes']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['keywords']),
        ]
        
    def __str__(self):
        return self.question
    
    @property
    def helpfulness_ratio(self):
        """Calculate helpfulness ratio"""
        total_votes = self.helpful_votes + self.unhelpful_votes
        if total_votes == 0:
            return 0
        return (self.helpful_votes / total_votes) * 100


class SupportTicket(models.Model):
    """Support tickets for user issues"""
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('waiting_user', 'Waiting for User'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical Issue'),
        ('account', 'Account Issue'),
        ('billing', 'Billing Question'),
        ('feature', 'Feature Request'),
        ('bug', 'Bug Report'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=20, unique=True, verbose_name='Ticket Number')
    
    # User information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    
    # Ticket details
    subject = models.CharField(max_length=200, verbose_name='Subject')
    description = models.TextField(verbose_name='Description')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Assignment and resolution
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tickets'
    )
    resolution_notes = models.TextField(blank=True, verbose_name='Resolution Notes')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'support_tickets'
        ordering = ['-created_at']
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['category', 'status']),
        ]
        
    def __str__(self):
        return f"#{self.ticket_number} - {self.subject}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()
        super().save(*args, **kwargs)
    
    def generate_ticket_number(self):
        """Generate unique ticket number"""
        import random
        import string
        while True:
            number = 'SP' + ''.join(random.choices(string.digits, k=6))
            if not SupportTicket.objects.filter(ticket_number=number).exists():
                return number


class SupportTicketMessage(models.Model):
    """Messages/replies in support tickets"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_messages')
    
    message = models.TextField(verbose_name='Message Content')
    is_internal = models.BooleanField(default=False, verbose_name='Internal Note')
    
    # Attachments (if needed)
    attachment_url = models.URLField(blank=True, verbose_name='Attachment URL')
    attachment_name = models.CharField(max_length=255, blank=True, verbose_name='Attachment Name')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'support_ticket_messages'
        ordering = ['created_at']
        verbose_name = 'Support Ticket Message'
        verbose_name_plural = 'Support Ticket Messages'
        
    def __str__(self):
        return f"Message in {self.ticket.ticket_number} by {self.author.full_name}"


class UserFeedback(models.Model):
    """User feedback and suggestions"""
    
    FEEDBACK_TYPES = [
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('improvement', 'Improvement Suggestion'),
        ('compliment', 'Compliment'),
        ('complaint', 'Complaint'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Under Review'),
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback')
    
    # Feedback details
    title = models.CharField(max_length=200, verbose_name='Feedback Title')
    description = models.TextField(verbose_name='Feedback Description')
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    
    # Community voting
    upvotes = models.PositiveIntegerField(default=0, verbose_name='Upvotes')
    downvotes = models.PositiveIntegerField(default=0, verbose_name='Downvotes')
    
    # Admin response
    admin_response = models.TextField(blank=True, verbose_name='Admin Response')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_feedback'
        ordering = ['-created_at']
        verbose_name = 'User Feedback'
        verbose_name_plural = 'User Feedback'
        indexes = [
            models.Index(fields=['feedback_type', 'status']),
            models.Index(fields=['status', '-upvotes']),
        ]
        
    def __str__(self):
        return f"{self.title} by {self.user.full_name}"
    
    @property
    def vote_score(self):
        return self.upvotes - self.downvotes


class FeedbackVote(models.Model):
    """Track user votes on feedback"""
    
    VOTE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    feedback = models.ForeignKey(UserFeedback, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback_votes')
    vote = models.CharField(max_length=4, choices=VOTE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feedback_votes'
        unique_together = [['feedback', 'user']]
        verbose_name = 'Feedback Vote'
        verbose_name_plural = 'Feedback Votes'
        
    def __str__(self):
        return f"{self.user.full_name} {self.vote}voted {self.feedback.title}"
