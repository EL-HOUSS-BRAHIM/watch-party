"""
Django admin configuration for the Interactive app.
"""

from django.contrib import admin
from .models import (
    LiveReaction, VoiceChatRoom, VoiceChatParticipant, ScreenShare,
    InteractivePoll, PollResponse, InteractiveAnnotation, InteractiveSession
)


@admin.register(LiveReaction)
class LiveReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'party', 'reaction', 'video_timestamp', 'created_at']
    list_filter = ['reaction', 'created_at']
    search_fields = ['user__username', 'party__name']
    readonly_fields = ['created_at']


@admin.register(VoiceChatRoom)
class VoiceChatRoomAdmin(admin.ModelAdmin):
    list_display = ['party', 'max_participants', 'audio_quality', 'is_active']
    list_filter = ['audio_quality', 'is_active']
    search_fields = ['party__name']


@admin.register(VoiceChatParticipant)
class VoiceChatParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'is_connected', 'joined_at']
    list_filter = ['is_connected', 'joined_at']
    search_fields = ['user__username']


@admin.register(ScreenShare)
class ScreenShareAdmin(admin.ModelAdmin):
    list_display = ['user', 'party', 'share_type', 'is_active', 'started_at']
    list_filter = ['share_type', 'is_active', 'started_at']
    search_fields = ['user__username', 'party__name']
    readonly_fields = ['share_id', 'started_at', 'ended_at']


@admin.register(InteractivePoll)
class InteractivePollAdmin(admin.ModelAdmin):
    list_display = ['creator', 'party', 'question', 'poll_type', 'is_published', 'created_at']
    list_filter = ['poll_type', 'is_published', 'created_at']
    search_fields = ['creator__username', 'party__name', 'question']
    readonly_fields = ['poll_id', 'total_responses', 'created_at']


@admin.register(PollResponse)
class PollResponseAdmin(admin.ModelAdmin):
    list_display = ['user', 'poll', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']


@admin.register(InteractiveAnnotation)
class InteractiveAnnotationAdmin(admin.ModelAdmin):
    list_display = ['user', 'screen_share', 'annotation_type', 'is_visible', 'created_at']
    list_filter = ['annotation_type', 'is_visible', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['annotation_id', 'created_at']


@admin.register(InteractiveSession)
class InteractiveSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'party', 'reactions_sent', 'started_at']
    list_filter = ['started_at']
    search_fields = ['user__username', 'party__name']
    readonly_fields = ['session_id', 'started_at', 'ended_at']
