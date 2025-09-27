import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import (
    LiveReaction, VoiceChatRoom, VoiceChatParticipant, ScreenShare,
    InteractivePoll, PollResponse, InteractiveSession
)

User = get_user_model()
logger = logging.getLogger(__name__)


class InteractiveConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for all interactive features"""

    async def connect(self):
        """Handle WebSocket connection"""
        self.party_id = self.scope['url_route']['kwargs']['party_id']
        self.party_group_name = f'interactive_{self.party_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        # Join party group
        await self.channel_layer.group_add(
            self.party_group_name,
            self.channel_name
        )

        # Initialize interactive session
        await self.init_interactive_session()

        await self.accept()
        logger.info(f"User {self.user.username} connected to interactive features for party {self.party_id}")

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'party_group_name'):
            # Leave party group
            await self.channel_layer.group_discard(
                self.party_group_name,
                self.channel_name
            )

            # Update session and voice chat status
            await self.cleanup_user_session()

        logger.info(f"User {self.user.username} disconnected from interactive features")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            # Route message based on type
            handler_map = {
                'live_reaction': self.handle_live_reaction,
                'voice_chat_join': self.handle_voice_chat_join,
                'voice_chat_leave': self.handle_voice_chat_leave,
                'voice_chat_mute': self.handle_voice_chat_mute,
                'voice_chat_speaking': self.handle_voice_chat_speaking,
                'screen_share_start': self.handle_screen_share_start,
                'screen_share_stop': self.handle_screen_share_stop,
                'screen_share_update': self.handle_screen_share_update,
                'poll_response': self.handle_poll_response,
                'poll_create': self.handle_poll_create,
                'annotation_create': self.handle_annotation_create,
                'annotation_update': self.handle_annotation_update,
                'annotation_delete': self.handle_annotation_delete,
                'webrtc_signal': self.handle_webrtc_signal,
            }

            handler = handler_map.get(message_type)
            if handler:
                await handler(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")

        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}")
            await self.send_error("Internal server error")

    # ==================== LIVE REACTIONS ====================

    async def handle_live_reaction(self, data):
        """Handle live reaction creation and broadcast"""
        try:
            reaction_data = await self.create_live_reaction(data)
            if reaction_data:
                # Broadcast to all party members
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'live_reaction_created',
                        'reaction': reaction_data
                    }
                )
        except Exception as e:
            await self.send_error(f"Failed to create reaction: {str(e)}")

    async def live_reaction_created(self, event):
        """Send live reaction to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'live_reaction',
            'data': event['reaction']
        }))

    @database_sync_to_async
    def create_live_reaction(self, data):
        """Create live reaction in database"""
        try:
            from apps.parties.models import Party
            
            party = Party.objects.get(id=self.party_id)
            
            reaction = LiveReaction.objects.create(
                party=party,
                user=self.user,
                reaction=data.get('reaction'),
                video_timestamp=data.get('video_timestamp', 0),
                position_x=data.get('position_x'),
                position_y=data.get('position_y'),
                animation_type=data.get('animation_type', 'float_up'),
                duration=data.get('duration', 3.0)
            )
            
            # Update session stats
            session, _ = InteractiveSession.objects.get_or_create(
                party=party,
                user=self.user
            )
            session.reactions_sent += 1
            session.save()
            
            return {
                'id': reaction.id,
                'user': self.user.username,
                'reaction': reaction.reaction,
                'video_timestamp': reaction.video_timestamp,
                'position_x': reaction.position_x,
                'position_y': reaction.position_y,
                'animation_type': reaction.animation_type,
                'duration': reaction.duration,
                'created_at': reaction.created_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error creating live reaction: {str(e)}")
            return None

    # ==================== VOICE CHAT ====================

    async def handle_voice_chat_join(self, data):
        """Handle voice chat join request"""
        try:
            result = await self.join_voice_chat(data)
            if result['success']:
                # Notify all participants about new member
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'voice_chat_participant_joined',
                        'participant': result['participant']
                    }
                )
            else:
                await self.send_error(result['error'])
        except Exception as e:
            await self.send_error(f"Failed to join voice chat: {str(e)}")

    async def handle_voice_chat_leave(self, data):
        """Handle voice chat leave"""
        try:
            await self.leave_voice_chat()
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'voice_chat_participant_left',
                    'user_id': self.user.id,
                    'username': self.user.username
                }
            )
        except Exception as e:
            logger.error(f"Error leaving voice chat: {str(e)}")

    async def handle_voice_chat_mute(self, data):
        """Handle voice chat mute/unmute"""
        try:
            is_muted = await self.toggle_voice_mute(data.get('is_muted'))
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'voice_chat_participant_muted',
                    'user_id': self.user.id,
                    'is_muted': is_muted
                }
            )
        except Exception as e:
            logger.error(f"Error toggling mute: {str(e)}")

    async def handle_voice_chat_speaking(self, data):
        """Handle speaking status updates"""
        try:
            await self.update_speaking_status(data.get('is_speaking', False))
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'voice_chat_speaking_update',
                    'user_id': self.user.id,
                    'is_speaking': data.get('is_speaking', False)
                }
            )
        except Exception as e:
            logger.error(f"Error updating speaking status: {str(e)}")

    @database_sync_to_async
    def join_voice_chat(self, data):
        """Join voice chat room"""
        try:
            from apps.parties.models import Party
            
            party = Party.objects.get(id=self.party_id)
            room, created = VoiceChatRoom.objects.get_or_create(
                party=party,
                defaults={'ice_servers': data.get('ice_servers', [])}
            )
            
            if not room.is_active:
                return {'success': False, 'error': 'Voice chat is disabled'}
            
            # Check participant limit
            if room.participants.filter(is_connected=True).count() >= room.max_participants:
                return {'success': False, 'error': 'Voice chat room is full'}
            
            participant, created = VoiceChatParticipant.objects.get_or_create(
                room=room,
                user=self.user,
                defaults={
                    'is_connected': True,
                    'peer_id': data.get('peer_id', ''),
                }
            )
            
            if not created:
                participant.is_connected = True
                participant.peer_id = data.get('peer_id', '')
                participant.save()
            
            return {
                'success': True,
                'participant': {
                    'id': participant.id,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'peer_id': participant.peer_id,
                    'is_muted': participant.is_muted,
                    'volume_level': participant.volume_level
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @database_sync_to_async
    def leave_voice_chat(self):
        """Leave voice chat room"""
        try:
            participant = VoiceChatParticipant.objects.get(
                room__party_id=self.party_id,
                user=self.user,
                is_connected=True
            )
            participant.is_connected = False
            participant.left_at = timezone.now()
            participant.save()
        except VoiceChatParticipant.DoesNotExist:
            pass

    @database_sync_to_async
    def toggle_voice_mute(self, is_muted):
        """Toggle mute status"""
        try:
            participant = VoiceChatParticipant.objects.get(
                room__party_id=self.party_id,
                user=self.user,
                is_connected=True
            )
            participant.is_muted = is_muted
            participant.save()
            return is_muted
        except VoiceChatParticipant.DoesNotExist:
            return False

    @database_sync_to_async
    def update_speaking_status(self, is_speaking):
        """Update speaking status"""
        try:
            participant = VoiceChatParticipant.objects.get(
                room__party_id=self.party_id,
                user=self.user,
                is_connected=True
            )
            participant.is_speaking = is_speaking
            participant.save()
        except VoiceChatParticipant.DoesNotExist:
            pass

    # ==================== SCREEN SHARING ====================

    async def handle_screen_share_start(self, data):
        """Handle screen share start"""
        try:
            share_data = await self.start_screen_share(data)
            if share_data:
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'screen_share_started',
                        'share': share_data
                    }
                )
        except Exception as e:
            await self.send_error(f"Failed to start screen share: {str(e)}")

    async def handle_screen_share_stop(self, data):
        """Handle screen share stop"""
        try:
            await self.stop_screen_share(data.get('share_id'))
            await self.channel_layer.group_send(
                self.party_group_name,
                {
                    'type': 'screen_share_stopped',
                    'user_id': self.user.id,
                    'share_id': data.get('share_id')
                }
            )
        except Exception as e:
            logger.error(f"Error stopping screen share: {str(e)}")

    @database_sync_to_async
    def start_screen_share(self, data):
        """Start screen sharing session"""
        try:
            from apps.parties.models import Party
            
            party = Party.objects.get(id=self.party_id)
            
            # Stop any existing screen shares by this user
            ScreenShare.objects.filter(
                party=party,
                user=self.user,
                is_active=True
            ).update(is_active=False, ended_at=timezone.now())
            
            share = ScreenShare.objects.create(
                party=party,
                user=self.user,
                share_type=data.get('share_type', 'full_screen'),
                resolution=data.get('resolution', '1080p'),
                frame_rate=data.get('frame_rate', 30),
                bitrate=data.get('bitrate', 2500),
                allow_remote_control=data.get('allow_remote_control', False),
                viewers_can_annotate=data.get('viewers_can_annotate', False),
                peer_connection_id=data.get('peer_connection_id', '')
            )
            
            # Update session stats
            session, _ = InteractiveSession.objects.get_or_create(
                party=party,
                user=self.user
            )
            session.screen_shares_initiated += 1
            session.save()
            
            return {
                'id': share.id,
                'share_id': str(share.share_id),
                'user_id': self.user.id,
                'username': self.user.username,
                'share_type': share.share_type,
                'resolution': share.resolution,
                'frame_rate': share.frame_rate,
                'viewers_can_annotate': share.viewers_can_annotate,
                'started_at': share.started_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error starting screen share: {str(e)}")
            return None

    @database_sync_to_async
    def stop_screen_share(self, share_id):
        """Stop screen sharing session"""
        try:
            share = ScreenShare.objects.get(
                share_id=share_id,
                user=self.user,
                is_active=True
            )
            share.is_active = False
            share.ended_at = timezone.now()
            share.save()
        except ScreenShare.DoesNotExist:
            pass

    # ==================== INTERACTIVE POLLS ====================

    async def handle_poll_response(self, data):
        """Handle poll response submission"""
        try:
            response_data = await self.submit_poll_response(data)
            if response_data:
                # Broadcast updated poll results
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'poll_response_submitted',
                        'poll_id': data.get('poll_id'),
                        'response': response_data
                    }
                )
        except Exception as e:
            await self.send_error(f"Failed to submit poll response: {str(e)}")

    async def handle_poll_create(self, data):
        """Handle poll creation (host only)"""
        try:
            poll_data = await self.create_poll(data)
            if poll_data:
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'poll_created',
                        'poll': poll_data
                    }
                )
        except Exception as e:
            await self.send_error(f"Failed to create poll: {str(e)}")

    @database_sync_to_async
    def submit_poll_response(self, data):
        """Submit response to interactive poll"""
        try:
            poll = InteractivePoll.objects.get(
                poll_id=data.get('poll_id'),
                is_published=True
            )
            
            if poll.is_expired():
                return None
            
            response, created = PollResponse.objects.get_or_create(
                poll=poll,
                user=self.user,
                defaults={
                    'selected_option': data.get('selected_option'),
                    'rating_value': data.get('rating_value'),
                    'text_response': data.get('text_response', ''),
                    'emoji_reaction': data.get('emoji_reaction', ''),
                    'response_time': data.get('response_time')
                }
            )
            
            if created:
                poll.total_responses += 1
                poll.save()
                
                # Update session stats
                session, _ = InteractiveSession.objects.get_or_create(
                    party=poll.party,
                    user=self.user
                )
                session.polls_participated += 1
                session.save()
            
            return {
                'poll_id': str(poll.poll_id),
                'user_id': self.user.id,
                'created': created
            }
        except InteractivePoll.DoesNotExist:
            return None

    # ==================== WEBRTC SIGNALING ====================

    async def handle_webrtc_signal(self, data):
        """Handle WebRTC signaling for voice chat and screen sharing"""
        try:
            target_user = data.get('target_user')
            if target_user:
                # Send signal to specific user
                await self.channel_layer.group_send(
                    self.party_group_name,
                    {
                        'type': 'webrtc_signal',
                        'signal': data.get('signal'),
                        'signal_type': data.get('signal_type'),
                        'from_user': self.user.id,
                        'target_user': target_user
                    }
                )
        except Exception as e:
            logger.error(f"Error handling WebRTC signal: {str(e)}")

    async def webrtc_signal(self, event):
        """Forward WebRTC signal to target user"""
        if event.get('target_user') == self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'webrtc_signal',
                'signal': event['signal'],
                'signal_type': event['signal_type'],
                'from_user': event['from_user']
            }))

    # ==================== HELPER METHODS ====================

    @database_sync_to_async
    def init_interactive_session(self):
        """Initialize interactive session for user"""
        try:
            from apps.parties.models import Party
            
            party = Party.objects.get(id=self.party_id)
            session, created = InteractiveSession.objects.get_or_create(
                party=party,
                user=self.user
            )
            if not created:
                session.last_activity = timezone.now()
                session.save()
        except Exception as e:
            logger.error(f"Error initializing interactive session: {str(e)}")

    @database_sync_to_async
    def cleanup_user_session(self):
        """Cleanup user session on disconnect"""
        try:
            # Leave voice chat if connected
            VoiceChatParticipant.objects.filter(
                room__party_id=self.party_id,
                user=self.user,
                is_connected=True
            ).update(is_connected=False, left_at=timezone.now())
            
            # Stop any active screen shares
            ScreenShare.objects.filter(
                party_id=self.party_id,
                user=self.user,
                is_active=True
            ).update(is_active=False, ended_at=timezone.now())
            
        except Exception as e:
            logger.error(f"Error cleaning up user session: {str(e)}")

    async def send_error(self, message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    # ==================== BROADCAST HANDLERS ====================

    async def voice_chat_participant_joined(self, event):
        """Broadcast voice chat participant joined"""
        await self.send(text_data=json.dumps({
            'type': 'voice_chat_participant_joined',
            'participant': event['participant']
        }))

    async def voice_chat_participant_left(self, event):
        """Broadcast voice chat participant left"""
        await self.send(text_data=json.dumps({
            'type': 'voice_chat_participant_left',
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def voice_chat_participant_muted(self, event):
        """Broadcast participant mute status change"""
        await self.send(text_data=json.dumps({
            'type': 'voice_chat_participant_muted',
            'user_id': event['user_id'],
            'is_muted': event['is_muted']
        }))

    async def voice_chat_speaking_update(self, event):
        """Broadcast speaking status update"""
        await self.send(text_data=json.dumps({
            'type': 'voice_chat_speaking_update',
            'user_id': event['user_id'],
            'is_speaking': event['is_speaking']
        }))

    async def screen_share_started(self, event):
        """Broadcast screen share started"""
        await self.send(text_data=json.dumps({
            'type': 'screen_share_started',
            'share': event['share']
        }))

    async def screen_share_stopped(self, event):
        """Broadcast screen share stopped"""
        await self.send(text_data=json.dumps({
            'type': 'screen_share_stopped',
            'user_id': event['user_id'],
            'share_id': event['share_id']
        }))

    async def poll_created(self, event):
        """Broadcast new poll created"""
        await self.send(text_data=json.dumps({
            'type': 'poll_created',
            'poll': event['poll']
        }))

    async def poll_response_submitted(self, event):
        """Broadcast poll response submitted"""
        await self.send(text_data=json.dumps({
            'type': 'poll_response_submitted',
            'poll_id': event['poll_id'],
            'response': event['response']
        }))
