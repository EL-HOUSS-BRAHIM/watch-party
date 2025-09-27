"""
WebSocket consumers for watch party real-time functionality
"""

import json
import logging
from datetime import timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import WatchParty, PartyParticipant, PartyReaction

User = get_user_model()
logger = logging.getLogger(__name__)


class PartyConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for watch party functionality"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.party_id = None
        self.party_group_name = None
        self.user = None
        self.party = None
        self.participant = None
        
    async def connect(self):
        """Accept WebSocket connection"""
        self.party_id = self.scope['url_route']['kwargs']['party_id']
        self.party_group_name = f'party_{self.party_id}'
        self.user = self.scope.get('user')
        
        # Reject if user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return
        
        try:
            # Verify party exists and user has access
            self.party = await self.get_party(self.party_id)
            has_access = await self.check_user_access(self.user, self.party)
            
            if not has_access:
                await self.close(code=4003)
                return
            
            # Get participant info
            self.participant = await self.get_participant(self.user, self.party)
            
            # Accept connection
            await self.accept()
            
            # Join party group
            await self.channel_layer.group_add(
                self.party_group_name,
                self.channel_name
            )
            
            # Update participant's last seen
            await self.update_participant_last_seen(self.participant)
            
            # Send party state to newly connected user
            party_state = await self.get_party_state()
            await self.send(text_data=json.dumps({
                'type': 'party_state',
                'state': party_state
            }))
            
            # Notify others that user joined
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'user_joined',
                    'user': await self.get_user_data(self.user),
                    'timestamp': timezone.now().isoformat(),
                    'participant_count': await self.get_participant_count()
                }
            )
            
            logger.info(f"User {self.user.id} connected to party {self.party_id}")
            
        except Exception as e:
            logger.error(f"Error connecting to party {self.party_id}: {str(e)}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.party_group_name and self.user:
            try:
                # Update participant's last seen
                if self.participant:
                    await self.update_participant_last_seen(self.participant)
                
                # Notify others that user left
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'user_left',
                        'user': await self.get_user_data(self.user),
                        'timestamp': timezone.now().isoformat(),
                        'participant_count': await self.get_participant_count()
                    }
                )
                
                # Leave party group
                await self.channel_layer.group_discard(
                    self.party_group_name,
                    self.channel_name
                )
                
                logger.info(f"User {self.user.id} disconnected from party {self.party_id}")
                
            except Exception as e:
                logger.error(f"Error disconnecting from party {self.party_id}: {str(e)}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'video_control':
                await self.handle_video_control(data)
            elif message_type == 'sync_request':
                await self.handle_sync_request(data)
            elif message_type == 'reaction':
                await self.handle_reaction(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
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
            logger.error(f"Error handling message in party {self.party_id}: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Internal server error'
            }))
    
    async def handle_video_control(self, data):
        """Handle video control commands (play, pause, seek)"""
        action = data.get('action')
        timestamp = data.get('timestamp')
        video_time = data.get('video_time', 0)
        
        # Check if user can control video
        can_control = await self.check_control_permission(self.user, self.party)
        if not can_control:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Permission denied'
            }))
            return
        
        try:
            if action == 'play':
                await self.update_party_state(is_playing=True, current_timestamp=video_time)
            elif action == 'pause':
                await self.update_party_state(is_playing=False, current_timestamp=video_time)
            elif action == 'seek':
                await self.update_party_state(current_timestamp=video_time)
            
            # Broadcast control to all participants
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'video_control_broadcast',
                    'action': action,
                    'video_time': video_time,
                    'timestamp': timestamp or timezone.now().isoformat(),
                    'user': await self.get_user_data(self.user)
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling video control: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Failed to control video'
            }))
    
    async def handle_sync_request(self, data):
        """Handle sync state request"""
        try:
            party_state = await self.get_party_state()
            await self.send(text_data=json.dumps({
                'type': 'sync_response',
                'state': party_state,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error handling sync request: {str(e)}")
    
    async def handle_reaction(self, data):
        """Handle emoji reactions"""
        emoji = data.get('emoji')
        video_timestamp = data.get('video_timestamp', 0)
        x_position = data.get('x_position', 0.5)
        y_position = data.get('y_position', 0.5)
        
        if not emoji:
            return
        
        try:
            # Save reaction to database
            reaction = await self.create_reaction(
                self.user, self.party, emoji, video_timestamp, x_position, y_position
            )
            
            # Broadcast reaction to all participants
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'reaction_broadcast',
                    'reaction': {
                        'id': str(reaction.id),
                        'emoji': emoji,
                        'video_timestamp': video_timestamp,
                        'x_position': x_position,
                        'y_position': y_position,
                        'user': await self.get_user_data(self.user),
                        'created_at': reaction.created_at.isoformat()
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling reaction: {str(e)}")
    
    async def handle_chat_message(self, data):
        """Handle chat messages in party"""
        content = data.get('content', '').strip()
        
        if not content:
            return
        
        # Check if chat is allowed
        if not self.party.allow_chat:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Chat is disabled for this party'
            }))
            return
        
        try:
            # Broadcast chat message to all participants
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': {
                        'content': content,
                        'user': await self.get_user_data(self.user),
                        'timestamp': timezone.now().isoformat()
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling chat message: {str(e)}")
    
    async def handle_typing(self, data):
        """Handle typing indicators"""
        is_typing = data.get('is_typing', False)
        
        # Broadcast typing status to all participants except sender
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'typing_indicator',
                'user': await self.get_user_data(self.user),
                'is_typing': is_typing,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_ping(self):
        """Handle ping/heartbeat"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    # Group message handlers
    async def video_control_broadcast(self, event):
        """Send video control to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'video_control',
            'action': event['action'],
            'video_time': event['video_time'],
            'timestamp': event['timestamp'],
            'user': event['user']
        }))
    
    async def reaction_broadcast(self, event):
        """Send reaction to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'reaction': event['reaction']
        }))
    
    async def chat_message_broadcast(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
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
    
    async def user_joined(self, event):
        """Send user joined notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'timestamp': event['timestamp'],
            'participant_count': event['participant_count']
        }))
    
    async def user_left(self, event):
        """Send user left notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'timestamp': event['timestamp'],
            'participant_count': event['participant_count']
        }))
    
    async def party_update(self, event):
        """Send party state update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'party_update',
            'update': event['update'],
            'timestamp': event['timestamp']
        }))
    
    # Database operations (async wrappers)
    @database_sync_to_async
    def get_party(self, party_id):
        """Get watch party from database"""
        return WatchParty.objects.select_related('host', 'video').get(id=party_id)
    
    @database_sync_to_async
    def check_user_access(self, user, party):
        """Check if user has access to the party"""
        return (
            party.host == user or 
            party.participants.filter(user=user, is_active=True).exists()
        )
    
    @database_sync_to_async
    def check_control_permission(self, user, party):
        """Check if user can control video playback"""
        if party.host == user:
            return True
        
        participant = party.participants.filter(user=user, is_active=True).first()
        return participant and participant.role in ['host', 'moderator']
    
    @database_sync_to_async
    def get_participant(self, user, party):
        """Get participant object"""
        try:
            return PartyParticipant.objects.get(party=party, user=user, is_active=True)
        except PartyParticipant.DoesNotExist:
            return None
    
    @database_sync_to_async
    def update_participant_last_seen(self, participant):
        """Update participant's last seen timestamp"""
        if participant:
            participant.last_seen = timezone.now()
            participant.save(update_fields=['last_seen'])
    
    @database_sync_to_async
    def get_participant_count(self):
        """Get count of active participants"""
        return self.party.participants.filter(is_active=True).count()
    
    @database_sync_to_async
    def update_party_state(self, is_playing=None, current_timestamp=None):
        """Update party playback state"""
        if is_playing is not None:
            self.party.is_playing = is_playing
        if current_timestamp is not None:
            self.party.current_timestamp = timedelta(seconds=current_timestamp)
        
        self.party.last_sync_at = timezone.now()
        update_fields = ['last_sync_at']
        
        if is_playing is not None:
            update_fields.append('is_playing')
        if current_timestamp is not None:
            update_fields.append('current_timestamp')
        
        self.party.save(update_fields=update_fields)
    
    @database_sync_to_async
    def create_reaction(self, user, party, emoji, video_timestamp, x_position, y_position):
        """Create party reaction"""
        return PartyReaction.objects.create(
            party=party,
            user=user,
            emoji=emoji,
            video_timestamp=timedelta(seconds=video_timestamp),
            x_position=x_position,
            y_position=y_position
        )
    
    @database_sync_to_async
    def get_user_data(self, user):
        """Get serialized user data"""
        return {
            'id': str(user.id),
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.avatar.url if user.avatar else None
        }
    
    @database_sync_to_async
    def get_party_state(self):
        """Get current party state"""
        return {
            'id': str(self.party.id),
            'title': self.party.title,
            'status': self.party.status,
            'is_playing': self.party.is_playing,
            'current_timestamp': self.party.current_timestamp.total_seconds() if self.party.current_timestamp else 0,
            'last_sync_at': self.party.last_sync_at.isoformat() if self.party.last_sync_at else None,
            'movie_title': self.party.movie_title,
            'gdrive_file_id': self.party.gdrive_file_id,
            'video_id': str(self.party.video.id) if self.party.video else None,
            'host': {
                'id': str(self.party.host.id),
                'username': self.party.host.username,
                'first_name': self.party.host.first_name,
                'last_name': self.party.host.last_name
            },
            'participant_count': self.party.participants.filter(is_active=True).count(),
            'allow_chat': self.party.allow_chat,
            'allow_reactions': self.party.allow_reactions
        }


class PartyLobbyConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for party lobby (waiting room before party starts)"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.party_id = None
        self.lobby_group_name = None
        self.user = None
        self.party = None
        
    async def connect(self):
        """Accept WebSocket connection to lobby"""
        self.party_id = self.scope['url_route']['kwargs']['party_id']
        self.lobby_group_name = f'lobby_{self.party_id}'
        self.user = self.scope.get('user')
        
        # Reject if user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return
        
        try:
            # Verify party exists and user has access
            self.party = await self.get_party(self.party_id)
            has_access = await self.check_user_access(self.user, self.party)
            
            if not has_access:
                await self.close(code=4003)
                return
            
            # Accept connection
            await self.accept()
            
            # Join lobby group
            await self.channel_layer.group_add(
                self.lobby_group_name,
                self.channel_name
            )
            
            # Send lobby state to newly connected user
            lobby_state = await self.get_lobby_state()
            await self.send(text_data=json.dumps({
                'type': 'lobby_state',
                'state': lobby_state
            }))
            
            # Notify others that user joined lobby
            await self.channel_layer.group_send(
                self.lobby_group_name,
                {
                    'type': 'user_joined_lobby',
                    'user': await self.get_user_data(self.user),
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            logger.info(f"User {self.user.id} joined lobby for party {self.party_id}")
            
        except Exception as e:
            logger.error(f"Error joining lobby for party {self.party_id}: {str(e)}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection from lobby"""
        if self.lobby_group_name and self.user:
            try:
                # Notify others that user left lobby
                await self.channel_layer.group_send(
                    self.lobby_group_name,
                    {
                        'type': 'user_left_lobby',
                        'user': await self.get_user_data(self.user),
                        'timestamp': timezone.now().isoformat()
                    }
                )
                
                # Leave lobby group
                await self.channel_layer.group_discard(
                    self.lobby_group_name,
                    self.channel_name
                )
                
                logger.info(f"User {self.user.id} left lobby for party {self.party_id}")
                
            except Exception as e:
                logger.error(f"Error leaving lobby for party {self.party_id}: {str(e)}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages in lobby"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_lobby_chat(data)
            elif message_type == 'ready_status':
                await self.handle_ready_status(data)
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
            logger.error(f"Error handling lobby message: {str(e)}")
    
    async def handle_lobby_chat(self, data):
        """Handle chat messages in lobby"""
        content = data.get('content', '').strip()
        
        if not content:
            return
        
        # Broadcast chat message to all lobby participants
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'lobby_chat_broadcast',
                'message': {
                    'content': content,
                    'user': await self.get_user_data(self.user),
                    'timestamp': timezone.now().isoformat()
                }
            }
        )
    
    async def handle_ready_status(self, data):
        """Handle user ready status"""
        is_ready = data.get('is_ready', False)
        
        # Broadcast ready status to all lobby participants
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'ready_status_broadcast',
                'user': await self.get_user_data(self.user),
                'is_ready': is_ready,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_ping(self):
        """Handle ping/heartbeat"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    # Group message handlers
    async def user_joined_lobby(self, event):
        """Send user joined lobby notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))
    
    async def user_left_lobby(self, event):
        """Send user left lobby notification"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))
    
    async def lobby_chat_broadcast(self, event):
        """Send lobby chat message"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def ready_status_broadcast(self, event):
        """Send ready status update"""
        await self.send(text_data=json.dumps({
            'type': 'ready_status',
            'user': event['user'],
            'is_ready': event['is_ready'],
            'timestamp': event['timestamp']
        }))
    
    async def party_started(self, event):
        """Send party started notification"""
        await self.send(text_data=json.dumps({
            'type': 'party_started',
            'party_id': event['party_id'],
            'timestamp': event['timestamp']
        }))
    
    # Database operations
    @database_sync_to_async
    def get_party(self, party_id):
        """Get watch party from database"""
        return WatchParty.objects.select_related('host').get(id=party_id)
    
    @database_sync_to_async
    def check_user_access(self, user, party):
        """Check if user has access to the party lobby"""
        return (
            party.host == user or 
            party.participants.filter(user=user).exists() or
            party.visibility == 'public'
        )
    
    @database_sync_to_async
    def get_user_data(self, user):
        """Get serialized user data"""
        return {
            'id': str(user.id),
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.avatar.url if user.avatar else None
        }
    
    @database_sync_to_async
    def get_lobby_state(self):
        """Get current lobby state"""
        participants = list(self.party.participants.filter(is_active=True).select_related('user'))
        
        return {
            'party': {
                'id': str(self.party.id),
                'title': self.party.title,
                'status': self.party.status,
                'scheduled_start': self.party.scheduled_start.isoformat() if self.party.scheduled_start else None,
                'host': {
                    'id': str(self.party.host.id),
                    'username': self.party.host.username,
                    'first_name': self.party.host.first_name,
                    'last_name': self.party.host.last_name
                }
            },
            'participants': [
                {
                    'id': str(p.user.id),
                    'username': p.user.username,
                    'first_name': p.user.first_name,
                    'last_name': p.user.last_name,
                    'role': p.role,
                    'joined_at': p.joined_at.isoformat()
                }
                for p in participants
            ]
        }
