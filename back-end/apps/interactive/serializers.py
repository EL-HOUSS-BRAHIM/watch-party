"""
Serializers for the Interactive app.
Handles serialization of interactive features data.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import (
    LiveReaction, VoiceChatRoom, VoiceChatParticipant, ScreenShare,
    InteractivePoll, PollResponse, InteractiveAnnotation, InteractiveSession
)

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for interactive features"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar']
        read_only_fields = ['id', 'username', 'first_name', 'last_name', 'avatar']


# ============================================================================
# LIVE REACTIONS
# ============================================================================

class LiveReactionSerializer(serializers.ModelSerializer):
    """Serializer for live reactions"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = LiveReaction
        fields = [
            'id', 'user', 'party', 'reaction', 'position_x', 
            'position_y', 'video_timestamp', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'party', 'created_at']
    
    def validate_reaction(self, value):
        """Validate reaction type"""
        valid_reactions = [choice[0] for choice in LiveReaction.REACTION_CHOICES]
        if value not in valid_reactions:
            raise serializers.ValidationError(f"Invalid reaction. Must be one of: {valid_reactions}")
        return value
    
    def validate(self, data):
        """Validate reaction data"""
        # Check position bounds
        if 'position_x' in data and not (0 <= data['position_x'] <= 1):
            raise serializers.ValidationError("position_x must be between 0 and 1")
        if 'position_y' in data and not (0 <= data['position_y'] <= 1):
            raise serializers.ValidationError("position_y must be between 0 and 1")
        
        return data


# ============================================================================
# VOICE CHAT
# ============================================================================

class VoiceChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for voice chat rooms"""
    
    participant_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = VoiceChatRoom
        fields = [
            'id', 'party', 'max_participants', 'participant_count',
            'require_permission', 'audio_quality', 'noise_cancellation',
            'echo_cancellation', 'ice_servers', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'party', 'participant_count', 'created_at']
    
    def validate_max_participants(self, value):
        """Validate max participants"""
        if value < 1 or value > 100:
            raise serializers.ValidationError("max_participants must be between 1 and 100")
        return value
    
    def validate_audio_quality(self, value):
        """Validate audio quality"""
        valid_qualities = [choice[0] for choice in VoiceChatRoom.AUDIO_QUALITY_CHOICES]
        if value not in valid_qualities:
            raise serializers.ValidationError(f"Invalid audio quality. Must be one of: {valid_qualities}")
        return value


class VoiceChatParticipantSerializer(serializers.ModelSerializer):
    """Serializer for voice chat participants"""
    
    user = UserBasicSerializer(read_only=True)
    session_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = VoiceChatParticipant
        fields = [
            'id', 'user', 'room', 'peer_id', 'is_connected', 'is_muted',
            'joined_at', 'left_at', 'session_duration'
        ]
        read_only_fields = ['id', 'user', 'room', 'joined_at', 'left_at', 'session_duration']
    
    def get_session_duration(self, obj):
        """Calculate session duration"""
        if obj.left_at:
            return (obj.left_at - obj.joined_at).total_seconds()
        elif obj.is_connected:
            return (timezone.now() - obj.joined_at).total_seconds()
        return 0


# ============================================================================
# SCREEN SHARING
# ============================================================================

class ScreenShareSerializer(serializers.ModelSerializer):
    """Serializer for screen sharing sessions"""
    
    user = UserBasicSerializer(read_only=True)
    share_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = ScreenShare
        fields = [
            'share_id', 'user', 'party', 'title', 'description', 'share_type',
            'resolution', 'frame_rate', 'viewer_count', 'viewers_can_annotate',
            'allow_remote_control', 'is_recording', 'is_active', 'started_at',
            'ended_at', 'share_duration', 'ice_servers'
        ]
        read_only_fields = ['share_id', 'user', 'party', 'viewer_count', 'started_at', 'ended_at', 'share_duration']
    
    def get_share_duration(self, obj):
        """Calculate share duration"""
        if obj.ended_at:
            return (obj.ended_at - obj.started_at).total_seconds()
        elif obj.is_active:
            return (timezone.now() - obj.started_at).total_seconds()
        return 0
    
    def validate_resolution(self, value):
        """Validate resolution format"""
        try:
            width, height = map(int, value.split('x'))
            if width < 640 or height < 480:
                raise serializers.ValidationError("Minimum resolution is 640x480")
            if width > 3840 or height > 2160:
                raise serializers.ValidationError("Maximum resolution is 3840x2160")
        except (ValueError, AttributeError):
            raise serializers.ValidationError("Invalid resolution format. Use format like '1920x1080'")
        return value
    
    def validate_frame_rate(self, value):
        """Validate frame rate"""
        if value < 1 or value > 60:
            raise serializers.ValidationError("frame_rate must be between 1 and 60")
        return value


# ============================================================================
# INTERACTIVE POLLS
# ============================================================================

class InteractivePollSerializer(serializers.ModelSerializer):
    """Serializer for interactive polls"""
    
    creator = UserBasicSerializer(read_only=True)
    is_expired = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = InteractivePoll
        fields = [
            'poll_id', 'creator', 'party', 'question', 'poll_type',
            'options', 'min_rating', 'max_rating', 'allows_multiple',
            'video_timestamp', 'expires_at', 'is_published', 'total_responses',
            'created_at', 'is_expired', 'time_remaining'
        ]
        read_only_fields = ['poll_id', 'creator', 'party', 'total_responses', 'created_at', 'is_expired', 'time_remaining']
    
    def get_is_expired(self, obj):
        """Check if poll is expired"""
        return obj.is_expired()
    
    def get_time_remaining(self, obj):
        """Get time remaining in seconds"""
        if obj.expires_at and obj.expires_at > timezone.now():
            return (obj.expires_at - timezone.now()).total_seconds()
        return 0
    
    def validate_poll_type(self, value):
        """Validate poll type"""
        valid_types = [choice[0] for choice in InteractivePoll.POLL_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid poll type. Must be one of: {valid_types}")
        return value
    
    def validate_options(self, value):
        """Validate poll options"""
        if not isinstance(value, list):
            raise serializers.ValidationError("options must be a list")
        
        if len(value) < 2:
            raise serializers.ValidationError("Poll must have at least 2 options")
        
        if len(value) > 10:
            raise serializers.ValidationError("Poll can have maximum 10 options")
        
        # Check for empty options
        for option in value:
            if not option or not option.strip():
                raise serializers.ValidationError("All options must be non-empty")
        
        return value
    
    def validate(self, data):
        """Validate poll data"""
        poll_type = data.get('poll_type')
        
        # Validate rating polls
        if poll_type == 'rating':
            min_rating = data.get('min_rating', 1)
            max_rating = data.get('max_rating', 5)
            
            if min_rating >= max_rating:
                raise serializers.ValidationError("max_rating must be greater than min_rating")
            
            if max_rating - min_rating > 10:
                raise serializers.ValidationError("Rating range cannot exceed 10 points")
        
        # Validate expiry date
        expires_at = data.get('expires_at')
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError("expires_at must be in the future")
        
        return data


class PollResponseSerializer(serializers.ModelSerializer):
    """Serializer for poll responses"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PollResponse
        fields = [
            'id', 'user', 'poll', 'selected_option', 'text_response',
            'rating_value', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'poll', 'created_at']
    
    def validate(self, data):
        """Validate poll response based on poll type"""
        poll = data.get('poll') or self.instance.poll if self.instance else None
        
        if not poll:
            return data
        
        if poll.poll_type == 'multiple_choice':
            selected_option = data.get('selected_option')
            if selected_option is None:
                raise serializers.ValidationError("selected_option is required for multiple choice polls")
            
            if selected_option < 0 or selected_option >= len(poll.options):
                raise serializers.ValidationError("Invalid option selected")
        
        elif poll.poll_type == 'text':
            text_response = data.get('text_response')
            if not text_response or not text_response.strip():
                raise serializers.ValidationError("text_response is required for text polls")
        
        elif poll.poll_type == 'rating':
            rating_value = data.get('rating_value')
            if rating_value is None:
                raise serializers.ValidationError("rating_value is required for rating polls")
            
            if rating_value < poll.min_rating or rating_value > poll.max_rating:
                raise serializers.ValidationError(
                    f"rating_value must be between {poll.min_rating} and {poll.max_rating}"
                )
        
        return data


