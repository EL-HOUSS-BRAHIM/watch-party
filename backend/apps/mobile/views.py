"""
Mobile app specific API endpoints and optimizations
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import serializers
from django.utils import timezone
from django.db.models import Q, Count, Prefetch
from drf_spectacular.utils import extend_schema
from datetime import timedelta

from shared.responses import StandardResponse
from shared.api_documentation import api_response_documentation


class MobileAppConfigView(APIView):
    """
    Mobile app configuration endpoint
    """
    serializer_class = serializers.Serializer
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Get mobile app configuration",
        description="Retrieve configuration settings optimized for mobile app",
        tags=['Mobile']
    )
    @extend_schema(summary="MobileAppConfigView GET")
    def get(self, request):
        """Get mobile app configuration"""
        request.headers.get('X-App-Version', '1.0.0')
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
    serializer_class = serializers.Serializer
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Get mobile home screen data",
        description="Retrieve optimized home screen data for mobile app including parties, videos, and activities",
        tags=['Mobile']
    )
    @extend_schema(summary="MobileHomeView GET")
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
    serializer_class = serializers.Serializer
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Sync offline data",
        description="Sync data for offline usage on mobile devices",
        tags=['Mobile', 'Sync']
    )
    @extend_schema(summary="MobileOfflineSyncView POST")
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
        from apps.parties.models import WatchParty
        
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device(request):
    """Register a mobile device"""
    from .models import MobileDevice
    
    device_id = request.data.get('device_id')
    platform = request.data.get('platform', 'unknown')
    model = request.data.get('model', '')
    os_version = request.data.get('os_version', '')
    app_version = request.data.get('app_version', '')
    push_token = request.data.get('push_token', '')
    
    if not device_id:
        return StandardResponse.error("Device ID is required")
    
    try:
        device, created = MobileDevice.objects.update_or_create(
            device_id=device_id,
            defaults={
                'user': request.user,
                'platform': platform,
                'model': model,
                'os_version': os_version,
                'app_version': app_version,
                'push_token': push_token,
                'push_enabled': True,
                'is_active': True,
                'last_active': timezone.now()
            }
        )
        
        return StandardResponse.success({
            'device_id': str(device.id),
            'created': created,
            'sync_required': created  # New devices need full sync
        }, "Device registered successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Failed to register device: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_analytics(request):
    """Track mobile app analytics events"""
    from .models import MobileDevice, MobileAnalytics
    
    device_id = request.data.get('device_id')
    events = request.data.get('events', [])
    
    if not device_id or not events:
        return StandardResponse.error("Device ID and events are required")
    
    try:
        device = MobileDevice.objects.get(device_id=device_id, user=request.user)
        
        analytics_objects = []
        for event in events:
            analytics_objects.append(MobileAnalytics(
                device=device,
                event_type=event.get('event_type'),
                event_name=event.get('event_name'),
                event_data=event.get('event_data', {}),
                session_id=event.get('session_id'),
                screen_name=event.get('screen_name', ''),
                load_time_ms=event.get('load_time_ms'),
                memory_usage_mb=event.get('memory_usage_mb'),
                timestamp=timezone.now()
            ))
        
        MobileAnalytics.objects.bulk_create(analytics_objects)
        device.update_last_active()
        
        return StandardResponse.success({
            'tracked_events': len(analytics_objects)
        }, "Analytics events tracked successfully")
        
    except MobileDevice.DoesNotExist:
        return StandardResponse.error("Device not found")
    except Exception as e:
        return StandardResponse.error(f"Failed to track analytics: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_crash(request):
    """Report mobile app crash"""
    from .models import MobileDevice, MobileAppCrash
    
    device_id = request.data.get('device_id')
    crash_data = request.data.get('crash_data', {})
    
    if not device_id or not crash_data:
        return StandardResponse.error("Device ID and crash data are required")
    
    try:
        device = MobileDevice.objects.get(device_id=device_id, user=request.user)
        
        crash = MobileAppCrash.objects.create(
            device=device,
            crash_id=crash_data.get('crash_id'),
            stack_trace=crash_data.get('stack_trace', ''),
            exception_type=crash_data.get('exception_type', ''),
            exception_message=crash_data.get('exception_message', ''),
            screen_name=crash_data.get('screen_name', ''),
            user_action=crash_data.get('user_action', ''),
            memory_usage_mb=crash_data.get('memory_usage_mb'),
            battery_level=crash_data.get('battery_level'),
            crashed_at=timezone.datetime.fromisoformat(
                crash_data.get('crashed_at', timezone.now().isoformat())
            )
        )
        
        return StandardResponse.success({
            'crash_report_id': str(crash.id)
        }, "Crash report submitted successfully")
        
    except MobileDevice.DoesNotExist:
        return StandardResponse.error("Device not found")
    except Exception as e:
        return StandardResponse.error(f"Failed to report crash: {str(e)}")


class MobileSyncView(APIView):
    """Data synchronization for mobile devices"""
    serializer_class = serializers.Serializer
    permission_classes = [IsAuthenticated]
    
    @api_response_documentation(
        summary="Synchronize mobile data",
        description="Full synchronization endpoint for mobile app data",
        tags=['Mobile', 'Sync']
    )
    @extend_schema(summary="MobileSyncView POST")
    def post(self, request):
        """Perform data synchronization"""
        from .models import MobileDevice, MobileSyncData
        
        device_id = request.data.get('device_id')
        sync_type = request.data.get('sync_type', 'incremental')
        last_sync = request.data.get('last_sync')
        
        if not device_id:
            return StandardResponse.error("Device ID is required")
        
        try:
            device = MobileDevice.objects.get(device_id=device_id, user=request.user)
            
            # Create sync record
            sync_record = MobileSyncData.objects.create(
                device=device,
                sync_type=sync_type,
                sync_status='in_progress',
                started_at=timezone.now()
            )
            
            # Perform sync based on type
            if sync_type == 'full':
                sync_data = self.perform_full_sync(request.user)
            else:
                sync_data = self.perform_incremental_sync(request.user, last_sync)
            
            # Update sync record
            sync_record.sync_status = 'completed'
            sync_record.completed_at = timezone.now()
            sync_record.duration_seconds = (
                sync_record.completed_at - sync_record.started_at
            ).total_seconds()
            sync_record.data_types = list(sync_data.keys())
            sync_record.records_count = sum(
                len(data) if isinstance(data, list) else 1 
                for data in sync_data.values()
            )
            sync_record.save()
            
            # Update device last sync
            device.last_sync = timezone.now()
            device.save(update_fields=['last_sync'])
            
            return StandardResponse.success({
                'sync_id': str(sync_record.id),
                'data': sync_data,
                'sync_timestamp': timezone.now().isoformat()
            }, "Synchronization completed successfully")
            
        except MobileDevice.DoesNotExist:
            return StandardResponse.error("Device not found")
        except Exception as e:
            # Update sync record with error
            if 'sync_record' in locals():
                sync_record.sync_status = 'failed'
                sync_record.error_message = str(e)
                sync_record.save()
            
            return StandardResponse.error(f"Synchronization failed: {str(e)}")
    
    def perform_full_sync(self, user):
        """Perform full data synchronization"""
        sync_data = {}
        
        # Sync user profile
        sync_data['profile'] = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.avatar.url if user.avatar else None,
            'is_premium': getattr(user, 'is_premium', False),
            'settings': getattr(user, 'settings', {})
        }
        
        # Sync parties
        from apps.parties.models import WatchParty
        user_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants__user=user, participants__is_active=True)
        ).distinct()[:50]
        
        sync_data['parties'] = [
            {
                'id': str(party.id),
                'title': party.title,
                'description': party.description,
                'is_active': party.is_active,
                'host_id': str(party.host.id),
                'created_at': party.created_at.isoformat(),
                'updated_at': party.updated_at.isoformat()
            }
            for party in user_parties
        ]
        
        # Sync videos
        from apps.videos.models import Video
        user_videos = Video.objects.filter(
            Q(uploaded_by=user) | Q(is_public=True),
            status='ready'
        )[:50]
        
        sync_data['videos'] = [
            {
                'id': str(video.id),
                'title': video.title,
                'description': video.description,
                'thumbnail': video.thumbnail.url if video.thumbnail else None,
                'duration': str(video.duration) if video.duration else None,
                'status': video.status,
                'created_at': video.created_at.isoformat()
            }
            for video in user_videos
        ]
        
        return sync_data
    
    def perform_incremental_sync(self, user, last_sync):
        """Perform incremental data synchronization"""
        if last_sync:
            last_sync_dt = timezone.datetime.fromisoformat(last_sync.replace('Z', '+00:00'))
        else:
            last_sync_dt = timezone.now() - timedelta(hours=1)
        
        sync_data = {}
        
        # Sync updated parties
        from apps.parties.models import WatchParty
        updated_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants__user=user, participants__is_active=True),
            updated_at__gte=last_sync_dt
        ).distinct()
        
        sync_data['parties'] = [
            {
                'id': str(party.id),
                'title': party.title,
                'is_active': party.is_active,
                'updated_at': party.updated_at.isoformat(),
                'action': 'update'
            }
            for party in updated_parties
        ]
        
        # Sync new notifications
        from apps.notifications.models import Notification
        new_notifications = Notification.objects.filter(
            user=user,
            created_at__gte=last_sync_dt
        )
        
        sync_data['notifications'] = [
            {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'action': 'create'
            }
            for notification in new_notifications
        ]
        
        return sync_data
