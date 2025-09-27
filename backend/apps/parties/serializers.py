"""
Party serializers for Watch Party Backend
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from django.utils import timezone
from django.contrib.auth import get_user_model
from typing import Any
from apps.videos.serializers import VideoSerializer
from .models import WatchParty, PartyParticipant, PartyReaction, PartyInvitation, PartyReport
from apps.chat.models import ChatMessage

User = get_user_model()


class PartyParticipantSerializer(serializers.ModelSerializer):
    """Party participant serializer"""
    
    user = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    
    class Meta:
        model = PartyParticipant
        fields = [
            'user', 'role', 'status', 'is_active', 'is_online',
            'joined_at', 'last_seen'
        ]
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'name': obj.user.full_name,
            'avatar': obj.user.avatar.url if obj.user.avatar else None,
            'is_premium': obj.user.is_premium
        }
    
    @extend_schema_field(OpenApiTypes.BOOL)

    
    def get_is_online(self, obj):
        # Consider user online if last seen within 5 minutes
        return (timezone.now() - obj.last_seen).total_seconds() < 300


class WatchPartySerializer(serializers.ModelSerializer):
    """Basic watch party serializer"""
    
    host = serializers.SerializerMethodField()
    video = VideoSerializer(read_only=True)
    participant_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    can_join = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = WatchParty
        fields = [
            'id', 'title', 'description', 'host', 'video', 'room_code',
            'visibility', 'max_participants', 'participant_count', 'is_full',
            'require_approval', 'allow_chat', 'allow_reactions', 'status',
            'scheduled_start', 'started_at', 'ended_at', 'can_join', 'can_edit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'host', 'room_code', 'created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_participant_count(self, obj: Any) -> int:
        """Get current number of participants"""
        return obj.participants.filter(is_active=True).count()
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_full(self, obj: Any) -> bool:
        """Check if party has reached maximum participants"""
        if obj.max_participants is None:
            return False
        return obj.participants.filter(is_active=True).count() >= obj.max_participants
    
    @extend_schema_field(serializers.DictField)
    def get_host(self, obj: Any) -> dict:
        """Get host information"""
        return {
            'id': str(obj.host.id),
            'name': obj.host.full_name,
            'avatar': obj.host.avatar.url if obj.host.avatar else None,
            'is_premium': obj.host.is_premium
        }
    
    @extend_schema_field(serializers.BooleanField)
    def get_can_join(self, obj: Any) -> bool:
        """Check if current user can join this party"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Host can always join
        if obj.host == request.user:
            return True
        
        # Check if already a participant
        if obj.participants.filter(user=request.user, is_active=True).exists():
            return False
        
        # Check if party is full
        if self.get_is_full(obj):
            return False
        
        # Check status
        if obj.status not in ['scheduled', 'live', 'paused']:
            return False
        
        return True
    
    @extend_schema_field(serializers.BooleanField)
    def get_can_edit(self, obj: Any) -> bool:
        """Check if current user can edit this party"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.host == request.user
        return False


class WatchPartyDetailSerializer(WatchPartySerializer):
    """Detailed watch party serializer"""
    
    participants = PartyParticipantSerializer(many=True, read_only=True)
    current_timestamp_formatted = serializers.SerializerMethodField()
    
    class Meta(WatchPartySerializer.Meta):
        fields = WatchPartySerializer.Meta.fields + [
            'participants', 'current_timestamp', 'current_timestamp_formatted',
            'is_playing', 'last_sync_at'
        ]
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_current_timestamp_formatted(self, obj):
        if obj.current_timestamp:
            total_seconds = int(obj.current_timestamp.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"


class WatchPartyCreateSerializer(serializers.ModelSerializer):
    """Watch party creation serializer"""
    
    video_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = WatchParty
        fields = [
            'title', 'description', 'video_id', 'visibility', 'max_participants',
            'require_approval', 'allow_chat', 'allow_reactions', 'scheduled_start'
        ]
    
    def create(self, validated_data):
        video_id = validated_data.pop('video_id')
        
        # Get video and validate ownership/permissions
        from apps.videos.models import Video
        video = Video.objects.get(id=video_id)
        
        # Check if user can use this video
        request = self.context['request']
        if video.uploader != request.user and video.visibility == 'private':
            raise serializers.ValidationError("You don't have permission to use this video")
        
        validated_data['host'] = request.user
        validated_data['video'] = video
        
        return super().create(validated_data)


class WatchPartyUpdateSerializer(serializers.ModelSerializer):
    """Watch party update serializer"""
    
    class Meta:
        model = WatchParty
        fields = [
            'title', 'description', 'visibility', 'max_participants',
            'require_approval', 'allow_chat', 'allow_reactions', 'scheduled_start'
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    """Chat message serializer"""
    
    user = serializers.SerializerMethodField()
    reply_to_message = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'user', 'message_type', 'content', 'moderation_status',
            'reply_to', 'reply_to_message', 'can_edit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'moderation_status', 'created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': str(obj.user.id),
                'name': obj.user.full_name,
                'avatar': obj.user.avatar.url if obj.user.avatar else None,
                'is_premium': getattr(obj.user, 'is_premium', False)
            }
        return None
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_reply_to_message(self, obj):
        if obj.reply_to:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content[:100],
                'user': obj.reply_to.user.full_name if obj.reply_to.user else 'System'
            }
        return None
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.user:
            return obj.user == request.user
        return False


class PartyReactionSerializer(serializers.ModelSerializer):
    """Party reaction serializer"""
    
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = PartyReaction
        fields = [
            'id', 'user', 'emoji', 'video_timestamp', 'x_position', 'y_position',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'name': obj.user.full_name,
            'avatar': obj.user.avatar.url if obj.user.avatar else None
        }


class PartyInvitationSerializer(serializers.ModelSerializer):
    """Party invitation serializer"""
    
    party = WatchPartySerializer(read_only=True)
    inviter = serializers.SerializerMethodField()
    invitee = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = PartyInvitation
        fields = [
            'id', 'party', 'inviter', 'invitee', 'status', 'message',
            'is_expired', 'created_at', 'responded_at', 'expires_at'
        ]
        read_only_fields = ['id', 'inviter', 'created_at', 'responded_at']
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_expired(self, obj: Any) -> bool:
        """Check if invitation has expired"""
        if not obj.expires_at:
            return False
        return obj.expires_at < timezone.now()
    
    @extend_schema_field(serializers.DictField)
    def get_inviter(self, obj: Any) -> dict:
        """Get inviter information"""
        return {
            'id': str(obj.inviter.id),
            'name': obj.inviter.full_name,
            'avatar': obj.inviter.avatar.url if obj.inviter.avatar else None
        }
    
    @extend_schema_field(serializers.DictField)
    def get_invitee(self, obj: Any) -> dict:
        """Get invitee information"""
        return {
            'id': str(obj.invitee.id),
            'name': obj.invitee.full_name,
            'avatar': obj.invitee.avatar.url if obj.invitee.avatar else None
        }


class PartyInvitationCreateSerializer(serializers.Serializer):
    """Party invitation creation serializer"""
    
    invitee_id = serializers.UUIDField()
    message = serializers.CharField(required=False, allow_blank=True)
    
    def validate_invitee_id(self, value):
        try:
            User.objects.get(id=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")


class PartyJoinSerializer(serializers.Serializer):
    """Party join serializer"""
    
    room_code = serializers.CharField(max_length=10, required=False)
    
    def validate_room_code(self, value):
        if value:
            try:
                WatchParty.objects.get(room_code=value)
                return value
            except WatchParty.DoesNotExist:
                raise serializers.ValidationError("Invalid room code")
        return value


class VideoControlSerializer(serializers.Serializer):
    """Video control serializer for WebSocket messages"""
    
    action = serializers.ChoiceField(choices=['play', 'pause', 'seek'])
    timestamp = serializers.DurationField(required=False)
    
    def validate(self, data):
        if data['action'] == 'seek' and 'timestamp' not in data:
            raise serializers.ValidationError("Timestamp required for seek action")
        return data


class PartyReportSerializer(serializers.ModelSerializer):
    """Party report serializer"""
    
    reporter = serializers.SerializerMethodField()
    reported_user = serializers.SerializerMethodField()
    party_title = serializers.CharField(source='party.title', read_only=True)
    
    class Meta:
        model = PartyReport
        fields = [
            'id', 'party_title', 'reporter', 'reported_user', 'report_type',
            'description', 'status', 'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_reporter(self, obj):
        return {
            'id': str(obj.reporter.id),
            'name': obj.reporter.full_name
        }
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_reported_user(self, obj):
        if obj.reported_user:
            return {
                'id': str(obj.reported_user.id),
                'name': obj.reported_user.full_name
            }
        return None


class PartySearchSerializer(serializers.Serializer):
    """Party search serializer"""
    
    query = serializers.CharField(required=False, allow_blank=True)
    host = serializers.UUIDField(required=False)
    status = serializers.ChoiceField(choices=WatchParty.STATUS_CHOICES, required=False)
    visibility = serializers.ChoiceField(choices=WatchParty.VISIBILITY_CHOICES, required=False)
    has_space = serializers.BooleanField(required=False)
    order_by = serializers.ChoiceField(
        choices=['created_at', '-created_at', 'title', '-title', 'scheduled_start', '-scheduled_start'],
        default='-created_at'
    )