# ============================================================================
# ANNOTATIONS
# ============================================================================

class InteractiveAnnotationSerializer(serializers.ModelSerializer):
    """Serializer for interactive annotations"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = InteractiveAnnotation
        fields = [
            'annotation_id', 'user', 'screen_share', 'annotation_type',
            'position_x', 'position_y', 'width', 'height', 'content',
            'color', 'stroke_width', 'is_visible', 'expires_at', 'created_at'
        ]
        read_only_fields = ['annotation_id', 'user', 'screen_share', 'created_at']
    
    def validate_annotation_type(self, value):
        """Validate annotation type"""
        valid_types = [choice[0] for choice in InteractiveAnnotation.ANNOTATION_TYPE_CHOICES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid annotation type. Must be one of: {valid_types}")
        return value
    
    def validate(self, data):
        """Validate annotation data"""
        # Check position bounds
        for field in ['position_x', 'position_y']:
            if field in data and not (0 <= data[field] <= 1):
                raise serializers.ValidationError(f"{field} must be between 0 and 1")
        
        # Check dimensions
        for field in ['width', 'height']:
            if field in data and not (0 < data[field] <= 1):
                raise serializers.ValidationError(f"{field} must be between 0 and 1")
        
        # Check stroke width
        if 'stroke_width' in data and not (1 <= data['stroke_width'] <= 10):
            raise serializers.ValidationError("stroke_width must be between 1 and 10")
        
        return data


# ============================================================================
# SESSIONS
# ============================================================================

class InteractiveSessionSerializer(serializers.ModelSerializer):
    """Serializer for interactive sessions"""
    
    user = UserBasicSerializer(read_only=True)
    session_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = InteractiveSession
        fields = [
            'session_id', 'user', 'party', 'reactions_sent',
            'voice_chat_duration', 'screen_shares_initiated', 'polls_participated',
            'annotations_created', 'started_at', 'ended_at', 'session_duration'
        ]
        read_only_fields = [
            'session_id', 'user', 'party', 'reactions_sent',
            'voice_chat_duration', 'screen_shares_initiated', 'polls_participated',
            'annotations_created', 'started_at', 'ended_at', 'session_duration'
        ]
    
    def get_session_duration(self, obj):
        """Calculate session duration"""
        if obj.ended_at:
            return (obj.ended_at - obj.started_at).total_seconds()
        else:
            return (timezone.now() - obj.started_at).total_seconds()


# ============================================================================
# STATISTICS SERIALIZERS
# ============================================================================

class InteractiveStatsSerializer(serializers.Serializer):
    """Serializer for interactive features statistics"""
    
    party_id = serializers.IntegerField()
    total_reactions = serializers.IntegerField()
    total_voice_participants = serializers.IntegerField()
    total_screen_shares = serializers.IntegerField()
    total_polls = serializers.IntegerField()
    total_poll_responses = serializers.IntegerField()
    average_engagement_score = serializers.FloatField()
    peak_concurrent_users = serializers.IntegerField()
    most_popular_reaction = serializers.CharField()
    most_active_user = serializers.CharField()
    
    class Meta:
        fields = [
            'party_id', 'total_reactions', 'total_voice_participants',
            'total_screen_shares', 'total_polls', 'total_poll_responses',
            'average_engagement_score', 'peak_concurrent_users',
            'most_popular_reaction', 'most_active_user'
        ]


class WebSocketMessageSerializer(serializers.Serializer):
    """Serializer for WebSocket messages"""
    
    type = serializers.CharField()
    data = serializers.DictField()
    timestamp = serializers.DateTimeField(default=timezone.now)
    user_id = serializers.IntegerField(required=False)
    party_id = serializers.IntegerField()
    
    def validate_type(self, value):
        """Validate message type"""
        valid_types = [
            'live_reaction', 'voice_chat_join', 'voice_chat_leave',
            'voice_chat_mute', 'voice_chat_unmute', 'screen_share_start',
            'screen_share_end', 'screen_annotation', 'poll_created',
            'poll_response', 'poll_results'
        ]
        
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid message type. Must be one of: {valid_types}")
        return value
