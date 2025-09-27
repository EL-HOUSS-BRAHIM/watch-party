"""
Chat serializers for Watch Party Backend
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from typing import Optional, Dict, Any
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import ChatRoom, ChatMessage, ChatModerationLog, ChatBan

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information for chat"""
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar', 'is_premium']
        read_only_fields = ['id', 'is_premium']


class ChatRoomSerializer(serializers.ModelSerializer):
    """Chat room serializer"""
    
    party_title = serializers.CharField(source='party.title', read_only=True)
    active_user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'party', 'party_title',
            'max_users', 'is_moderated', 'allow_anonymous', 'slow_mode_seconds',
            'active_user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'party', 'party_title', 'active_user_count', 'created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_active_user_count(self, obj: Any) -> int:
        """Get count of currently active users in room"""
        return obj.active_user_count
    
    def validate_max_users(self, value):
        """Validate max users limit"""
        if value < 1 or value > 1000:
            raise serializers.ValidationError("Max users must be between 1 and 1000")
        return value
    
    def validate_slow_mode_seconds(self, value):
        """Validate slow mode seconds"""
        if value < 0 or value > 3600:  # Max 1 hour
            raise serializers.ValidationError("Slow mode must be between 0 and 3600 seconds")
        return value


class ChatMessageSerializer(serializers.ModelSerializer):
    """Chat message serializer"""
    
    user = UserBasicSerializer(read_only=True)
    reply_to_message = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    is_visible = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'user', 'content', 'message_type',
            'reply_to', 'reply_to_message', 'reply_count',
            'moderation_status', 'is_visible', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'reply_to_message', 'reply_count', 'is_visible',
            'moderation_status', 'created_at', 'updated_at'
        ]
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_visible(self, obj: Any) -> bool:
        """Check if message is visible to current user"""
        return obj.is_visible
    
    @extend_schema_field(serializers.IntegerField)
    def get_reply_count(self, obj: Any) -> int:
        """Get count of replies to this message"""
        return obj.reply_count
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_reply_to_message(self, obj) -> Optional[Dict[str, Any]]:
        """Get basic info about the message being replied to"""
        if obj.reply_to and obj.reply_to.is_visible:
            return {
                'id': obj.reply_to.id,
                'user': UserBasicSerializer(obj.reply_to.user).data if obj.reply_to.user else None,
                'content': obj.reply_to.content[:100],  # Truncate for preview
                'created_at': obj.reply_to.created_at
            }
        return None
    
    def validate_content(self, value):
        """Validate message content"""
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        if len(value) > 2000:
            raise serializers.ValidationError("Message content cannot exceed 2000 characters")
        return value.strip()
    
    def validate_reply_to(self, value):
        """Validate reply target"""
        if value and value.room != self.context.get('room'):
            raise serializers.ValidationError("Can only reply to messages in the same room")
        return value
    
    def create(self, validated_data):
        """Create message with user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = ['content', 'message_type', 'reply_to', 'metadata']
    
    def validate_content(self, value):
        """Validate message content"""
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        if len(value) > 2000:
            raise serializers.ValidationError("Message content cannot exceed 2000 characters")
        return value.strip()


class ChatModerationLogSerializer(serializers.ModelSerializer):
    """Chat moderation log serializer"""
    
    moderator = UserBasicSerializer(read_only=True)
    target_user = UserBasicSerializer(read_only=True)
    message_preview = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatModerationLog
        fields = [
            'id', 'room', 'moderator', 'target_user', 'message', 'message_preview',
            'action_type', 'reason', 'duration', 'is_active',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'moderator', 'message_preview', 'is_active', 'created_at']
    
    @extend_schema_field(serializers.BooleanField)
    def get_is_active(self, obj: Any) -> bool:
        """Check if moderation action is still active"""
        return obj.is_active
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_message_preview(self, obj) -> Optional[Dict[str, Any]]:
        """Get preview of the moderated message"""
        if obj.message:
            return {
                'id': obj.message.id,
                'content': obj.message.content[:100],
                'created_at': obj.message.created_at
            }
        return None


class ChatBanSerializer(serializers.ModelSerializer):
    """Chat ban serializer"""
    
    user = UserBasicSerializer(read_only=True)
    banned_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ChatBan
        fields = [
            'id', 'room', 'user', 'banned_by', 'ban_type', 'reason',
            'created_at', 'expires_at', 'is_active'
        ]
        read_only_fields = ['id', 'user', 'banned_by', 'created_at']
    
    def validate_expires_at(self, value):
        """Validate ban expiration date"""
        if value and self.instance and self.instance.ban_type == 'permanent':
            raise serializers.ValidationError("Permanent bans cannot have expiration dates")
        return value


class ChatRoomStatsSerializer(serializers.ModelSerializer):
    """Chat room statistics serializer"""
    
    active_user_count = serializers.SerializerMethodField()
    total_messages = serializers.SerializerMethodField()
    active_messages = serializers.SerializerMethodField()
    total_users = serializers.SerializerMethodField()
    banned_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'active_user_count', 'total_messages',
            'active_messages', 'total_users', 'banned_users_count'
        ]
    
    @extend_schema_field(serializers.IntegerField)
    def get_active_user_count(self, obj: Any) -> int:
        """Get count of currently active users"""
        return obj.active_user_count
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_total_messages(self, obj) -> int:
        """Get total message count"""
        return obj.messages.count()
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_active_messages(self, obj) -> int:
        """Get active message count"""
        return obj.messages.filter(moderation_status='active').count()
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_total_users(self, obj) -> int:
        """Get total users who have participated"""
        return obj.messages.values('user').distinct().count()
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_banned_users_count(self, obj) -> int:
        """Get banned users count"""
        return obj.banned_users.filter(is_active=True).count()


# WebSocket message serializers
class WebSocketMessageSerializer(serializers.Serializer):
    """Serializer for WebSocket messages"""
    
    type = serializers.CharField()
    data = serializers.JSONField()
    
    def validate_type(self, value):
        """Validate message type"""
        allowed_types = [
            'chat.message', 'chat.join', 'chat.leave', 'chat.typing',
            'chat.reaction', 'chat.moderation', 'chat.user_list'
        ]
        if value not in allowed_types:
            raise serializers.ValidationError(f"Invalid message type: {value}")
        return value


class TypingIndicatorSerializer(serializers.Serializer):
    """Serializer for typing indicators"""
    
    user = UserBasicSerializer()
    is_typing = serializers.BooleanField()
    timestamp = serializers.DateTimeField()


class UserJoinLeaveSerializer(serializers.Serializer):
    """Serializer for user join/leave events"""
    
    user = UserBasicSerializer()
    action = serializers.ChoiceField(choices=['join', 'leave'])
    timestamp = serializers.DateTimeField()
    user_count = serializers.IntegerField()


# Additional serializers for views that need explicit serializer_class

class ModerateChatSerializer(serializers.Serializer):
    """Serializer for chat moderation actions"""
    action = serializers.ChoiceField(choices=['delete_message', 'ban_user', 'mute_user', 'slow_mode'])
    message_id = serializers.UUIDField(required=False)
    user_id = serializers.UUIDField(required=False)
    duration_minutes = serializers.IntegerField(required=False, min_value=1, max_value=10080)  # Max 1 week
    reason = serializers.CharField(max_length=500, required=False)
    slow_mode_seconds = serializers.IntegerField(required=False, min_value=0, max_value=3600)

class UnbanUserSerializer(serializers.Serializer):
    """Serializer for unbanning users"""
    user_id = serializers.UUIDField()
    reason = serializers.CharField(max_length=500, required=False)

class ChatStatsRequestSerializer(serializers.Serializer):
    """Serializer for chat statistics requests"""
    days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=365)
