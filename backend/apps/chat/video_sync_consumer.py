"""
Enhanced real-time video synchronization for Watch Party Platform
Phase 2 implementation with frame-perfect sync and advanced controls
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.cache import cache

logger = logging.getLogger(__name__)


class VideoSyncConsumer(AsyncWebsocketConsumer):
    """Enhanced WebSocket consumer for video synchronization"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.party_code = None
        self.user = None
        self.is_host = False
        self.party_group_name = None
        self.sync_data = {
            'current_time': 0,
            'is_playing': False,
            'last_update': None,
            'video_duration': 0,
            'playback_rate': 1.0,
            'quality': 'auto'
        }
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Get party code from URL
            self.party_code = self.scope['url_route']['kwargs']['party_code']
            self.party_group_name = f"party_sync_{self.party_code}"
            
            # Get user from scope (set by middleware)
            self.user = self.scope.get('user')
            
            if not self.user or not self.user.is_authenticated:
                await self.close(code=4001)
                return
            
            # Verify user has access to this party
            party = await self.get_party(self.party_code)
            if not party or not await self.user_has_access(party, self.user):
                await self.close(code=4003)
                return
            
            # Check if user is host
            self.is_host = await self.is_user_host(party, self.user)
            
            # Join party group
            await self.channel_layer.group_add(
                self.party_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send current sync state to new connection
            await self.send_sync_state()
            
            # Notify others of user joining
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'user_joined',
                    'user': await self.serialize_user(self.user),
                    'is_host': self.is_host,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            logger.info(f"User {self.user.username} connected to party {self.party_code}")
            
        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.party_group_name:
            await self.channel_layer.group_discard(
                self.party_group_name,
                self.channel_name
            )
            
            # Notify others of user leaving
            if self.user:
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'user_left',
                        'user': await self.serialize_user(self.user),
                        'timestamp': timezone.now().isoformat()
                    }
                )
            
            logger.info(f"User {self.user.username if self.user else 'Unknown'} disconnected from party {self.party_code}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            # Route message to appropriate handler
            handlers = {
                'sync_update': self.handle_sync_update,
                'play': self.handle_play,
                'pause': self.handle_pause,
                'seek': self.handle_seek,
                'playback_rate': self.handle_playback_rate,
                'quality_change': self.handle_quality_change,
                'heartbeat': self.handle_heartbeat,
                'request_sync': self.handle_request_sync,
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}")
    
    async def handle_sync_update(self, data):
        """Handle video sync updates from clients"""
        # Only hosts can send sync updates (or implement voting system)
        if not self.is_host and not await self.should_accept_sync_update(data):
            return
        
        current_time = data.get('current_time', 0)
        is_playing = data.get('is_playing', False)
        playback_rate = data.get('playback_rate', 1.0)
        
        # Update sync data
        self.sync_data.update({
            'current_time': current_time,
            'is_playing': is_playing,
            'playback_rate': playback_rate,
            'last_update': timezone.now(),
        })
        
        # Cache sync data for persistence
        await self.cache_sync_data()
        
        # Broadcast to all clients
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'sync_update_broadcast',
                'current_time': current_time,
                'is_playing': is_playing,
                'playback_rate': playback_rate,
                'timestamp': timezone.now().isoformat(),
                'sender': await self.serialize_user(self.user)
            }
        )
    
    async def handle_play(self, data):
        """Handle play command"""
        if not self.can_control_playback():
            return
        
        current_time = data.get('current_time', self.sync_data['current_time'])
        
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'play_command',
                'current_time': current_time,
                'timestamp': timezone.now().isoformat(),
                'sender': await self.serialize_user(self.user)
            }
        )
        
        # Update sync data
        self.sync_data.update({
            'current_time': current_time,
            'is_playing': True,
            'last_update': timezone.now()
        })
        await self.cache_sync_data()
    
    async def handle_pause(self, data):
        """Handle pause command"""
        if not self.can_control_playback():
            return
        
        current_time = data.get('current_time', self.sync_data['current_time'])
        
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'pause_command',
                'current_time': current_time,
                'timestamp': timezone.now().isoformat(),
                'sender': await self.serialize_user(self.user)
            }
        )
        
        # Update sync data
        self.sync_data.update({
            'current_time': current_time,
            'is_playing': False,
            'last_update': timezone.now()
        })
        await self.cache_sync_data()
    
    async def handle_seek(self, data):
        """Handle seek command"""
        if not self.can_control_playback():
            return
        
        seek_time = data.get('seek_time', 0)
        was_playing = self.sync_data.get('is_playing', False)
        
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'seek_command',
                'seek_time': seek_time,
                'was_playing': was_playing,
                'timestamp': timezone.now().isoformat(),
                'sender': await self.serialize_user(self.user)
            }
        )
        
        # Update sync data
        self.sync_data.update({
            'current_time': seek_time,
            'last_update': timezone.now()
        })
        await self.cache_sync_data()
    
    async def handle_playback_rate(self, data):
        """Handle playback rate change"""
        if not self.can_control_playback():
            return
        
        rate = data.get('rate', 1.0)
        # Limit playback rates
        rate = max(0.25, min(2.0, rate))
        
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'playback_rate_change',
                'rate': rate,
                'timestamp': timezone.now().isoformat(),
                'sender': await self.serialize_user(self.user)
            }
        )
        
        self.sync_data['playback_rate'] = rate
        await self.cache_sync_data()
    
    async def handle_quality_change(self, data):
        """Handle video quality change"""
        quality = data.get('quality', 'auto')
        
        # Notify others of quality change (for adaptive streaming)
        await self.channel_layer.group_send(
            self.party_group_name,
            {
                'type': 'quality_change_notification',
                'quality': quality,
                'user': await self.serialize_user(self.user),
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_heartbeat(self, data):
        """Handle client heartbeat"""
        client_time = data.get('client_time', 0)
        data.get('is_playing', False)
        
        # Calculate drift and send correction if needed
        server_time = self.calculate_expected_time()
        drift = abs(client_time - server_time)
        
        if drift > 2.0:  # More than 2 seconds drift
            await self.send(text_data=json.dumps({
                'type': 'sync_correction',
                'correct_time': server_time,
                'is_playing': self.sync_data.get('is_playing', False),
                'drift': drift,
                'timestamp': timezone.now().isoformat()
            }))
    
    async def handle_request_sync(self, data):
        """Handle request for current sync state"""
        await self.send_sync_state()
    
    # Group message handlers
    async def sync_update_broadcast(self, event):
        """Broadcast sync update to client"""
        await self.send(text_data=json.dumps({
            'type': 'sync_update',
            'current_time': event['current_time'],
            'is_playing': event['is_playing'],
            'playback_rate': event['playback_rate'],
            'timestamp': event['timestamp'],
            'sender': event['sender']
        }))
    
    async def play_command(self, event):
        """Send play command to client"""
        await self.send(text_data=json.dumps({
            'type': 'play',
            'current_time': event['current_time'],
            'timestamp': event['timestamp'],
            'sender': event['sender']
        }))
    
    async def pause_command(self, event):
        """Send pause command to client"""
        await self.send(text_data=json.dumps({
            'type': 'pause',
            'current_time': event['current_time'],
            'timestamp': event['timestamp'],
            'sender': event['sender']
        }))
    
    async def seek_command(self, event):
        """Send seek command to client"""
        await self.send(text_data=json.dumps({
            'type': 'seek',
            'seek_time': event['seek_time'],
            'was_playing': event['was_playing'],
            'timestamp': event['timestamp'],
            'sender': event['sender']
        }))
    
    async def playback_rate_change(self, event):
        """Send playback rate change to client"""
        await self.send(text_data=json.dumps({
            'type': 'playback_rate',
            'rate': event['rate'],
            'timestamp': event['timestamp'],
            'sender': event['sender']
        }))
    
    async def user_joined(self, event):
        """Notify client of user joining"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'is_host': event['is_host'],
            'timestamp': event['timestamp']
        }))
    
    async def user_left(self, event):
        """Notify client of user leaving"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))
    
    # Helper methods
    async def send_sync_state(self):
        """Send current sync state to client"""
        # Get cached sync data
        await self.load_sync_data()
        
        current_time = self.calculate_expected_time()
        
        await self.send(text_data=json.dumps({
            'type': 'sync_state',
            'current_time': current_time,
            'is_playing': self.sync_data.get('is_playing', False),
            'playback_rate': self.sync_data.get('playback_rate', 1.0),
            'video_duration': self.sync_data.get('video_duration', 0),
            'quality': self.sync_data.get('quality', 'auto'),
            'timestamp': timezone.now().isoformat()
        }))
    
    def calculate_expected_time(self):
        """Calculate expected current time based on sync data"""
        if not self.sync_data.get('last_update'):
            return self.sync_data.get('current_time', 0)
        
        if not self.sync_data.get('is_playing'):
            return self.sync_data.get('current_time', 0)
        
        # Calculate elapsed time since last update
        elapsed = (timezone.now() - self.sync_data['last_update']).total_seconds()
        playback_rate = self.sync_data.get('playback_rate', 1.0)
        
        expected_time = self.sync_data.get('current_time', 0) + (elapsed * playback_rate)
        
        # Ensure we don't go beyond video duration
        duration = self.sync_data.get('video_duration', 0)
        if duration > 0:
            expected_time = min(expected_time, duration)
        
        return expected_time
    
    def can_control_playback(self):
        """Check if user can control playback"""
        # Host can always control
        if self.is_host:
            return True
        
        # Check party settings for shared control
        # This would be configurable per party
        return False
    
    async def should_accept_sync_update(self, data):
        """Determine if sync update should be accepted from non-host"""
        # Implement voting or consensus system for sync updates
        # For now, only accept from host
        return False
    
    async def cache_sync_data(self):
        """Cache sync data for persistence"""
        cache_key = f"party_sync_{self.party_code}"
        cache.set(cache_key, self.sync_data, timeout=3600)  # 1 hour
    
    async def load_sync_data(self):
        """Load sync data from cache"""
        cache_key = f"party_sync_{self.party_code}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            self.sync_data.update(cached_data)
    
    # Database operations
    @database_sync_to_async
    def get_party(self, party_code):
        """Get party by code"""
        from apps.parties.models import WatchParty
        try:
            return WatchParty.objects.select_related('video', 'host').get(party_code=party_code)
        except WatchParty.DoesNotExist:
            return None
    
    @database_sync_to_async
    def user_has_access(self, party, user):
        """Check if user has access to party"""
        return (
            party.host == user or
            party.participants.filter(id=user.id).exists() or
            party.visibility == 'public'
        )
    
    @database_sync_to_async
    def is_user_host(self, party, user):
        """Check if user is party host"""
        return party.host == user
    
    @database_sync_to_async
    def serialize_user(self, user):
        """Serialize user for JSON response"""
        return {
            'id': str(user.id),
            'username': user.username,
            'first_name': user.first_name,
            'avatar_url': user.avatar.url if user.avatar else None,
        }
