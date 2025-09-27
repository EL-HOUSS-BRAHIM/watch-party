"""
Messaging serializers for Watch Party Backend
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from .models import Conversation, Message, ConversationParticipant

User = get_user_model()


class ConversationSerializer(serializers.ModelSerializer):
    """Conversation serializer for listing user conversations"""
    
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'conversation_type', 'title', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_participants(self, obj: Conversation) -> list:
        """Get conversation participants"""
        participants = []
        for participant in obj.participants.all():
            participants.append({
                'id': str(participant.id),
                'username': participant.username,
                'email': participant.email
            })
        return participants
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_last_message(self, obj: Conversation) -> dict:
        """Get last message in conversation"""
        last_message = obj.messages.filter(is_deleted=False).order_by('-sent_at').first()
        if not last_message:
            return {}
        return {
            'id': str(last_message.id),
            'content': last_message.content,
            'sender': last_message.sender.username,
            'sent_at': last_message.sent_at
        }
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_unread_count(self, obj: Conversation) -> int:
        """Get unread message count for current user"""
        # This would need access to the request user, simplified for now
        return 0


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer for listing messages in a conversation"""
    
    sender = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'sender', 'sent_at', 'edited_at', 'is_edited']
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_sender(self, obj: Message) -> dict:
        """Get message sender info"""
        return {
            'id': str(obj.sender.id),
            'username': obj.sender.username
        }
