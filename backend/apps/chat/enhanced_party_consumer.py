"""
Enhanced WebSocket consumer for Watch Party real-time features
Implements frontend-compatible message formats and comprehensive sync
"""

import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
logger = logging.getLogger(__name__)


class EnhancedPartyConsumer(AsyncWebsocketConsumer):
    """
    Enhanced WebSocket consumer for comprehensive party real-time features
    Compatible with frontend message format expectations
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.party_id = None
        self.user = None
        self.is_host = False
        self.party_group_name = None
        self.user_channel_name = None
        self.typing_users = set()
        self.voice_participants = set()
        self.screen_share_active = False
        
        # Video sync state
        self.video_state = {
            'current_time': 0,
            'is_playing': False,
            'video_id': None,
            'last_update': None,
            'playback_rate': 1.0,
            'quality': 'auto'
        }
        
        # Chat state
        self.chat_state = {
            'typing_timeout': 3,  # seconds
            'max_message_length': 500
        }
    
    async def connect(self):
        """Handle WebSocket connection with enhanced authentication"""
        try:
            # Extract party ID from URL
            self.party_id = self.scope['url_route']['kwargs']['party_id']
            self.party_group_name = f"enhanced_party_{self.party_id}"
            self.user = self.scope.get('user')
            
            # Reject unauthenticated users
            if not self.user or not self.user.is_authenticated:
                await self.close(code=4001)
                return
            
            # Verify party access
            party = await self.get_party_by_id(self.party_id)
            if not party or not await self.user_has_party_access(party, self.user):
                await self.close(code=4003)
                return
            
            # Check if user is host
            self.is_host = await self.is_user_party_host(party, self.user)
            
            # Accept connection
            await self.accept()
            
            # Join party group
            await self.channel_layer.group_add(
                self.party_group_name,
                self.channel_name
            )
            
            # Join user-specific channel for direct messages
            self.user_channel_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(
                self.user_channel_name,
                self.channel_name
            )
            
            # Send initial connection response
            await self.send_message({
                'type': 'connection_established',
                'data': {
                    'party_id': str(self.party_id),
                    'user_id': str(self.user.id),
                    'is_host': self.is_host,
                    'server_time': timezone.now().isoformat()
                }
            })
            
            # Get current party state and send to user
            await self.send_initial_party_state()
            
            # Notify other users of new participant
            await self.broadcast_to_party({
                'type': 'user_joined',
                'data': {
                    'user': await self.serialize_user(self.user),
                    'is_host': self.is_host,
                    'participant_count': await self.get_participant_count()
                }
            }, exclude_self=True)
            
            logger.info(f"Enhanced party connection: User {self.user.username} joined party {self.party_id}")
            
        except Exception as e:
            logger.error(f"Enhanced party connection error: {str(e)}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.party_group_name and self.user:
            try:
                # Stop any ongoing activities
                if self.user.id in self.typing_users:
                    await self.handle_stop_typing()
                
                if self.user.id in self.voice_participants:
                    await self.handle_leave_voice_chat()
                
                # Leave groups
                await self.channel_layer.group_discard(
                    self.party_group_name,
                    self.channel_name
                )
                
                if self.user_channel_name:
                    await self.channel_layer.group_discard(
                        self.user_channel_name,
                        self.channel_name
                    )
                
                # Notify others of user leaving
                await self.broadcast_to_party({
                    'type': 'user_left',
                    'data': {
                        'user': await self.serialize_user(self.user),
                        'participant_count': await self.get_participant_count()
                    }
                })
                
                logger.info(f"Enhanced party disconnect: User {self.user.username} left party {self.party_id}")
                
            except Exception as e:
                logger.error(f"Enhanced party disconnect error: {str(e)}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages with comprehensive routing"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            timestamp = data.get('timestamp', timezone.now().isoformat())
            
            # Message routing
            handlers = {
                # Video control messages
                'video_control': self.handle_video_control,
                'video_seek': self.handle_video_seek,
                'video_play': self.handle_video_play,
                'video_pause': self.handle_video_pause,
                'video_change': self.handle_video_change,
                'video_quality_change': self.handle_video_quality_change,
                'video_sync_request': self.handle_video_sync_request,
                
                # Chat messages
                'chat_message': self.handle_chat_message,
                'chat_typing_start': self.handle_start_typing,
                'chat_typing_stop': self.handle_stop_typing,
                'chat_edit_message': self.handle_edit_message,
                'chat_delete_message': self.handle_delete_message,
                
                # Interactive features
                'reaction': self.handle_reaction,
                'poll_create': self.handle_poll_create,
                'poll_vote': self.handle_poll_vote,
                'poll_close': self.handle_poll_close,
                
                # Voice chat
                'voice_join': self.handle_join_voice_chat,
                'voice_leave': self.handle_leave_voice_chat,
                'voice_mute': self.handle_voice_mute,
                'voice_unmute': self.handle_voice_unmute,
                
                # Screen sharing
                'screen_share_start': self.handle_screen_share_start,
                'screen_share_stop': self.handle_screen_share_stop,
                'screen_share_signal': self.handle_screen_share_signal,
                
                # System messages
                'heartbeat': self.handle_heartbeat,
                'ping': self.handle_ping,
                'request_party_state': self.handle_request_party_state,
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler(data.get('data', {}), timestamp)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
                logger.warning(f"Unknown message type received: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Message handling error: {str(e)}")
            await self.send_error("Message processing error")
    
    # Video Control Handlers
    async def handle_video_control(self, data, timestamp):
        """Handle comprehensive video control messages"""
        if not self.is_host and not await self.check_video_control_permission():
            await self.send_error("Insufficient permissions for video control")
            return
        
        action = data.get('action')
        current_time = data.get('current_time', 0)
        video_id = data.get('video_id')
        
        # Update video state
        if action == 'play':
            self.video_state['is_playing'] = True
        elif action == 'pause':
            self.video_state['is_playing'] = False
        elif action == 'seek':
            self.video_state['current_time'] = current_time
        
        self.video_state['last_update'] = timestamp
        if video_id:
            self.video_state['video_id'] = video_id
        
        # Broadcast to all party members
        await self.broadcast_to_party({
            'type': 'video_control',
            'data': {
                'action': action,
                'current_time': current_time,
                'is_playing': self.video_state['is_playing'],
                'video_id': video_id,
                'controlled_by': await self.serialize_user(self.user),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    async def handle_video_play(self, data, timestamp):
        """Handle video play action"""
        await self.handle_video_control({
            'action': 'play',
            'current_time': data.get('current_time', self.video_state['current_time']),
            'video_id': data.get('video_id', self.video_state['video_id'])
        }, timestamp)
    
    async def handle_video_pause(self, data, timestamp):
        """Handle video pause action"""
        await self.handle_video_control({
            'action': 'pause',
            'current_time': data.get('current_time', self.video_state['current_time']),
            'video_id': data.get('video_id', self.video_state['video_id'])
        }, timestamp)
    
    async def handle_video_seek(self, data, timestamp):
        """Handle video seek action"""
        await self.handle_video_control({
            'action': 'seek',
            'current_time': data.get('current_time', 0),
            'video_id': data.get('video_id', self.video_state['video_id'])
        }, timestamp)
    
    async def handle_video_change(self, data, timestamp):
        """Handle video change"""
        video_id = data.get('video_id')
        if not video_id:
            await self.send_error("Video ID required for video change")
            return
        
        # Verify video exists and user has access
        if not await self.verify_video_access(video_id):
            await self.send_error("Invalid video or insufficient access")
            return
        
        self.video_state.update({
            'video_id': video_id,
            'current_time': 0,
            'is_playing': False,
            'last_update': timestamp
        })
        
        await self.broadcast_to_party({
            'type': 'video_change',
            'data': {
                'video_id': video_id,
                'changed_by': await self.serialize_user(self.user),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    # Chat Message Handlers
    async def handle_chat_message(self, data, timestamp):
        """Handle chat messages with comprehensive features"""
        content = data.get('content', '').strip()
        if not content or len(content) > self.chat_state['max_message_length']:
            await self.send_error("Invalid message content")
            return
        
        # Save message to database
        message = await self.save_chat_message(content)
        
        # Broadcast to party
        await self.broadcast_to_party({
            'type': 'chat_message',
            'data': {
                'message_id': str(message.id),
                'content': content,
                'user': await self.serialize_user(self.user),
                'timestamp': message.created_at.isoformat(),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    async def handle_start_typing(self, data, timestamp):
        """Handle typing indicator start"""
        self.typing_users.add(self.user.id)
        
        await self.broadcast_to_party({
            'type': 'typing_indicator',
            'data': {
                'user': await self.serialize_user(self.user),
                'is_typing': True,
                'server_timestamp': timezone.now().isoformat()
            }
        }, exclude_self=True)
        
        # Auto-stop typing after timeout
        asyncio.create_task(self.auto_stop_typing())
    
    async def handle_stop_typing(self, data=None, timestamp=None):
        """Handle typing indicator stop"""
        if self.user.id in self.typing_users:
            self.typing_users.remove(self.user.id)
            
            await self.broadcast_to_party({
                'type': 'typing_indicator',
                'data': {
                    'user': await self.serialize_user(self.user),
                    'is_typing': False,
                    'server_timestamp': timezone.now().isoformat()
                }
            }, exclude_self=True)
    
    # Interactive Features
    async def handle_reaction(self, data, timestamp):
        """Handle emoji reactions"""
        emoji = data.get('emoji')
        if not emoji:
            await self.send_error("Emoji required for reaction")
            return
        
        await self.broadcast_to_party({
            'type': 'reaction',
            'data': {
                'emoji': emoji,
                'user': await self.serialize_user(self.user),
                'timestamp': timestamp,
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    # Voice Chat Handlers
    async def handle_join_voice_chat(self, data, timestamp):
        """Handle voice chat join"""
        self.voice_participants.add(self.user.id)
        
        await self.broadcast_to_party({
            'type': 'voice_chat_update',
            'data': {
                'action': 'user_joined',
                'user': await self.serialize_user(self.user),
                'participants': len(self.voice_participants),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    async def handle_leave_voice_chat(self, data=None, timestamp=None):
        """Handle voice chat leave"""
        if self.user.id in self.voice_participants:
            self.voice_participants.remove(self.user.id)
            
            await self.broadcast_to_party({
                'type': 'voice_chat_update',
                'data': {
                    'action': 'user_left',
                    'user': await self.serialize_user(self.user),
                    'participants': len(self.voice_participants),
                    'server_timestamp': timezone.now().isoformat()
                }
            })
    
    # Screen Sharing Handlers
    async def handle_screen_share_start(self, data, timestamp):
        """Handle screen share start"""
        if not self.is_host and not await self.check_screen_share_permission():
            await self.send_error("Insufficient permissions for screen sharing")
            return
        
        self.screen_share_active = True
        
        await self.broadcast_to_party({
            'type': 'screen_share_update',
            'data': {
                'action': 'started',
                'user': await self.serialize_user(self.user),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    async def handle_screen_share_stop(self, data, timestamp):
        """Handle screen share stop"""
        self.screen_share_active = False
        
        await self.broadcast_to_party({
            'type': 'screen_share_update',
            'data': {
                'action': 'stopped',
                'user': await self.serialize_user(self.user),
                'server_timestamp': timezone.now().isoformat()
            }
        })
    
    # System Handlers
    async def handle_heartbeat(self, data, timestamp):
        """Handle heartbeat/keepalive"""
        await self.send_message({
            'type': 'heartbeat_response',
            'data': {
                'server_timestamp': timezone.now().isoformat(),
                'client_timestamp': timestamp
            }
        })
    
    async def handle_ping(self, data, timestamp):
        """Handle ping for latency testing"""
        await self.send_message({
            'type': 'pong',
            'data': {
                'server_timestamp': timezone.now().isoformat(),
                'client_timestamp': timestamp
            }
        })
    
    async def handle_request_party_state(self, data, timestamp):
        """Handle request for current party state"""
        await self.send_initial_party_state()
    
    # Helper Methods
    async def send_message(self, message):
        """Send message to this client"""
        await self.send(text_data=json.dumps({
            **message,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def send_error(self, error_message):
        """Send error message to client"""
        await self.send_message({
            'type': 'error',
            'data': {
                'message': error_message
            }
        })
    
    async def broadcast_to_party(self, message, exclude_self=False):
        """Broadcast message to all party members"""
        if exclude_self:
            # Send to all except current user
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'party_message',
                    'message': message,
                    'exclude_channel': self.channel_name
                }
            )
        else:
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'party_message',
                    'message': message
                }
            )
    
    async def send_initial_party_state(self):
        """Send current party state to newly connected user"""
        party_state = await self.get_current_party_state()
        await self.send_message({
            'type': 'party_state',
            'data': party_state
        })
    
    async def auto_stop_typing(self):
        """Auto-stop typing after timeout"""
        await asyncio.sleep(self.chat_state['typing_timeout'])
        if self.user.id in self.typing_users:
            await self.handle_stop_typing()
    
    # Group message handlers
    async def party_message(self, event):
        """Handle messages broadcast to party group"""
        message = event['message']
        exclude_channel = event.get('exclude_channel')
        
        # Skip if this channel should be excluded
        if exclude_channel and exclude_channel == self.channel_name:
            return
        
        await self.send_message(message)
    
    # Database Operations
    @database_sync_to_async
    def get_party_by_id(self, party_id):
        """Get party by ID"""
        from apps.parties.models import WatchParty
        try:
            return WatchParty.objects.get(id=party_id)
        except WatchParty.DoesNotExist:
            return None
    
    @database_sync_to_async
    def user_has_party_access(self, party, user):
        """Check if user has access to party"""
        # Check if party is public or user is member/host
        if party.is_public:
            return True
        return party.participants.filter(id=user.id).exists() or party.host == user
    
    @database_sync_to_async
    def is_user_party_host(self, party, user):
        """Check if user is party host"""
        return party.host == user
    
    @database_sync_to_async
    def serialize_user(self, user):
        """Serialize user data for WebSocket messages"""
        return {
            'id': str(user.id),
            'username': user.username,
            'full_name': user.full_name,
            'avatar': user.avatar.url if user.avatar else None,
            'is_premium': getattr(user, 'is_premium', False)
        }
    
    @database_sync_to_async
    def save_chat_message(self, content):
        """Save chat message to database"""
        from apps.chat.models import ChatMessage, ChatRoom
        
        # Get or create party chat room
        room, created = ChatRoom.objects.get_or_create(
            party_id=self.party_id,
            defaults={'name': f'Party {self.party_id} Chat'}
        )
        
        return ChatMessage.objects.create(
            room=room,
            user=self.user,
            content=content
        )
    
    @database_sync_to_async
    def verify_video_access(self, video_id):
        """Verify user has access to video"""
        from apps.videos.models import Video
        try:
            video = Video.objects.get(id=video_id)
            # Add your access logic here
            return True
        except Video.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_participant_count(self):
        """Get current participant count"""
        # This should query active WebSocket connections
        # For now, return a placeholder
        return len(self.typing_users) + len(self.voice_participants) + 1
    
    @database_sync_to_async
    def get_current_party_state(self):
        """Get comprehensive current party state"""
        return {
            'video_state': self.video_state,
            'voice_participants': len(self.voice_participants),
            'screen_share_active': self.screen_share_active,
            'typing_users': list(self.typing_users),
            'participant_count': self.get_participant_count()
        }
    
    @database_sync_to_async
    def check_video_control_permission(self):
        """Check if user has video control permission"""
        # Implement your permission logic
        return True  # For now, allow all users
    
    @database_sync_to_async
    def check_screen_share_permission(self):
        """Check if user has screen share permission"""
        # Implement your permission logic
        return True  # For now, allow all users
