"""
Mobile app specific API endpoints and optimizations
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db.models import Q, Count, Prefetch
from datetime import timedelta

from core.responses import StandardResponse
from core.api_documentation import api_response_documentation


class MobileAppConfigView(APIView):
    """
    Mobile app configuration endpoint
    """
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Get mobile app configuration",
        description="Retrieve configuration settings optimized for mobile app",
        tags=['Mobile']
    )
    def get(self, request):
        """Get mobile app configuration"""
        app_version = request.headers.get('X-App-Version', '1.0.0')
        platform = request.headers.get('X-Platform', 'unknown')  # ios, android
        
        config = {
            'app_info': {
                'min_supported_version': '1.0.0',
                'latest_version': '1.2.0',
                'force_update': False,
                'update_message': 'A new version is available with improved performance.'
            },
            'features': {
                'video_upload': True,
                'live_chat': True,
                'push_notifications': True,
                'offline_mode': True,
                'background_audio': platform == 'ios',  # iOS specific feature
                'picture_in_picture': True,
                'chromecast_support': platform == 'android',
                'airplay_support': platform == 'ios'
            },
            'limits': {
                'max_video_size_mb': 500,
                'max_video_duration_minutes': 120,
                'max_party_participants': 50,
                'max_upload_concurrent': 3,
                'video_quality_auto_adjust': True
            },
            'media_settings': {
                'thumbnail_sizes': ['150x84', '300x168', '480x270'],
                'video_qualities': ['240p', '360p', '480p', '720p', '1080p'],
                'default_quality': 'auto',
                'adaptive_streaming': True,
                'preload_buffer_seconds': 10
            },
            'sync_settings': {
                'sync_interval_seconds': 30,
                'offline_cache_duration_hours': 24,
                'background_sync': True,
                'wifi_only_uploads': False
            },
            'ui_settings': {
                'theme': 'dark',  # dark, light, auto
                'primary_color': '#007AFF',
                'show_party_thumbnails': True,
                'enable_haptic_feedback': platform == 'ios',
                'gesture_controls': True
            },
            'notification_settings': {
                'categories': [
                    {'id': 'party_invites', 'name': 'Party Invitations', 'default': True},
                    {'id': 'friend_requests', 'name': 'Friend Requests', 'default': True},
                    {'id': 'new_messages', 'name': 'New Messages', 'default': True},
                    {'id': 'party_updates', 'name': 'Party Updates', 'default': True},
                    {'id': 'achievements', 'name': 'Achievements', 'default': True},
                    {'id': 'system_announcements', 'name': 'System Announcements', 'default': False}
                ]
            }
        }
        
        return StandardResponse.success(config, "Mobile app configuration retrieved")


class MobileHomeView(APIView):
    """
    Mobile optimized home screen data
    """
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Get mobile home screen data",
        description="Retrieve optimized home screen data for mobile app including parties, videos, and activities",
        tags=['Mobile']
    )
    def get(self, request):
        """Get mobile home screen data"""
        user = request.user
        
        # Get active parties
        active_parties = self.get_active_parties(user)
        
        # Get recent videos
        recent_videos = self.get_recent_videos(user)
        
        # Get friend activities
        friend_activities = self.get_friend_activities(user)
        
        # Get trending content
        trending = self.get_trending_content()
        
        # Get user quick stats
        quick_stats = self.get_user_quick_stats(user)
        
        # Get recommendations
        recommendations = self.get_recommendations(user)
        
        home_data = {
            'user_info': {
                'id': str(user.id),
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
                'avatar_url': user.avatar.url if user.avatar else None,
                'is_premium': getattr(user, 'is_premium', False),
                'unread_notifications': self.get_unread_notifications_count(user)
            },
            'quick_stats': quick_stats,
            'active_parties': active_parties,
            'recent_videos': recent_videos,
            'friend_activities': friend_activities,
            'trending': trending,
            'recommendations': recommendations,
            'last_updated': timezone.now().isoformat()
        }
        
        return StandardResponse.success(home_data, "Home screen data retrieved")
    
    def get_active_parties(self, user):
        """Get active parties for user"""
        from apps.parties.models import WatchParty, PartyParticipant
        
        # Parties user is hosting or participating in
        user_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants__user=user, participants__is_active=True),
            is_active=True
        ).distinct().select_related('host', 'current_video').prefetch_related(
            Prefetch(
                'participants',
                queryset=PartyParticipant.objects.filter(is_active=True).select_related('user')
            )
        )[:5]
        
        return [
            {
                'id': str(party.id),
                'title': party.title,
                'host': {
                    'id': str(party.host.id),
                    'username': party.host.username,
                    'display_name': party.host.get_full_name() or party.host.username
                },
                'participant_count': party.participants.filter(is_active=True).count(),
                'current_video': {
                    'title': party.current_video.title if party.current_video else None,
                    'thumbnail': party.current_video.thumbnail.url if party.current_video and party.current_video.thumbnail else None
                } if party.current_video else None,
                'created_at': party.created_at.isoformat(),
                'is_host': party.host == user
            }
            for party in user_parties
        ]
    
    def get_recent_videos(self, user):
        """Get recent videos for user"""
        from apps.videos.models import Video
        
        recent_videos = Video.objects.filter(
            status='ready',
            is_public=True
        ).select_related('uploaded_by').order_by('-created_at')[:10]
        
        return [
            {
                'id': str(video.id),
                'title': video.title,
                'description': video.description[:100] + '...' if len(video.description) > 100 else video.description,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': str(video.duration) if video.duration else None,
                'uploaded_by': {
                    'id': str(video.uploaded_by.id),
                    'username': video.uploaded_by.username,
                    'display_name': video.uploaded_by.get_full_name() or video.uploaded_by.username
                },
                'created_at': video.created_at.isoformat(),
                'view_count': getattr(video, 'view_count', 0),
                'category': video.category
            }
            for video in recent_videos
        ]
    
    def get_friend_activities(self, user):
        """Get friend activities"""
        from apps.analytics.models import AnalyticsEvent
        
        # Get recent activities from friends
        # This is a simplified implementation
        recent_activities = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=24),
            event_type__in=['party_created', 'video_uploaded', 'achievement_unlocked']
        ).select_related('user', 'video', 'party').order_by('-timestamp')[:10]
        
        activities = []
        for event in recent_activities:
            if event.user == user:  # Skip own activities
                continue
                
            activity = {
                'id': str(event.id),
                'type': event.event_type,
                'user': {
                    'id': str(event.user.id),
                    'username': event.user.username,
                    'display_name': event.user.get_full_name() or event.user.username,
                    'avatar': event.user.avatar.url if event.user.avatar else None
                },
                'timestamp': event.timestamp.isoformat(),
                'data': event.event_data
            }
            
            if event.video:
                activity['video'] = {
                    'id': str(event.video.id),
                    'title': event.video.title,
                    'thumbnail': event.video.thumbnail.url if event.video.thumbnail else None
                }
            
            if event.party:
                activity['party'] = {
                    'id': str(event.party.id),
                    'title': event.party.title
                }
            
            activities.append(activity)
        
        return activities
    
    def get_trending_content(self):
        """Get trending content"""
        from apps.videos.models import Video
        from apps.parties.models import WatchParty
        
        # Trending videos (simplified - based on recent creation)
        trending_videos = Video.objects.filter(
            status='ready',
            is_public=True,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-created_at')[:5]
        
        # Popular parties
        popular_parties = WatchParty.objects.filter(
            is_active=True,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).annotate(
            participant_count=Count('participants')
        ).order_by('-participant_count')[:5]
        
        return {
            'videos': [
                {
                    'id': str(video.id),
                    'title': video.title,
                    'thumbnail': video.thumbnail.url if video.thumbnail else None,
                    'view_count': getattr(video, 'view_count', 0)
                }
                for video in trending_videos
            ],
            'parties': [
                {
                    'id': str(party.id),
                    'title': party.title,
                    'participant_count': party.participant_count,
                    'host_username': party.host.username
                }
                for party in popular_parties
            ]
        }
    
    def get_user_quick_stats(self, user):
        """Get user quick statistics"""
        from apps.parties.models import WatchParty
        from apps.videos.models import Video
        from apps.store.models import UserAchievement
        
        return {
            'parties_hosted': WatchParty.objects.filter(host=user).count(),
            'videos_uploaded': Video.objects.filter(uploaded_by=user).count(),
            'achievements_unlocked': UserAchievement.objects.filter(user=user).count(),
            'watch_time_hours': getattr(user, 'total_watch_time', timedelta()).total_seconds() // 3600,
            'virtual_currency': getattr(user, 'virtual_currency', 0),
            'level': getattr(user, 'level', 1)
        }
    
    def get_recommendations(self, user):
        """Get personalized recommendations"""
        # Simplified recommendation system
        recommendations = [
            {
                'type': 'party',
                'title': 'Join a Movie Night',
                'description': 'Check out popular parties happening now',
                'action': 'browse_parties',
                'priority': 'high'
            },
            {
                'type': 'video',
                'title': 'Upload Your Video',
                'description': 'Share your favorite videos with friends',
                'action': 'upload_video',
                'priority': 'medium'
            }
        ]
        
        return recommendations
    
    def get_unread_notifications_count(self, user):
        """Get count of unread notifications"""
        try:
            from apps.notifications.models import Notification
            return Notification.objects.filter(user=user, is_read=False).count()
        except:
            return 0


class MobileOfflineSyncView(APIView):
    """
    Offline sync support for mobile app
    """
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Sync offline data",
        description="Sync data for offline usage on mobile devices",
        tags=['Mobile', 'Sync']
    )
    def post(self, request):
        """Sync offline data"""
        user = request.user
        sync_types = request.data.get('sync_types', ['parties', 'videos', 'messages'])
        last_sync = request.data.get('last_sync')
        
        if last_sync:
            last_sync_dt = timezone.datetime.fromisoformat(last_sync.replace('Z', '+00:00'))
        else:
            last_sync_dt = timezone.now() - timedelta(days=7)
        
        sync_data = {}
        
        if 'parties' in sync_types:
            sync_data['parties'] = self.sync_parties(user, last_sync_dt)
        
        if 'videos' in sync_types:
            sync_data['videos'] = self.sync_videos(user, last_sync_dt)
        
        if 'messages' in sync_types:
            sync_data['messages'] = self.sync_messages(user, last_sync_dt)
        
        if 'notifications' in sync_types:
            sync_data['notifications'] = self.sync_notifications(user, last_sync_dt)
        
        sync_response = {
            'sync_timestamp': timezone.now().isoformat(),
            'last_sync': last_sync,
            'data': sync_data,
            'has_more': False  # Simplified - would implement pagination for large datasets
        }
        
        return StandardResponse.success(sync_response, "Offline sync completed")
    
    def sync_parties(self, user, last_sync):
        """Sync party data"""
        from apps.parties.models import WatchParty, PartyParticipant
        
        updated_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants__user=user, participants__is_active=True),
            updated_at__gte=last_sync
        ).distinct()[:50]  # Limit for mobile
        
        return [
            {
                'id': str(party.id),
                'title': party.title,
                'description': party.description,
                'is_active': party.is_active,
                'updated_at': party.updated_at.isoformat(),
                'sync_action': 'update'
            }
            for party in updated_parties
        ]
    
    def sync_videos(self, user, last_sync):
        """Sync video data"""
        from apps.videos.models import Video
        
        updated_videos = Video.objects.filter(
            Q(uploaded_by=user) | Q(is_public=True),
            updated_at__gte=last_sync,
            status='ready'
        )[:50]
        
        return [
            {
                'id': str(video.id),
                'title': video.title,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': str(video.duration) if video.duration else None,
                'updated_at': video.updated_at.isoformat(),
                'sync_action': 'update'
            }
            for video in updated_videos
        ]
    
    def sync_messages(self, user, last_sync):
        """Sync message data"""
        from apps.messaging.models import Message, Conversation
        
        # Get conversations user is part of
        user_conversations = Conversation.objects.filter(participants=user)
        
        updated_messages = Message.objects.filter(
            conversation__in=user_conversations,
            sent_at__gte=last_sync
        ).select_related('sender', 'conversation')[:100]
        
        return [
            {
                'id': str(message.id),
                'conversation_id': str(message.conversation.id),
                'sender_id': str(message.sender.id),
                'content': message.content,
                'sent_at': message.sent_at.isoformat(),
                'sync_action': 'update'
            }
            for message in updated_messages
        ]
    
    def sync_notifications(self, user, last_sync):
        """Sync notification data"""
        from apps.notifications.models import Notification
        
        updated_notifications = Notification.objects.filter(
            user=user,
            created_at__gte=last_sync
        )[:50]
        
        return [
            {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'sync_action': 'update'
            }
            for notification in updated_notifications
        ]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_push_token(request):
    """Update user's push notification token"""
    token = request.data.get('token')
    device_type = request.data.get('device_type')  # ios, android
    
    if not token or not device_type:
        return StandardResponse.error("Token and device_type are required")
    
    try:
        from apps.notifications.models import PushSubscription
        
        # Update or create push subscription
        subscription, created = PushSubscription.objects.update_or_create(
            user=request.user,
            device_type=device_type,
            defaults={
                'token': token,
                'is_active': True,
                'updated_at': timezone.now()
            }
        )
        
        return StandardResponse.success({
            'subscription_id': str(subscription.id),
            'created': created
        }, "Push token updated successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Failed to update push token: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_app_info(request):
    """Get mobile app information and update notifications"""
    app_version = request.headers.get('X-App-Version', '1.0.0')
    platform = request.headers.get('X-Platform', 'unknown')
    
    # Check if app needs update
    needs_update = False
    force_update = False
    
    # Version comparison logic would go here
    
    app_info = {
        'current_version': app_version,
        'latest_version': '1.2.0',
        'needs_update': needs_update,
        'force_update': force_update,
        'update_url': {
            'ios': 'https://apps.apple.com/app/watchparty',
            'android': 'https://play.google.com/store/apps/details?id=com.watchparty.app'
        }.get(platform),
        'changelog': [
            'Improved video streaming performance',
            'New party invitation features',
            'Bug fixes and stability improvements'
        ],
        'maintenance_mode': False,
        'maintenance_message': None
    }
    
    return StandardResponse.success(app_info, "App info retrieved")
