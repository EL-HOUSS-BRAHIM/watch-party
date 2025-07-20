"""
Chat views for Watch Party Backend
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from .models import ChatRoom, ChatMessage, ChatModerationLog, ChatBan
from .serializers import (
    ChatRoomSerializer, ChatMessageSerializer, ChatMessageCreateSerializer,
    ChatModerationLogSerializer, ChatBanSerializer, ChatRoomStatsSerializer
)
from apps.parties.models import WatchParty

User = get_user_model()


class ChatHistoryView(generics.ListAPIView):
    """Get chat history for a party"""
    
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user has access to the party
        user = self.request.user
        party = room.party
        
        # Allow if user is host, participant, or party is public
        if not (party.host == user or 
                party.participants.filter(id=user.id).exists() or
                party.visibility == 'public'):
            return ChatMessage.objects.none()
        
        # Get recent messages (last 100 by default)
        limit = min(int(self.request.GET.get('limit', 100)), 500)  # Max 500 messages
        
        return room.messages.filter(
            moderation_status='active'
        ).select_related(
            'user', 'reply_to__user'
        ).order_by('-created_at')[:limit]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        room_id = self.kwargs.get('room_id')
        context['room'] = get_object_or_404(ChatRoom, id=room_id)
        return context


class SendMessageView(generics.CreateAPIView):
    """Send a message to chat room"""
    
    serializer_class = ChatMessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        room_id = kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        user = request.user
        
        # Check if user has access to the party
        party = room.party
        if not (party.host == user or 
                party.participants.filter(id=user.id).exists() or
                party.visibility == 'public'):
            return Response(
                {'error': 'You do not have access to this chat room'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user is banned
        if room.banned_users.filter(user=user, is_active=True).exists():
            return Response(
                {'error': 'You are banned from this chat room'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if party allows chat
        if not party.allow_chat:
            return Response(
                {'error': 'Chat is disabled for this party'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create message
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message = serializer.save(
            user=user,
            room=room
        )
        
        # Return full message data
        response_serializer = ChatMessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ModerateChatView(generics.GenericAPIView):
    """Moderate chat messages and users"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        room_id = kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        user = request.user
        party = room.party
        
        # Check if user is host or has moderation permissions
        if party.host != user:
            return Response(
                {'error': 'Only the party host can moderate chat'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')
        message_id = request.data.get('message_id')
        target_user_id = request.data.get('target_user_id')
        reason = request.data.get('reason', '')
        
        if action == 'hide_message' and message_id:
            return self._hide_message(room, message_id, user, reason)
        elif action == 'delete_message' and message_id:
            return self._delete_message(room, message_id, user, reason)
        elif action == 'ban_user' and target_user_id:
            return self._ban_user(room, target_user_id, user, reason, request.data)
        elif action == 'timeout_user' and target_user_id:
            return self._timeout_user(room, target_user_id, user, reason, request.data)
        else:
            return Response(
                {'error': 'Invalid action or missing parameters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _hide_message(self, room, message_id, moderator, reason):
        """Hide a chat message"""
        try:
            message = room.messages.get(id=message_id)
            message.moderation_status = 'hidden'
            message.moderated_by = moderator
            message.moderation_reason = reason
            message.save()
            
            # Log the action
            ChatModerationLog.objects.create(
                room=room,
                moderator=moderator,
                target_user=message.user,
                message=message,
                action_type='hide',
                reason=reason
            )
            
            return Response({'message': 'Message hidden successfully'})
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _delete_message(self, room, message_id, moderator, reason):
        """Delete a chat message"""
        try:
            message = room.messages.get(id=message_id)
            message.moderation_status = 'deleted'
            message.moderated_by = moderator
            message.moderation_reason = reason
            message.save()
            
            # Log the action
            ChatModerationLog.objects.create(
                room=room,
                moderator=moderator,
                target_user=message.user,
                message=message,
                action_type='delete',
                reason=reason
            )
            
            return Response({'message': 'Message deleted successfully'})
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _ban_user(self, room, target_user_id, moderator, reason, data):
        """Ban a user from chat room"""
        try:
            target_user = User.objects.get(id=target_user_id)
            
            # Check if user is already banned
            existing_ban = room.banned_users.filter(user=target_user, is_active=True).first()
            if existing_ban:
                return Response(
                    {'error': 'User is already banned'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ban_type = data.get('ban_type', 'temporary')
            expires_at = None
            
            if ban_type == 'temporary':
                duration_hours = int(data.get('duration_hours', 24))
                expires_at = timezone.now() + timezone.timedelta(hours=duration_hours)
            
            # Create ban
            ChatBan.objects.create(
                room=room,
                user=target_user,
                banned_by=moderator,
                ban_type=ban_type,
                reason=reason,
                expires_at=expires_at
            )
            
            # Remove user from active users
            room.remove_user(target_user)
            
            # Log the action
            ChatModerationLog.objects.create(
                room=room,
                moderator=moderator,
                target_user=target_user,
                action_type='ban_user',
                reason=reason,
                expires_at=expires_at
            )
            
            return Response({'message': 'User banned successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _timeout_user(self, room, target_user_id, moderator, reason, data):
        """Timeout a user (temporary ban)"""
        data['ban_type'] = 'timeout'
        data['duration_hours'] = min(int(data.get('duration_minutes', 10)) / 60, 24)  # Convert minutes to hours, max 24h
        return self._ban_user(room, target_user_id, moderator, reason, data)


class ChatSettingsView(generics.RetrieveUpdateAPIView):
    """Update chat room settings"""
    
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is host
        if room.party.host != self.request.user:
            raise permissions.PermissionDenied("Only the party host can update chat settings")
        
        return room


class BanUserView(generics.CreateAPIView):
    """Ban user from chat room"""
    
    serializer_class = ChatBanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        room_id = kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        user = request.user
        
        # Check if user is host
        if room.party.host != user:
            return Response(
                {'error': 'Only the party host can ban users'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is already banned
        existing_ban = room.banned_users.filter(user=target_user, is_active=True).first()
        if existing_ban:
            return Response(
                {'error': 'User is already banned'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ban = serializer.save(
            room=room,
            user=target_user,
            banned_by=user
        )
        
        # Remove user from active users
        room.remove_user(target_user)
        
        # Log the action
        ChatModerationLog.objects.create(
            room=room,
            moderator=user,
            target_user=target_user,
            action_type='ban_user',
            reason=ban.reason,
            expires_at=ban.expires_at
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnbanUserView(generics.GenericAPIView):
    """Unban user from chat room"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        room_id = kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        user = request.user
        
        # Check if user is host
        if room.party.host != user:
            return Response(
                {'error': 'Only the party host can unban users'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response(
                {'error': 'User ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            ban = room.banned_users.get(user_id=target_user_id, is_active=True)
            ban.lift_ban()
            
            # Log the action
            ChatModerationLog.objects.create(
                room=room,
                moderator=user,
                target_user=ban.user,
                action_type='unban_user',
                reason='Ban lifted by moderator'
            )
            
            return Response({'message': 'User unbanned successfully'})
        except ChatBan.DoesNotExist:
            return Response(
                {'error': 'Active ban not found for this user'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ChatModerationLogView(generics.ListAPIView):
    """Get moderation log for a chat room"""
    
    serializer_class = ChatModerationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is host
        if room.party.host != self.request.user:
            return ChatModerationLog.objects.none()
        
        return room.moderation_logs.select_related(
            'moderator', 'target_user', 'message'
        ).order_by('-created_at')


class ChatStatsView(generics.RetrieveAPIView):
    """Get chat room statistics"""
    
    serializer_class = ChatRoomStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user has access to the party
        user = self.request.user
        party = room.party
        
        if not (party.host == user or 
                party.participants.filter(id=user.id).exists() or
                party.visibility == 'public'):
            raise permissions.PermissionDenied("You do not have access to this chat room")
        
        return room


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_active_users(request, room_id):
    """Get list of active users in chat room"""
    room = get_object_or_404(ChatRoom, id=room_id)
    
    # Check if user has access to the party
    user = request.user
    party = room.party
    
    if not (party.host == user or 
            party.participants.filter(id=user.id).exists() or
            party.visibility == 'public'):
        return Response(
            {'error': 'You do not have access to this chat room'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .serializers import UserBasicSerializer
    active_users = room.active_users.all()
    serializer = UserBasicSerializer(active_users, many=True)
    
    return Response({
        'active_users': serializer.data,
        'count': active_users.count()
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_chat_room(request, room_id):
    """Join a chat room"""
    room = get_object_or_404(ChatRoom, id=room_id)
    user = request.user
    
    # Check if user has access to the party
    party = room.party
    if not (party.host == user or 
            party.participants.filter(id=user.id).exists() or
            party.visibility == 'public'):
        return Response(
            {'error': 'You do not have access to this chat room'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if user is banned
    if room.banned_users.filter(user=user, is_active=True).exists():
        return Response(
            {'error': 'You are banned from this chat room'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Add user to active users if not already there
    if not room.is_user_active(user):
        room.add_user(user)
    
    return Response({'message': 'Joined chat room successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_chat_room(request, room_id):
    """Leave a chat room"""
    room = get_object_or_404(ChatRoom, id=room_id)
    user = request.user
    
    # Remove user from active users
    if room.is_user_active(user):
        room.remove_user(user)
    
    return Response({'message': 'Left chat room successfully'})
