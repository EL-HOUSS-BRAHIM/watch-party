"""
Django admin configuration for the Interactive app.
Provides admin interfaces for managing interactive features.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone

from .models import (
    LiveReaction, VoiceChatRoom, VoiceChatParticipant, ScreenShare,
    InteractivePoll, PollResponse, InteractiveAnnotation, InteractiveSession
)


# ============================================================================
# LIVE REACTIONS ADMIN
# ============================================================================

@admin.register(LiveReaction)
class LiveReactionAdmin(admin.ModelAdmin):
    """Admin interface for Live Reactions"""
    
    list_display = [
        'reaction_id', 'user', 'party', 'reaction', 'video_timestamp',
        'intensity', 'is_active', 'created_at'
    ]
    list_filter = [
        'reaction', 'intensity', 'is_active', 'created_at', 'party__name'
    ]
    search_fields = [
        'user__username', 'party__name', 'reaction_id'
    ]
    readonly_fields = [
        'reaction_id', 'created_at'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('reaction_id', 'user', 'party', 'reaction')
        }),
        ('Position & Timing', {
            'fields': ('position_x', 'position_y', 'video_timestamp', 'intensity')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at')
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'party')


# ============================================================================
# VOICE CHAT ADMIN
# ============================================================================

@admin.register(VoiceChatRoom)
class VoiceChatRoomAdmin(admin.ModelAdmin):
    """Admin interface for Voice Chat Rooms"""
    
    list_display = [
        'id', 'party', 'max_participants', 'participant_count',
        'audio_quality', 'is_active', 'created_at'
    ]
    list_filter = [
        'audio_quality', 'require_permission', 'is_active', 'created_at'
    ]
    search_fields = [
        'party__name'
    ]
    readonly_fields = [
        'created_at', 'participant_count'
    ]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('party', 'max_participants', 'is_active')
        }),
        ('Settings', {
            'fields': (
                'require_permission', 'audio_quality',
                'noise_cancellation', 'echo_cancellation'
            )
        }),
        ('Technical', {
            'fields': ('ice_servers',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'participant_count'),
            'classes': ('collapse',)
        })
    )
    
    def participant_count(self, obj):
        """Get current participant count"""
        return obj.participants.filter(is_connected=True).count()
    participant_count.short_description = 'Active Participants'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('party')


@admin.register(VoiceChatParticipant)
class VoiceChatParticipantAdmin(admin.ModelAdmin):
    """Admin interface for Voice Chat Participants"""
    
    list_display = [
        'user', 'room_party', 'peer_id', 'is_connected',
        'is_muted', 'is_moderator', 'joined_at'
    ]
    list_filter = [
        'is_connected', 'is_muted', 'is_deafened', 'is_moderator',
        'joined_at', 'room__party__name'
    ]
    search_fields = [
        'user__username', 'room__party__name', 'peer_id'
    ]
    readonly_fields = [
        'joined_at', 'left_at', 'session_duration'
    ]
    date_hierarchy = 'joined_at'
    ordering = ['-joined_at']
    
    fieldsets = (
        ('Participant Info', {
            'fields': ('user', 'room', 'peer_id')
        }),
        ('Status', {
            'fields': ('is_connected', 'is_muted', 'is_deafened', 'is_moderator')
        }),
        ('Session Data', {
            'fields': ('joined_at', 'left_at', 'session_duration')
        })
    )
    
    def room_party(self, obj):
        """Get party name from room"""
        return obj.room.party.name
    room_party.short_description = 'Party'
    room_party.admin_order_field = 'room__party__name'
    
    def session_duration(self, obj):
        """Calculate session duration"""
        if obj.left_at:
            duration = obj.left_at - obj.joined_at
        elif obj.is_connected:
            duration = timezone.now() - obj.joined_at
        else:
            return "N/A"
        
        hours, remainder = divmod(duration.total_seconds(), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"
    session_duration.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'room__party')


# ============================================================================
# SCREEN SHARING ADMIN
# ============================================================================

@admin.register(ScreenShare)
class ScreenShareAdmin(admin.ModelAdmin):
    """Admin interface for Screen Sharing"""
    
    list_display = [
        'share_id', 'user', 'party', 'title', 'share_type',
        'viewer_count', 'is_active', 'started_at'
    ]
    list_filter = [
        'share_type', 'is_active', 'is_recording',
        'viewers_can_annotate', 'allow_remote_control', 'started_at'
    ]
    search_fields = [
        'user__username', 'party__name', 'title', 'share_id'
    ]
    readonly_fields = [
        'share_id', 'started_at', 'ended_at', 'share_duration'
    ]
    date_hierarchy = 'started_at'
    ordering = ['-started_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('share_id', 'user', 'party', 'title', 'description')
        }),
        ('Technical Settings', {
            'fields': ('share_type', 'resolution', 'frame_rate')
        }),
        ('Permissions', {
            'fields': (
                'viewers_can_annotate', 'allow_remote_control', 'is_recording'
            )
        }),
        ('Status & Stats', {
            'fields': ('is_active', 'viewer_count', 'started_at', 'ended_at', 'share_duration')
        }),
        ('Technical', {
            'fields': ('ice_servers',),
            'classes': ('collapse',)
        })
    )
    
    def share_duration(self, obj):
        """Calculate share duration"""
        if obj.ended_at:
            duration = obj.ended_at - obj.started_at
        elif obj.is_active:
            duration = timezone.now() - obj.started_at
        else:
            return "N/A"
        
        hours, remainder = divmod(duration.total_seconds(), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"
    share_duration.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'party')


# ============================================================================
# INTERACTIVE POLLS ADMIN
# ============================================================================

@admin.register(InteractivePoll)
class InteractivePollAdmin(admin.ModelAdmin):
    """Admin interface for Interactive Polls"""
    
    list_display = [
        'poll_id', 'creator', 'party', 'title', 'poll_type',
        'total_responses', 'is_published', 'is_expired_status', 'created_at'
    ]
    list_filter = [
        'poll_type', 'is_published', 'anonymous_responses',
        'show_results_live', 'requires_verification', 'created_at'
    ]
    search_fields = [
        'creator__username', 'party__name', 'title', 'poll_id'
    ]
    readonly_fields = [
        'poll_id', 'total_responses', 'created_at', 'is_expired_status'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('poll_id', 'creator', 'party', 'title', 'description')
        }),
        ('Poll Configuration', {
            'fields': ('poll_type', 'options', 'min_rating', 'max_rating')
        }),
        ('Settings', {
            'fields': (
                'allows_multiple', 'anonymous_responses', 'show_results_live',
                'requires_verification'
            )
        }),
        ('Timing', {
            'fields': ('video_timestamp', 'expires_at')
        }),
        ('Status', {
            'fields': ('is_published', 'total_responses', 'created_at', 'is_expired_status')
        })
    )
    
    def is_expired_status(self, obj):
        """Check if poll is expired"""
        if obj.expires_at and obj.expires_at <= timezone.now():
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Active</span>')
    is_expired_status.short_description = 'Status'
    
    actions = ['publish_polls', 'unpublish_polls']
    
    def publish_polls(self, request, queryset):
        """Publish selected polls"""
        updated = queryset.filter(is_published=False).update(is_published=True)
        self.message_user(request, f'{updated} polls were published.')
    publish_polls.short_description = "Publish selected polls"
    
    def unpublish_polls(self, request, queryset):
        """Unpublish selected polls"""
        updated = queryset.filter(is_published=True).update(is_published=False)
        self.message_user(request, f'{updated} polls were unpublished.')
    unpublish_polls.short_description = "Unpublish selected polls"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('creator', 'party')


@admin.register(PollResponse)
class PollResponseAdmin(admin.ModelAdmin):
    """Admin interface for Poll Responses"""
    
    list_display = [
        'user', 'poll_title', 'poll_type', 'selected_option',
        'rating_value', 'created_at'
    ]
    list_filter = [
        'poll__poll_type', 'created_at', 'poll__party__name'
    ]
    search_fields = [
        'user__username', 'poll__title', 'text_response'
    ]
    readonly_fields = [
        'created_at'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Response Info', {
            'fields': ('user', 'poll')
        }),
        ('Response Data', {
            'fields': ('selected_option', 'text_response', 'rating_value')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        })
    )
    
    def poll_title(self, obj):
        """Get poll title"""
        return obj.poll.title
    poll_title.short_description = 'Poll'
    poll_title.admin_order_field = 'poll__title'
    
    def poll_type(self, obj):
        """Get poll type"""
        return obj.poll.get_poll_type_display()
    poll_type.short_description = 'Type'
    poll_type.admin_order_field = 'poll__poll_type'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'poll')


# ============================================================================
# ANNOTATIONS ADMIN
# ============================================================================

@admin.register(InteractiveAnnotation)
class InteractiveAnnotationAdmin(admin.ModelAdmin):
    """Admin interface for Interactive Annotations"""
    
    list_display = [
        'annotation_id', 'user', 'screen_share_title', 'annotation_type',
        'is_visible', 'created_at'
    ]
    list_filter = [
        'annotation_type', 'is_visible', 'created_at'
    ]
    search_fields = [
        'user__username', 'screen_share__title', 'annotation_id'
    ]
    readonly_fields = [
        'annotation_id', 'created_at'
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('annotation_id', 'user', 'screen_share', 'annotation_type')
        }),
        ('Position & Size', {
            'fields': ('position_x', 'position_y', 'width', 'height')
        }),
        ('Appearance', {
            'fields': ('content', 'color', 'stroke_width')
        }),
        ('Status', {
            'fields': ('is_visible', 'expires_at', 'created_at')
        })
    )
    
    def screen_share_title(self, obj):
        """Get screen share title"""
        return obj.screen_share.title
    screen_share_title.short_description = 'Screen Share'
    screen_share_title.admin_order_field = 'screen_share__title'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'screen_share')


# ============================================================================
# SESSIONS ADMIN
# ============================================================================

@admin.register(InteractiveSession)
class InteractiveSessionAdmin(admin.ModelAdmin):
    """Admin interface for Interactive Sessions"""
    
    list_display = [
        'session_id', 'user', 'party', 'reactions_sent',
        'polls_participated', 'session_duration', 'started_at'
    ]
    list_filter = [
        'started_at', 'party__name'
    ]
    search_fields = [
        'user__username', 'party__name', 'session_id'
    ]
    readonly_fields = [
        'session_id', 'reactions_sent', 'voice_chat_duration',
        'screen_shares_initiated', 'polls_participated',
        'annotations_created', 'started_at', 'ended_at', 'session_duration'
    ]
    date_hierarchy = 'started_at'
    ordering = ['-started_at']
    
    fieldsets = (
        ('Session Info', {
            'fields': ('session_id', 'user', 'party')
        }),
        ('Activity Stats', {
            'fields': (
                'reactions_sent', 'voice_chat_duration',
                'screen_shares_initiated', 'polls_participated',
                'annotations_created'
            )
        }),
        ('Timing', {
            'fields': ('started_at', 'ended_at', 'session_duration')
        })
    )
    
    def session_duration(self, obj):
        """Calculate session duration"""
        if obj.ended_at:
            duration = obj.ended_at - obj.started_at
        else:
            duration = timezone.now() - obj.started_at
        
        hours, remainder = divmod(duration.total_seconds(), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"
    session_duration.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'party')


# ============================================================================
# ADMIN SITE CUSTOMIZATIONS
# ============================================================================

# Set admin site headers
admin.site.site_header = "Watch Party Interactive Features"
admin.site.site_title = "Interactive Admin"
admin.site.index_title = "Interactive Features Administration"
