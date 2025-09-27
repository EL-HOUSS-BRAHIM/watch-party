"""
Django admin configuration for content reporting
"""

from django.contrib import admin
from .models import ContentReport, ReportAction


@admin.register(ContentReport)
class ContentReportAdmin(admin.ModelAdmin):
    """Admin interface for content reports"""
    
    list_display = [
        'id', 'report_type', 'content_type', 'status', 'priority',
        'reported_by', 'assigned_to', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'report_type', 'content_type', 'created_at'
    ]
    search_fields = [
        'description', 'reported_by__username', 'reported_by__email'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('id', 'reported_by', 'report_type', 'content_type', 'content_id')
        }),
        ('Content References', {
            'fields': ('reported_video', 'reported_party', 'reported_user'),
            'classes': ('collapse',)
        }),
        ('Report Details', {
            'fields': ('description', 'evidence_url', 'priority')
        }),
        ('Moderation', {
            'fields': ('status', 'assigned_to', 'resolution_notes', 'action_taken')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'reported_by', 'assigned_to', 'reported_video', 
            'reported_party', 'reported_user'
        )


@admin.register(ReportAction)
class ReportActionAdmin(admin.ModelAdmin):
    """Admin interface for report actions"""
    
    list_display = [
        'id', 'report', 'action_type', 'moderator', 'created_at'
    ]
    list_filter = ['action_type', 'created_at']
    search_fields = ['description', 'moderator__username']
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Action Information', {
            'fields': ('id', 'report', 'action_type', 'moderator')
        }),
        ('Action Details', {
            'fields': ('description', 'duration_days')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'report', 'moderator'
        )
