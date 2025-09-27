"""
Messaging views for Watch Party Backend
Handles private messaging between users
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema
from shared.responses import StandardResponse
from .models import Conversation, Message, ConversationParticipant
from .serializers import ConversationSerializer, MessageSerializer


class ConversationsView(APIView):
    """List user's conversations"""
    
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="ConversationsView GET")
    def get(self, request):
        """Get user's conversations"""
        user = request.user
        
        # Get conversations where user is an active participant
        conversations = Conversation.objects.filter(
            conversation_participants__user=user,
            conversation_participants__is_active=True,
            is_active=True
        ).prefetch_related(
            'participants',
            'messages'
        ).order_by('-updated_at')
        
        conversations_data = []
        for conversation in conversations:
            # Get last message
            last_message = conversation.last_message
            
            # Get user's participant record for unread count
            user_participant = conversation.conversation_participants.filter(user=user).first()
            
            # Get other participants (for direct messages)
            other_participants = conversation.participants.exclude(id=user.id)
            
            conversation_data = {
                'id': conversation.id,
                'type': conversation.conversation_type,
                'title': conversation.title if conversation.conversation_type == 'group' else None,
                'participant_count': conversation.participant_count,
                'unread_count': user_participant.unread_count if user_participant else 0,
                'last_message': {
                    'id': last_message.id,
                    'content': last_message.content[:100] + '...' if len(last_message.content) > 100 else last_message.content,
                    'sender': {
                        'id': last_message.sender.id,
                        'name': last_message.sender.get_full_name(),
                    },
                    'sent_at': last_message.sent_at,
                    'message_type': last_message.message_type,
                } if last_message else None,
                'updated_at': conversation.updated_at,
            }
            
            # For direct messages, add other participant info
            if conversation.conversation_type == 'direct' and other_participants.exists():
                other_participant = other_participants.first()
                conversation_data['other_participant'] = {
                    'id': other_participant.id,
                    'name': other_participant.get_full_name(),
                    'avatar': other_participant.profile_picture.url if hasattr(other_participant, 'profile_picture') and other_participant.profile_picture else None,
                    'is_online': getattr(other_participant, 'is_online', False),
                }
            
            conversations_data.append(conversation_data)
        
        return StandardResponse.success(
            data={
                'conversations': conversations_data,
                'total_unread': sum(conv['unread_count'] for conv in conversations_data),
            },
            message="Conversations retrieved successfully"
        )
    
    @extend_schema(summary="ConversationsView POST")
    def post(self, request):
        """Create a new conversation"""
        user = request.user
        participant_ids = request.data.get('participant_ids', [])
        conversation_type = request.data.get('type', 'direct')
        title = request.data.get('title', '').strip()
        
        if not participant_ids:
            return StandardResponse.error("At least one participant is required")
        
        # Add current user to participants
        if user.id not in participant_ids:
            participant_ids.append(str(user.id))
        
        # Validate participants
        try:
            participants = User.objects.filter(id__in=participant_ids, is_active=True)
            if participants.count() != len(participant_ids):
                return StandardResponse.error("Some participants not found")
        except ValueError:
            return StandardResponse.error("Invalid participant IDs")
        
        # For direct messages, check if conversation already exists
        if conversation_type == 'direct' and len(participant_ids) == 2:
            existing_conversation = Conversation.objects.filter(
                conversation_type='direct',
                participants__in=participants
            ).annotate(
                participant_count=models.Count('participants')
            ).filter(participant_count=2).first()
            
            if existing_conversation:
                return StandardResponse.success(
                    data={'conversation_id': existing_conversation.id},
                    message="Conversation already exists"
                )
        
        # Create conversation
        conversation = Conversation.objects.create(
            conversation_type=conversation_type,
            title=title if conversation_type == 'group' else ''
        )
        
        # Add participants
        for participant in participants:
            conversation.add_participant(participant, added_by=user)
        
        return StandardResponse.created(
            data={'conversation_id': conversation.id},
            message="Conversation created successfully"
        )


