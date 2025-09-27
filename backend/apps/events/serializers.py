from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from django.utils import timezone
from typing import Any
from .models import Event, EventAttendee, EventInvitation, EventReminder

User = get_user_model()


class EventOrganizerSerializer(serializers.ModelSerializer):
    """Serializer for event organizer information"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class EventAttendeeSerializer(serializers.ModelSerializer):
    """Serializer for event attendee information"""
    user = EventOrganizerSerializer(read_only=True)
    
    class Meta:
        model = EventAttendee
        fields = ['id', 'user', 'status', 'rsvp_date', 'notes']


class EventInvitationSerializer(serializers.ModelSerializer):
    """Serializer for event invitations"""
    inviter = EventOrganizerSerializer(read_only=True)
    invitee = EventOrganizerSerializer(read_only=True)
    invitee_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EventInvitation
        fields = [
            'id', 'inviter', 'invitee', 'invitee_id', 'status', 
            'message', 'sent_at', 'responded_at', 'expires_at'
        ]
        read_only_fields = ['inviter', 'sent_at', 'responded_at']
    
    def create(self, validated_data):
        invitee_id = validated_data.pop('invitee_id')
        try:
            invitee = User.objects.get(id=invitee_id)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invitee user does not exist")
        
        validated_data['invitee'] = invitee
        validated_data['inviter'] = self.context['request'].user
        return super().create(validated_data)


class EventReminderSerializer(serializers.ModelSerializer):
    """Serializer for event reminders"""
    class Meta:
        model = EventReminder
        fields = [
            'id', 'reminder_type', 'minutes_before', 
            'is_sent', 'sent_at', 'created_at'
        ]
        read_only_fields = ['is_sent', 'sent_at', 'created_at']


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for event list view (minimal data)"""
    organizer = EventOrganizerSerializer(read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'organizer', 'start_time', 'end_time',
            'location', 'max_attendees', 'privacy', 'status', 'banner_image',
            'category', 'tags', 'attendee_count', 'is_attending', 'is_full',
            'created_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_attendee_count(self, obj: Any) -> int:
        """Get current number of attendees"""
        return obj.attendees.filter(status='attending').count()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_full(self, obj: Any) -> bool:
        """Check if event has reached maximum capacity"""
        if obj.max_attendees is None:
            return False
        return obj.attendees.filter(status='attending').count() >= obj.max_attendees
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_attending(self, obj: Any) -> bool:
        """Check if current user is attending this event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(
                user=request.user,
                status='attending'
            ).exists()
        return False


class EventDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed event view"""
    organizer = EventOrganizerSerializer(read_only=True)
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    invitations = EventInvitationSerializer(many=True, read_only=True)
    reminders = EventReminderSerializer(many=True, read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()
    user_attendance_status = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_ongoing = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'organizer', 'start_time', 'end_time',
            'location', 'max_attendees', 'require_approval', 'privacy', 'status',
            'banner_image', 'category', 'tags', 'attendees', 'invitations',
            'reminders', 'attendee_count', 'is_attending', 'user_attendance_status',
            'is_full', 'is_upcoming', 'is_ongoing', 'is_past', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_attendee_count(self, obj: Any) -> int:
        """Get current number of attendees"""
        return obj.attendees.filter(status='attending').count()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_full(self, obj: Any) -> bool:
        """Check if event has reached maximum capacity"""
        if obj.max_attendees is None:
            return False
        return obj.attendees.filter(status='attending').count() >= obj.max_attendees
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_upcoming(self, obj: Any) -> bool:
        """Check if event hasn't started yet"""
        return obj.start_time > timezone.now()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_ongoing(self, obj: Any) -> bool:
        """Check if event is currently happening"""
        now = timezone.now()
        return obj.start_time <= now <= obj.end_time
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_past(self, obj: Any) -> bool:
        """Check if event has ended"""
        return obj.end_time < timezone.now()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_attending(self, obj: Any) -> bool:
        """Check if current user is attending this event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(
                user=request.user,
                status='attending'
            ).exists()
        return False
    
    @extend_schema_field(serializers.CharField)
    def get_user_attendance_status(self, obj: Any) -> str:
        """Get current user's attendance status for this event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                attendance = obj.attendees.get(user=request.user)
                return attendance.status
            except EventAttendee.DoesNotExist:
                return None
        return None


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating events"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'start_time', 'end_time', 'location',
            'max_attendees', 'require_approval', 'privacy', 'banner_image',
            'category', 'tags'
        ]
    
    def validate(self, data):
        """Validate event data"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Check if start time is in the future (for new events)
        if not self.instance and start_time and start_time <= timezone.now():
            raise serializers.ValidationError(
                "Event start time must be in the future"
            )
        
        # Check if end time is after start time
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError(
                "Event end time must be after start time"
            )
        
        return data
    
    def create(self, validated_data):
        """Create new event with current user as organizer"""
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class EventJoinLeaveSerializer(serializers.Serializer):
    """Serializer for joining/leaving events"""
    action = serializers.ChoiceField(choices=['join', 'leave'])
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)


class EventRSVPSerializer(serializers.Serializer):
    """Serializer for RSVP responses"""
    status = serializers.ChoiceField(choices=EventAttendee.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)


class EventSearchSerializer(serializers.Serializer):
    """Serializer for event search parameters"""
    q = serializers.CharField(required=False, help_text="Search query")
    category = serializers.CharField(required=False, help_text="Event category")
    location = serializers.CharField(required=False, help_text="Event location")
    start_date = serializers.DateTimeField(required=False, help_text="Events starting after this date")
    end_date = serializers.DateTimeField(required=False, help_text="Events ending before this date")
    privacy = serializers.ChoiceField(
        choices=Event.PRIVACY_CHOICES,
        required=False,
        help_text="Event privacy setting"
    )
    status = serializers.ChoiceField(
        choices=Event.STATUS_CHOICES,
        required=False,
        help_text="Event status"
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Event tags to filter by"
    )
