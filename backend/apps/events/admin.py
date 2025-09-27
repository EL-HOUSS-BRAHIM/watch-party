from django.contrib import admin
from .models import Event, EventAttendee, EventInvitation, EventReminder


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'organizer', 'start_time', 'end_time', 
        'status', 'privacy', 'attendee_count', 'max_attendees'
    ]
    list_filter = ['status', 'privacy', 'category', 'require_approval']
    search_fields = ['title', 'description', 'organizer__username', 'category']
    readonly_fields = ['created_at', 'updated_at', 'attendee_count']
    raw_id_fields = ['organizer']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'organizer')
        }),
        ('Schedule', {
            'fields': ('start_time', 'end_time', 'location')
        }),
        ('Settings', {
            'fields': ('max_attendees', 'require_approval', 'privacy', 'status')
        }),
        ('Additional Information', {
            'fields': ('banner_image', 'category', 'tags'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'status', 'rsvp_date']
    list_filter = ['status', 'rsvp_date']
    search_fields = ['user__username', 'event__title']
    raw_id_fields = ['user', 'event']


@admin.register(EventInvitation)
class EventInvitationAdmin(admin.ModelAdmin):
    list_display = ['invitee', 'event', 'inviter', 'status', 'sent_at', 'responded_at']
    list_filter = ['status', 'sent_at']
    search_fields = ['invitee__username', 'inviter__username', 'event__title']
    raw_id_fields = ['inviter', 'invitee', 'event']


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'reminder_type', 'minutes_before', 'is_sent', 'sent_at']
    list_filter = ['reminder_type', 'is_sent', 'created_at']
    search_fields = ['user__username', 'event__title']
    raw_id_fields = ['user', 'event']