class MessagesView(APIView):
    """Get and send messages in a conversation"""
    
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="MessagesView GET")
    def get(self, request, conversation_id):
        """Get messages from a conversation"""
        user = request.user
        
        try:
            conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        except Conversation.DoesNotExist:
            return StandardResponse.not_found("Conversation not found")
        
        # Check if user is a participant
        user_participant = conversation.conversation_participants.filter(
            user=user, is_active=True
        ).first()
        
        if not user_participant:
            return StandardResponse.forbidden("You are not a participant in this conversation")
        
        # Get messages with pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        offset = (page - 1) * page_size
        
        messages = conversation.messages.filter(
            is_deleted=False
        ).select_related('sender', 'reply_to__sender').order_by('-sent_at')[offset:offset + page_size]
        
        messages_data = []
        for message in reversed(messages):  # Reverse to show oldest first
            message_data = {
                'id': message.id,
                'content': message.content,
                'message_type': message.message_type,
                'sender': {
                    'id': message.sender.id,
                    'name': message.sender.get_full_name(),
                    'avatar': message.sender.profile_picture.url if hasattr(message.sender, 'profile_picture') and message.sender.profile_picture else None,
                },
                'sent_at': message.sent_at,
                'is_edited': message.is_edited,
                'edited_at': message.edited_at,
                'attachments': message.attachments,
            }
            
            # Add reply info if this is a reply
            if message.reply_to:
                message_data['reply_to'] = {
                    'id': message.reply_to.id,
                    'content': message.reply_to.content[:100] + '...' if len(message.reply_to.content) > 100 else message.reply_to.content,
                    'sender': {
                        'id': message.reply_to.sender.id,
                        'name': message.reply_to.sender.get_full_name(),
                    }
                }
            
            # Add reactions
            reactions = message.reactions.all()
            if reactions:
                reaction_summary = {}
                for reaction in reactions:
                    emoji = dict(MessageReaction.REACTION_CHOICES)[reaction.reaction]
                    if emoji not in reaction_summary:
                        reaction_summary[emoji] = {'count': 0, 'users': []}
                    reaction_summary[emoji]['count'] += 1
                    reaction_summary[emoji]['users'].append({
                        'id': reaction.user.id,
                        'name': reaction.user.get_full_name()
                    })
                message_data['reactions'] = reaction_summary
            
            messages_data.append(message_data)
        
        # Mark as read
        user_participant.mark_as_read()
        
        return StandardResponse.success(
            data={
                'messages': messages_data,
                'has_more': len(messages) == page_size,
                'page': page,
            },
            message="Messages retrieved successfully"
        )
    
    @extend_schema(summary="MessagesView POST")
    def post(self, request, conversation_id):
        """Send a message to a conversation"""
        user = request.user
        
        try:
            conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        except Conversation.DoesNotExist:
            return StandardResponse.not_found("Conversation not found")
        
        # Check if user is a participant
        user_participant = conversation.conversation_participants.filter(
            user=user, is_active=True
        ).first()
        
        if not user_participant:
            return StandardResponse.forbidden("You are not a participant in this conversation")
        
        content = request.data.get('content', '').strip()
        message_type = request.data.get('message_type', 'text')
        reply_to_id = request.data.get('reply_to_id')
        
        if not content:
            return StandardResponse.error("Message content is required")
        
        # Validate reply_to if provided
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(
                    id=reply_to_id,
                    conversation=conversation,
                    is_deleted=False
                )
            except Message.DoesNotExist:
                return StandardResponse.error("Reply message not found")
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
            message_type=message_type,
            reply_to=reply_to
        )
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        # TODO: Send real-time notification via WebSocket
        
        return StandardResponse.created(
            data={
                'message_id': message.id,
                'sent_at': message.sent_at,
            },
            message="Message sent successfully"
        )
