"""
Search-related models for enhanced search functionality
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.postgres.indexes import GinIndex

User = get_user_model()


class SearchQuery(models.Model):
    """Track search queries for analytics and suggestions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=500)
    search_type = models.CharField(max_length=50, default='global')  # global, videos, users, parties
    filters_applied = models.JSONField(default=dict, blank=True)
    results_count = models.PositiveIntegerField(default=0)
    clicked_result_id = models.CharField(max_length=100, blank=True)
    clicked_result_type = models.CharField(max_length=50, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    search_duration_ms = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'search_queries'
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['search_type', '-created_at']),
            models.Index(fields=['-created_at']),
        ]
        
    def __str__(self):
        return f"Search: {self.query[:50]}"


class SavedSearch(models.Model):
    """User's saved searches for quick access"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_searches')
    name = models.CharField(max_length=200)
    query = models.CharField(max_length=500)
    search_type = models.CharField(max_length=50, default='global')
    filters = models.JSONField(default=dict, blank=True)
    notification_enabled = models.BooleanField(default=False)
    last_checked = models.DateTimeField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'saved_searches'
        unique_together = ('user', 'name')
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'notification_enabled']),
        ]
        
    def __str__(self):
        return f"{self.user.username}: {self.name}"


class TrendingQuery(models.Model):
    """Track trending search queries"""
    
    query = models.CharField(max_length=500, unique=True)
    search_count = models.PositiveIntegerField(default=1)
    unique_users = models.PositiveIntegerField(default=1)
    period = models.CharField(max_length=20, default='daily')  # daily, weekly, monthly
    date = models.DateField(default=timezone.now)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trending_queries'
        unique_together = ('query', 'period', 'date')
        indexes = [
            models.Index(fields=['period', 'date', '-search_count']),
            models.Index(fields=['-search_count']),
        ]
        
    def __str__(self):
        return f"Trending: {self.query} ({self.search_count} searches)"


class SearchSuggestion(models.Model):
    """Search suggestions and autocomplete"""
    
    SUGGESTION_TYPES = [
        ('query', 'Query Suggestion'),
        ('hashtag', 'Hashtag'),
        ('user', 'User'),
        ('category', 'Category'),
        ('trending', 'Trending Topic'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.CharField(max_length=200)
    suggestion_type = models.CharField(max_length=20, choices=SUGGESTION_TYPES)
    popularity_score = models.FloatField(default=0.0)
    click_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)  # Additional data like user_id for user suggestions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'search_suggestions'
        unique_together = ('text', 'suggestion_type')
        indexes = [
            models.Index(fields=['suggestion_type', '-popularity_score']),
            models.Index(fields=['is_active', '-click_count']),
            GinIndex(fields=['text'], name='search_suggestions_text_gin'),
        ]
        
    def __str__(self):
        return f"{self.suggestion_type}: {self.text}"


class SearchFilter(models.Model):
    """Dynamic search filters configuration"""
    
    FILTER_TYPES = [
        ('date_range', 'Date Range'),
        ('category', 'Category'),
        ('user_type', 'User Type'),
        ('content_type', 'Content Type'),
        ('popularity', 'Popularity'),
        ('duration', 'Duration'),
        ('location', 'Location'),
        ('custom', 'Custom Filter'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    filter_type = models.CharField(max_length=20, choices=FILTER_TYPES)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    options = models.JSONField(default=list, blank=True)  # Available filter options
    default_value = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'search_filters'
        ordering = ['sort_order', 'name']
        indexes = [
            models.Index(fields=['is_active', 'sort_order']),
            models.Index(fields=['filter_type']),
        ]
        
    def __str__(self):
        return f"Filter: {self.display_name}"


class SearchAnalytics(models.Model):
    """Aggregate search analytics data"""
    
    date = models.DateField()
    total_searches = models.PositiveIntegerField(default=0)
    unique_users = models.PositiveIntegerField(default=0)
    avg_results_per_search = models.FloatField(default=0.0)
    avg_search_duration_ms = models.FloatField(default=0.0)
    top_queries = models.JSONField(default=list, blank=True)
    click_through_rate = models.FloatField(default=0.0)
    zero_results_rate = models.FloatField(default=0.0)
    search_types_distribution = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'search_analytics'
        unique_together = ('date',)
        indexes = [
            models.Index(fields=['-date']),
        ]
        
    def __str__(self):
        return f"Search Analytics: {self.date}"
