"""
WebSocket consumers for real-time chat functionality
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ChatRoom, ChatMessage
from .serializers import ChatMessageSerializer, UserBasicSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for chat functionality"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_id = None
        self.room_group_name = None
        self.user = None
        self.room = None
        self.typing_users = set()
        self.last_message_time = None
        
    async def connect(self):
        """Accept WebSocket connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user')
        
        # Reject if user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return
        
        try:
            # Verify room exists and user has access
            self.room = await self.get_chat_room(self.room_id)
            has_access = await self.check_user_access(self.user, self.room)
            
            if not has_access:
                await self.close(code=4003)
                return
                
            # Check if user is banned
            is_banned = await self.check_user_banned(self.user, self.room)
            if is_banned:
                await self.close(code=4004)
                return
            
            # Accept connection
            await self.accept()
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Add user to active users list
            await self.add_user_to_room(self.user, self.room)
            
            # Send user joined notification to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'user': await self.get_user_data(self.user),
                    'timestamp': timezone.now().isoformat(),
                    'user_count': await self.get_active_user_count(self.room)
                }
            )
            
            logger.info(f"User {self.user.id} connected to chat room {self.room_id}")
            
        except Exception as e:
            logger.error(f"Error connecting to chat room {self.room_id}: {str(e)}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.room_group_name and self.user:
            try:
                # Remove user from active users list
                await self.remove_user_from_room(self.user, self.room)
                
                # Stop typing if user was typing
                if self.user.id in self.typing_users:
                    await self.handle_stop_typing()
                
                # Send user left notification to room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_left',
                        'user': await self.get_user_data(self.user),
                        'timestamp': timezone.now().isoformat(),
                        'user_count': await self.get_active_user_count(self.room)
                    }
                )
                
                # Leave room group
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                
                logger.info(f"User {self.user.id} disconnected from chat room {self.room_id}")
                
            except Exception as e:
                logger.error(f"Error disconnecting from chat room {self.room_id}: {str(e)}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'stop_typing':
                await self.handle_stop_typing()
            elif message_type == 'reaction':
                await self.handle_reaction(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling message in room {self.room_id}: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Internal server error'
            }))
    
    async def handle_chat_message(self, data):
        """Handle chat message"""
        content = data.get('content', '').strip()
        reply_to_id = data.get('reply_to')
        message_type = data.get('message_type', 'text')
        
        if not content:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Message content cannot be empty'
            }))
            return
        
        # Check rate limiting (slow mode)
        if await self.check_rate_limit():
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Please wait before sending another message'
            }))
            return
        
        try:
            # Create message in database
            reply_to_message = None
            if reply_to_id:
                reply_to_message = await self.get_chat_message(reply_to_id)
            
            message = await self.create_chat_message(
                self.user, self.room, content, message_type, reply_to_message
            )
            
            # Send message to room group
            message_data = await self.get_message_data(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': message_data
                }
            )
            
            # Update last message time for rate limiting
            self.last_message_time = timezone.now()
            
        except Exception as e:
            logger.error(f"Error creating chat message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Failed to send message'
            }))
    
    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)
        
        if is_typing:
            self.typing_users.add(self.user.id)
        else:
            self.typing_users.discard(self.user.id)
        
        # Broadcast typing status to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user': await self.get_user_data(self.user),
                'is_typing': is_typing,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_stop_typing(self):
        """Handle stop typing"""
        if self.user.id in self.typing_users:
            self.typing_users.discard(self.user.id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': await self.get_user_data(self.user),
                    'is_typing': False,
                    'timestamp': timezone.now().isoformat()
                }
            )
    
    async def handle_reaction(self, data):
        """Handle emoji reactions"""
        emoji = data.get('emoji')
        timestamp = data.get('timestamp')
        
        if not emoji:
            return
        
        # Broadcast reaction to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'reaction_broadcast',
                'user': await self.get_user_data(self.user),
                'emoji': emoji,
                'timestamp': timestamp or timezone.now().isoformat()
            }
        )
    
    async def handle_ping(self):
        """Handle ping/heartbeat"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    async def check_rate_limit(self):
        """Check if user is rate limited (slow mode)"""
        if not self.last_message_time or not self.room.slow_mode_seconds:
            return False
        
        time_since_last = timezone.now() - self.last_message_time
        return time_since_last.total_seconds() < self.room.slow_mode_seconds
    
    # Group message handlers
    async def chat_message_broadcast(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def user_joined(self, event):
        """Send user joined notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'timestamp': event['timestamp'],
            'user_count': event['user_count']
        }))
    
    async def user_left(self, event):
        """Send user left notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'timestamp': event['timestamp'],
            'user_count': event['user_count']
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        # Don't send typing indicator to the user who is typing
        if event['user']['id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user': event['user'],
                'is_typing': event['is_typing'],
                'timestamp': event['timestamp']
            }))
    
    async def reaction_broadcast(self, event):
        """Send reaction to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'user': event['user'],
            'emoji': event['emoji'],
            'timestamp': event['timestamp']
        }))
    
    async def moderation_action(self, event):
        """Send moderation action notification"""
        await self.send(text_data=json.dumps({
            'type': 'moderation',
            'action': event['action'],
            'message_id': event.get('message_id'),
            'reason': event.get('reason'),
            'timestamp': event['timestamp']
        }))
    
    # Database operations (async wrappers)
    @database_sync_to_async
    def get_chat_room(self, room_id):
        """Get chat room from database"""
        return ChatRoom.objects.select_related('party').get(id=room_id)
    
    @database_sync_to_async
    def check_user_access(self, user, room):
        """Check if user has access to the chat room"""
        party = room.party
        return (
            party.host == user or 
            party.participants.filter(id=user.id).exists() or
            party.visibility == 'public'
        )
    
    @database_sync_to_async
    def check_user_banned(self, user, room):
        """Check if user is banned from the chat room"""
        return room.banned_users.filter(user=user, is_active=True).exists()
    
    @database_sync_to_async
    def add_user_to_room(self, user, room):
        """Add user to active users list"""
        room.add_user(user)
    
    @database_sync_to_async
    def remove_user_from_room(self, user, room):
        """Remove user from active users list"""
        room.remove_user(user)
    
    @database_sync_to_async
    def get_active_user_count(self, room):
        """Get count of active users in room"""
        return room.active_user_count
    
    @database_sync_to_async
    def create_chat_message(self, user, room, content, message_type, reply_to):
        """Create chat message in database"""
        return ChatMessage.objects.create(
            user=user,
            room=room,
            content=content,
            message_type=message_type,
            reply_to=reply_to
        )
    
    @database_sync_to_async
    def get_chat_message(self, message_id):
        """Get chat message by ID"""
        try:
            return ChatMessage.objects.get(id=message_id)
        except ChatMessage.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_user_data(self, user):
        """Get serialized user data"""
        serializer = UserBasicSerializer(user)
        return serializer.data
    
    @database_sync_to_async
    def get_message_data(self, message):
        """Get serialized message data"""
        serializer = ChatMessageSerializer(message)
        return serializer.data


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.notification_group_name = None
    
    async def connect(self):
        """Accept WebSocket connection"""
        self.user = self.scope.get('user')
        
        # Reject if user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return
        
        self.notification_group_name = f'notifications_{self.user.id}'
        
        # Accept connection
        await self.accept()
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        logger.info(f"User {self.user.id} connected to notifications")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.notification_group_name:
            # Leave notification group
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
            
            logger.info(f"User {self.user.id} disconnected from notifications")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                await self.handle_mark_read(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'error': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling notification message: {str(e)}")
    
    async def handle_mark_read(self, data):
        """Handle mark notification as read"""
        notification_id = data.get('notification_id')
        if notification_id:
            await self.mark_notification_read(notification_id)
    
    async def handle_ping(self):
        """Handle ping/heartbeat"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    # Group message handlers
    async def notification_broadcast(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    # Database operations
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read"""
        try:
            from apps.notifications.models import Notification
            notification = Notification.objects.get(
                id=notification_id, 
                user=self.user
            )
            notification.is_read = True
            notification.save()
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")


class TestWebSocketConsumer(AsyncWebsocketConsumer):
    """Simple WebSocket consumer for testing purposes"""
    
    async def connect(self):
        """Accept WebSocket connection for testing"""
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'WebSocket connection successful',
            'timestamp': timezone.now().isoformat()
        }))
        
        logger.info("Test WebSocket connection established")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        logger.info(f"Test WebSocket connection closed with code: {close_code}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            data.get('type', 'message')
            
            # Echo back the message with some additional info
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'original_message': data,
                'received_at': timezone.now().isoformat(),
                'status': 'received'
            }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format',
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error in test WebSocket: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Internal server error',
                'timestamp': timezone.now().isoformat()
            }))
