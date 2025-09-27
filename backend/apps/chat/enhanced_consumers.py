"""
Enhanced WebSocket consumers for real-time features
"""

import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache

User = get_user_model()


class EnhancedNotificationConsumer(AsyncWebsocketConsumer):
    """
    Enhanced notification consumer with presence tracking and real-time updates
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Join user-specific notification group
        self.notification_group_name = f"notifications_{self.user.id}"
        
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        # Join global notifications group for announcements
        await self.channel_layer.group_add(
            "global_notifications",
            self.channel_name
        )
        
        # Mark user as online
        await self.update_user_presence(True)
        
        await self.accept()
        
        # Send initial connection status
        await self.send(text_data=json.dumps({
            'type': 'connection_status',
            'status': 'connected',
            'user_id': str(self.user.id),
            'timestamp': timezone.now().isoformat()
        }))
        
        # Send any pending notifications
        await self.send_pending_notifications()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'user') and self.user.is_authenticated:
            # Mark user as offline
            await self.update_user_presence(False)
            
            # Leave notification groups
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                "global_notifications",
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Respond to ping for connection testing
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            elif message_type == 'mark_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                await self.mark_notification_read(notification_id)
            elif message_type == 'subscribe_party':
                # Subscribe to party-specific notifications
                party_id = data.get('party_id')
                await self.subscribe_to_party(party_id)
            elif message_type == 'unsubscribe_party':
                # Unsubscribe from party notifications
                party_id = data.get('party_id')
                await self.unsubscribe_from_party(party_id)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    # Group message handlers
    async def notification_message(self, event):
        """Send notification to user"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    async def party_update(self, event):
        """Send party update to user"""
        await self.send(text_data=json.dumps({
            'type': 'party_update',
            'update': event['update']
        }))
    
    async def system_announcement(self, event):
        """Send system announcement to user"""
        await self.send(text_data=json.dumps({
            'type': 'system_announcement',
            'announcement': event['announcement']
        }))
    
    async def user_status_update(self, event):
        """Send user status update"""
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'status': event['status']
        }))
    
    # Helper methods
    @database_sync_to_async
    def update_user_presence(self, is_online):
        """Update user online status"""
        User.objects.filter(id=self.user.id).update(
            is_online=is_online,
            last_activity=timezone.now()
        )
        
        # Cache online status for quick access
        cache_key = f"user_online_{self.user.id}"
        if is_online:
            cache.set(cache_key, True, timeout=300)  # 5 minutes
        else:
            cache.delete(cache_key)
    
    @database_sync_to_async
    def send_pending_notifications(self):
        """Send any unread notifications to the user"""
        from apps.notifications.models import Notification
        
        pending_notifications = Notification.objects.filter(
            user=self.user,
            is_read=False
        ).order_by('-created_at')[:10]
        
        for notification in pending_notifications:
            asyncio.create_task(self.send(text_data=json.dumps({
                'type': 'notification',
                'notification': {
                    'id': str(notification.id),
                    'title': notification.title,
                    'message': notification.message,
                    'notification_type': notification.notification_type,
                    'created_at': notification.created_at.isoformat(),
                    'data': notification.data
                }
            })))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read"""
        from apps.notifications.models import Notification
        
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=self.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    async def subscribe_to_party(self, party_id):
        """Subscribe to party-specific notifications"""
        if not party_id:
            return
        
        party_group_name = f"party_{party_id}"
        await self.channel_layer.group_add(
            party_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'subscription_status',
            'subscribed_to': party_id,
            'status': 'subscribed'
        }))
    
    async def unsubscribe_from_party(self, party_id):
        """Unsubscribe from party notifications"""
        if not party_id:
            return
        
        party_group_name = f"party_{party_id}"
        await self.channel_layer.group_discard(
            party_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'subscription_status',
            'unsubscribed_from': party_id,
            'status': 'unsubscribed'
        }))


class EnhancedChatConsumer(AsyncWebsocketConsumer):
    """
    Enhanced chat consumer with typing indicators and message reactions
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        self.party_id = self.scope['url_route']['kwargs']['party_id']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Verify user has access to the party
        if not await self.verify_party_access():
            await self.close()
            return
        
        self.party_group_name = f"chat_{self.party_id}"
        
        await self.channel_layer.group_add(
            self.party_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'user_joined',
                'user': {
                    'id': str(self.user.id),
                    'username': self.user.username,
                    'display_name': self.user.get_full_name() or self.user.username
                },
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'party_group_name'):
            # Notify others that user left
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'user_left',
                    'user': {
                        'id': str(self.user.id),
                        'username': self.user.username
                    },
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            await self.channel_layer.group_discard(
                self.party_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming chat messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing_start':
                await self.handle_typing_indicator(True)
            elif message_type == 'typing_stop':
                await self.handle_typing_indicator(False)
            elif message_type == 'message_reaction':
                await self.handle_message_reaction(data)
            elif message_type == 'delete_message':
                await self.handle_delete_message(data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def handle_chat_message(self, data):
        """Handle chat message"""
        message_content = data.get('message', '').strip()
        if not message_content or len(message_content) > 1000:
            return
        
        # Save message to database
        message = await self.save_chat_message(message_content)
        
        if message:
            # Send message to group
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message.id),
                        'content': message.content,
                        'user': {
                            'id': str(self.user.id),
                            'username': self.user.username,
                            'display_name': self.user.get_full_name() or self.user.username,
                            'avatar': self.user.avatar.url if self.user.avatar else None
                        },
                        'timestamp': message.timestamp.isoformat(),
                        'edited': False,
                        'reactions': []
                    }
                }
            )
    
    async def handle_typing_indicator(self, is_typing):
        """Handle typing indicator"""
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'typing_indicator',
                'user': {
                    'id': str(self.user.id),
                    'username': self.user.username
                },
                'is_typing': is_typing,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_message_reaction(self, data):
        """Handle message reaction"""
        message_id = data.get('message_id')
        emoji = data.get('emoji')
        
        if not message_id or not emoji:
            return
        
        # Save reaction to database
        reaction = await self.save_message_reaction(message_id, emoji)
        
        if reaction:
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'message_reaction',
                    'message_id': message_id,
                    'reaction': {
                        'emoji': emoji,
                        'user': {
                            'id': str(self.user.id),
                            'username': self.user.username
                        },
                        'timestamp': timezone.now().isoformat()
                    }
                }
            )
    
    async def handle_delete_message(self, data):
        """Handle message deletion"""
        message_id = data.get('message_id')
        
        if not message_id:
            return
        
        # Check if user can delete the message
        if await self.can_delete_message(message_id):
            await self.delete_chat_message(message_id)
            
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'message_deleted',
                    'message_id': message_id,
                    'deleted_by': {
                        'id': str(self.user.id),
                        'username': self.user.username
                    },
                    'timestamp': timezone.now().isoformat()
                }
            )
    
    # Group message handlers
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps(event))
    
    async def user_joined(self, event):
        """Send user joined notification"""
        await self.send(text_data=json.dumps(event))
    
    async def user_left(self, event):
        """Send user left notification"""
        await self.send(text_data=json.dumps(event))
    
    async def typing_indicator(self, event):
        """Send typing indicator"""
        # Don't send typing indicator to the user who is typing
        if event['user']['id'] != str(self.user.id):
            await self.send(text_data=json.dumps(event))
    
    async def message_reaction(self, event):
        """Send message reaction"""
        await self.send(text_data=json.dumps(event))
    
    async def message_deleted(self, event):
        """Send message deleted notification"""
        await self.send(text_data=json.dumps(event))
    
    # Database operations
    @database_sync_to_async
    def verify_party_access(self):
        """Verify user has access to the party"""
        from apps.parties.models import WatchParty
        
        try:
            party = WatchParty.objects.get(id=self.party_id)
            return (party.host == self.user or 
                   party.participants.filter(user=self.user, is_active=True).exists())
        except WatchParty.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_chat_message(self, content):
        """Save chat message to database"""
        from apps.chat.models import ChatMessage
        from apps.parties.models import WatchParty
        
        try:
            party = WatchParty.objects.get(id=self.party_id)
            message = ChatMessage.objects.create(
                party=party,
                user=self.user,
                content=content,
                timestamp=timezone.now()
            )
            return message
        except WatchParty.DoesNotExist:
            return None
    
    @database_sync_to_async
    def save_message_reaction(self, message_id, emoji):
        """Save message reaction to database"""
        from apps.chat.models import ChatMessage, MessageReaction
        
        try:
            message = ChatMessage.objects.get(id=message_id)
            reaction, created = MessageReaction.objects.get_or_create(
                message=message,
                user=self.user,
                emoji=emoji
            )
            return reaction
        except ChatMessage.DoesNotExist:
            return None
    
    @database_sync_to_async
    def can_delete_message(self, message_id):
        """Check if user can delete the message"""
        from apps.chat.models import ChatMessage
        from apps.parties.models import WatchParty
        
        try:
            message = ChatMessage.objects.get(id=message_id)
            party = WatchParty.objects.get(id=self.party_id)
            
            # User can delete their own messages or if they're the party host
            return (message.user == self.user or 
                   party.host == self.user or
                   self.user.is_staff)
        except (ChatMessage.DoesNotExist, WatchParty.DoesNotExist):
            return False
    
    @database_sync_to_async
    def delete_chat_message(self, message_id):
        """Delete chat message from database"""
        from apps.chat.models import ChatMessage
        
        try:
            message = ChatMessage.objects.get(id=message_id)
            message.is_deleted = True
            message.deleted_at = timezone.now()
            message.save()
            return True
        except ChatMessage.DoesNotExist:
            return False
