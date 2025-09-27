"""
Analytics views for Watch Party Backend
"""

from rest_framework import generics, permissions, status
from drf_spectacular.openapi import OpenApiResponse, OpenApiExample
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from drf_spectacular.utils import extend_schema
from datetime import timedelta, date
from .models import UserAnalytics, PartyAnalytics, VideoAnalytics, AnalyticsEvent, SystemAnalytics
from .serializers import (
    UserAnalyticsSerializer, PartyAnalyticsSerializer, VideoAnalyticsSerializer,
    AnalyticsEventSerializer, SystemAnalyticsSerializer
)
from apps.parties.models import WatchParty
from apps.videos.models import Video

User = get_user_model()


class DashboardView(generics.GenericAPIView):
    """Main analytics dashboard view"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="DashboardView GET")
    def get(self, request):
        if request.user.is_staff:
            return AdminAnalyticsView().get(request)
        else:
            return UserDetailedStatsView().get(request)


class UserStatsView(generics.RetrieveAPIView):
    """Get personal analytics for authenticated user"""
    
    serializer_class = UserAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        analytics, created = UserAnalytics.objects.get_or_create(user=user)
        return analytics


class UserDetailedStatsView(generics.GenericAPIView):
    """Get detailed analytics for authenticated user"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserDetailedStatsView GET")
    def get(self, request, *args, **kwargs):
        user = request.user
        analytics, created = UserAnalytics.objects.get_or_create(user=user)
        
        # Get recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__gte=thirty_days_ago
        ).values('event_type').annotate(count=Count('id')).order_by('-count')
        
        # Get watch time by day (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        daily_watch_time = []
        for i in range(7):
            day = seven_days_ago + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            watch_events = AnalyticsEvent.objects.filter(
                user=user,
                event_type='view_end',
                timestamp__range=[day_start, day_end]
            ).aggregate(
                total_duration=Sum('duration')
            )
            
            duration_minutes = 0
            if watch_events['total_duration']:
                duration_minutes = int(watch_events['total_duration'].total_seconds() / 60)
            
            daily_watch_time.append({
                'date': day.date().isoformat(),
                'watch_time_minutes': duration_minutes
            })
        
        # Get favorite genres
        user_parties = WatchParty.objects.filter(
            Q(host=user) | Q(participants=user)
        ).distinct()
        
        genre_stats = {}
        for party in user_parties:
            if hasattr(party.video, 'genre') and party.video.genre:
                genre = party.video.genre
                genre_stats[genre] = genre_stats.get(genre, 0) + 1
        
        favorite_genres = sorted(genre_stats.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get hosted vs joined parties ratio
        hosted_parties = WatchParty.objects.filter(host=user).count()
        joined_parties = WatchParty.objects.filter(participants=user).exclude(host=user).count()
        
        response_data = {
            'analytics': UserAnalyticsSerializer(analytics).data,
            'recent_activity': list(recent_events),
            'daily_watch_time': daily_watch_time,
            'favorite_genres': [{'genre': genre, 'count': count} for genre, count in favorite_genres],
            'party_stats': {
                'hosted': hosted_parties,
                'joined': joined_parties,
                'total': hosted_parties + joined_parties
            },
            'achievements': self._calculate_achievements(analytics, user)
        }
        
        return Response(response_data)
    
    def _calculate_achievements(self, analytics, user):
        """Calculate user achievements based on analytics"""
        achievements = []
        
        # Watch time achievements
        if analytics.total_watch_time_minutes >= 6000:  # 100 hours
            achievements.append({
                'id': 'binge_watcher',
                'name': 'Binge Watcher',
                'description': 'Watched 100+ hours of content',
                'icon': '📺',
                'unlocked_at': analytics.created_at.isoformat()
            })
        
        # Social achievements
        if analytics.total_parties_hosted >= 50:
            achievements.append({
                'id': 'party_host',
                'name': 'Party Host',
                'description': 'Hosted 50+ watch parties',
                'icon': '🎉',
                'unlocked_at': analytics.created_at.isoformat()
            })
        
        # Chat achievements
        if analytics.total_messages_sent >= 1000:
            achievements.append({
                'id': 'chatterbox',
                'name': 'Chatterbox',
                'description': 'Sent 1000+ chat messages',
                'icon': '💬',
                'unlocked_at': analytics.created_at.isoformat()
            })
        
        # Content achievements
        if analytics.videos_uploaded >= 10:
            achievements.append({
                'id': 'content_creator',
                'name': 'Content Creator',
                'description': 'Uploaded 10+ videos',
                'icon': '🎬',
                'unlocked_at': analytics.created_at.isoformat()
            })
        
        return achievements


class PartyStatsView(generics.RetrieveAPIView):
    """Get analytics for a specific party"""
    
    serializer_class = PartyAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        party_id = self.kwargs.get('party_id')
        party = get_object_or_404(WatchParty, id=party_id)
        
        # Check if user has access (host or participant)
        user = self.request.user
        if not (party.host == user or party.participants.filter(id=user.id).exists()):
            raise permissions.PermissionDenied("You don't have access to this party's analytics")
        
        analytics, created = PartyAnalytics.objects.get_or_create(party=party)
        return analytics


class PartyDetailedStatsView(generics.GenericAPIView):
    """Get detailed analytics for a specific party"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="PartyDetailedStatsView GET")
    def get(self, request, party_id):
        party = get_object_or_404(WatchParty, id=party_id)
        user = request.user
        
        # Check if user has access (host or participant)
        if not (party.host == user or party.participants.filter(id=user.id).exists()):
            return Response(
                {'error': 'You do not have access to this party\'s analytics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        analytics, created = PartyAnalytics.objects.get_or_create(party=party)
        
        # Get viewer timeline (joins/leaves over time)
        party_events = AnalyticsEvent.objects.filter(
            party=party,
            event_type__in=['party_join', 'party_leave']
        ).order_by('timestamp')
        
        viewer_timeline = []
        current_viewers = 0
        
        for event in party_events:
            if event.event_type == 'party_join':
                current_viewers += 1
            else:
                current_viewers = max(0, current_viewers - 1)
            
            viewer_timeline.append({
                'timestamp': event.timestamp.isoformat(),
                'viewers': current_viewers,
                'event': event.event_type
            })
        
        # Get chat activity over time (messages per hour)
        chat_events = AnalyticsEvent.objects.filter(
            party=party,
            event_type='chat_message'
        ).extra({
            'hour': "date_trunc('hour', timestamp)"
        }).values('hour').annotate(
            message_count=Count('id')
        ).order_by('hour')
        
        chat_timeline = [
            {
                'hour': event['hour'].isoformat() if event['hour'] else None,
                'messages': event['message_count']
            }
            for event in chat_events
        ]
        
        # Get most active participants
        top_chatters = AnalyticsEvent.objects.filter(
            party=party,
            event_type='chat_message',
            user__isnull=False
        ).values(
            'user__id', 'user__first_name', 'user__last_name'
        ).annotate(
            message_count=Count('id')
        ).order_by('-message_count')[:10]
        
        response_data = {
            'analytics': PartyAnalyticsSerializer(analytics).data,
            'viewer_timeline': viewer_timeline,
            'chat_timeline': chat_timeline,
            'top_chatters': list(top_chatters),
            'technical_issues': {
                'buffering_events': analytics.buffering_events,
                'sync_issues': analytics.sync_issues,
                'total_problems': analytics.technical_problems
            }
        }
        
        return Response(response_data)


class VideoStatsView(generics.RetrieveAPIView):
    """Get analytics for a specific video"""
    
    serializer_class = VideoAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        video_id = self.kwargs.get('video_id')
        video = get_object_or_404(Video, id=video_id)
        
        # Check if user owns the video or if video is public
        user = self.request.user
        if video.uploader != user and video.visibility != 'public':
            raise permissions.PermissionDenied("You don't have access to this video's analytics")
        
        analytics, created = VideoAnalytics.objects.get_or_create(video=video)
        return analytics


class AdminAnalyticsView(generics.GenericAPIView):
    """System-wide analytics for admin users"""
    
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    @extend_schema(summary="AdminAnalyticsView GET")
    def get(self, request):
        # Get or create today's system analytics
        today = date.today()
        system_analytics, created = SystemAnalytics.objects.get_or_create(
            date=today,
            defaults=self._calculate_daily_metrics(today)
        )
        
        # Get trending videos (most viewed this week)
        week_ago = timezone.now() - timedelta(days=7)
        trending_videos = Video.objects.filter(
            created_at__gte=week_ago
        ).annotate(
            view_count=Count('analytics_events', filter=Q(analytics_events__event_type='view_start'))
        ).order_by('-view_count')[:10]
        
        # Get most active users (this month)
        month_ago = timezone.now() - timedelta(days=30)
        active_users = User.objects.filter(
            analytics_events__timestamp__gte=month_ago
        ).annotate(
            activity_count=Count('analytics_events')
        ).order_by('-activity_count')[:10]
        
        # Get platform growth (last 30 days)
        growth_data = []
        for i in range(30):
            day = today - timedelta(days=29-i)
            try:
                day_analytics = SystemAnalytics.objects.get(date=day)
                growth_data.append({
                    'date': day.isoformat(),
                    'new_users': day_analytics.new_users_today,
                    'active_users': day_analytics.active_users_today,
                    'parties_created': day_analytics.parties_created_today,
                    'videos_uploaded': day_analytics.videos_uploaded_today
                })
            except SystemAnalytics.DoesNotExist:
                growth_data.append({
                    'date': day.isoformat(),
                    'new_users': 0,
                    'active_users': 0,
                    'parties_created': 0,
                    'videos_uploaded': 0
                })
        
        response_data = {
            'system_analytics': SystemAnalyticsSerializer(system_analytics).data,
            'trending_videos': [
                {
                    'id': video.id,
                    'title': video.title,
                    'view_count': video.view_count,
                    'uploaded_by': video.uploader.full_name
                }
                for video in trending_videos
            ],
            'active_users': [
                {
                    'id': user.id,
                    'name': user.full_name,
                    'activity_count': user.activity_count,
                    'last_active': user.last_login.isoformat() if user.last_login else None
                }
                for user in active_users
            ],
            'growth_data': growth_data
        }
        
        return Response(response_data)
    
    def _calculate_daily_metrics(self, target_date):
        """Calculate daily metrics for system analytics"""
        day_start = timezone.datetime.combine(target_date, timezone.datetime.min.time())
        day_end = day_start + timedelta(days=1)
        
        return {
            'total_registered_users': User.objects.count(),
            'active_users_today': AnalyticsEvent.objects.filter(
                timestamp__range=[day_start, day_end]
            ).values('user').distinct().count(),
            'new_users_today': User.objects.filter(
                date_joined__range=[day_start, day_end]
            ).count(),
            'premium_users': User.objects.filter(is_premium=True).count(),
            'total_videos': Video.objects.count(),
            'videos_uploaded_today': Video.objects.filter(
                created_at__range=[day_start, day_end]
            ).count(),
            'total_parties': WatchParty.objects.count(),
            'parties_created_today': WatchParty.objects.filter(
                created_at__range=[day_start, day_end]
            ).count(),
            'total_chat_messages': AnalyticsEvent.objects.filter(
                event_type='chat_message'
            ).count(),
            'total_reactions': AnalyticsEvent.objects.filter(
                event_type='reaction_sent'
            ).count(),
        }


class ExportAnalyticsView(generics.GenericAPIView):
    """Export analytics data"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="ExportAnalyticsView POST")
    def post(self, request):
        export_type = request.data.get('type')  # 'user', 'party', 'video'
        entity_id = request.data.get('entity_id')
        date_range = request.data.get('date_range', 30)  # days
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        if export_type == 'user':
            if not entity_id:
                entity_id = request.user.id
            
            # Check permission
            if str(entity_id) != str(request.user.id) and not request.user.is_staff:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            events = AnalyticsEvent.objects.filter(
                user_id=entity_id,
                timestamp__range=[start_date, end_date]
            ).order_by('-timestamp')
            
        elif export_type == 'party':
            party = get_object_or_404(WatchParty, id=entity_id)
            
            # Check permission
            if party.host != request.user and not request.user.is_staff:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            events = AnalyticsEvent.objects.filter(
                party=party,
                timestamp__range=[start_date, end_date]
            ).order_by('-timestamp')
            
        elif export_type == 'video':
            video = get_object_or_404(Video, id=entity_id)

            # Check permission
            if video.uploader != request.user and not request.user.is_staff:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            events = AnalyticsEvent.objects.filter(
                video=video,
                timestamp__range=[start_date, end_date]
            ).order_by('-timestamp')
            
        else:
            return Response(
                {'error': 'Invalid export type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Serialize events
        serializer = AnalyticsEventSerializer(events, many=True)
        
        return Response({
            'export_type': export_type,
            'entity_id': entity_id,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': date_range
            },
            'total_events': events.count(),
            'events': serializer.data[:1000]  # Limit to prevent huge responses
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_event(request):
    """Track an analytics event"""
    event_type = request.data.get('event_type')
    party_id = request.data.get('party_id')
    video_id = request.data.get('video_id')
    event_data = request.data.get('event_data', {})
    session_id = request.data.get('session_id', '')
    duration_seconds = request.data.get('duration_seconds')
    
    if not event_type:
        return Response(
            {'error': 'event_type is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create analytics event
    event = AnalyticsEvent.objects.create(
        user=request.user,
        party_id=party_id if party_id else None,
        video_id=video_id if video_id else None,
        event_type=event_type,
        event_data=event_data,
        session_id=session_id,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        duration=timedelta(seconds=duration_seconds) if duration_seconds else None
    )
    
    # Update relevant analytics counters
    _update_analytics_counters(event)
    
    return Response({
        'event_id': event.id,
        'message': 'Event tracked successfully'
    })


def _update_analytics_counters(event):
    """Update analytics counters based on event"""
    try:
        if event.user:
            user_analytics, created = UserAnalytics.objects.get_or_create(user=event.user)
            
            if event.event_type == 'view_end' and event.duration:
                duration_minutes = int(event.duration.total_seconds() / 60)
                user_analytics.total_watch_time_minutes += duration_minutes
                user_analytics.this_week_watch_time_minutes += duration_minutes
                user_analytics.this_month_watch_time_minutes += duration_minutes
                
            elif event.event_type == 'party_join':
                user_analytics.total_parties_joined += 1
                user_analytics.this_week_parties_joined += 1
                user_analytics.this_month_parties_joined += 1
                
            elif event.event_type == 'chat_message':
                user_analytics.total_messages_sent += 1
                user_analytics.this_week_messages_sent += 1
                user_analytics.this_month_messages_sent += 1
                
            elif event.event_type == 'reaction_sent':
                user_analytics.reactions_sent += 1
                
            user_analytics.save()
        
        # Update party analytics
        if event.party:
            party_analytics, created = PartyAnalytics.objects.get_or_create(party=event.party)
            
            if event.event_type == 'party_join':
                party_analytics.total_joins += 1
            elif event.event_type == 'party_leave':
                party_analytics.total_leaves += 1
            elif event.event_type == 'chat_message':
                party_analytics.total_chat_messages += 1
            elif event.event_type == 'reaction_sent':
                party_analytics.total_reactions += 1
            elif event.event_type == 'buffering':
                party_analytics.buffering_events += 1
            elif event.event_type == 'sync_issue':
                party_analytics.sync_issues += 1
                
            party_analytics.save()
        
        # Update video analytics
        if event.video:
            video_analytics, created = VideoAnalytics.objects.get_or_create(video=event.video)
            
            if event.event_type == 'view_start':
                video_analytics.total_views += 1
                video_analytics.this_week_views += 1
                video_analytics.this_month_views += 1
            elif event.event_type == 'view_end' and event.duration:
                duration_minutes = int(event.duration.total_seconds() / 60)
                video_analytics.total_watch_time_minutes += duration_minutes
            elif event.event_type == 'reaction_sent':
                video_analytics.total_reactions += 1
                
            video_analytics.save()
            
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating analytics counters: {str(e)}")


# Missing Analytics Endpoints for TODO.md Requirements

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def system_performance_analytics(request):
    """Get system performance metrics"""
    
    try:
        # Get date range
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Server performance metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__gte=start_date).count()
        total_parties = WatchParty.objects.count()
        active_parties = WatchParty.objects.filter(created_at__gte=start_date).count()
        total_videos = Video.objects.count()
        
        # System analytics
        system_analytics = SystemAnalytics.objects.filter(
            date__gte=start_date.date()
        ).aggregate(
            avg_response_time=Avg('avg_response_time'),
            total_requests=Sum('total_requests'),
            total_errors=Sum('error_count'),
            avg_cpu_usage=Avg('cpu_usage'),
            avg_memory_usage=Avg('memory_usage')
        )
        
        # Calculate uptime (simplified)
        uptime_percentage = 99.5  # Placeholder - would be calculated from actual uptime data
        
        return Response({
            'system_metrics': {
                'total_users': total_users,
                'active_users': active_users,
                'total_parties': total_parties,
                'active_parties': active_parties,
                'total_videos': total_videos,
                'uptime_percentage': uptime_percentage
            },
            'performance_metrics': {
                'avg_response_time_ms': system_analytics['avg_response_time'] or 0,
                'total_requests': system_analytics['total_requests'] or 0,
                'error_rate': (system_analytics['total_errors'] or 0) / max(system_analytics['total_requests'] or 1, 1) * 100,
                'avg_cpu_usage': system_analytics['avg_cpu_usage'] or 0,
                'avg_memory_usage': system_analytics['avg_memory_usage'] or 0
            },
            'period': f'last_{days}_days'
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get performance analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def revenue_analytics(request):
    """Get revenue and subscription analytics"""
    
    try:
        from apps.billing.models import Subscription, Payment
        
        # Get date range
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Revenue metrics
        total_revenue = Payment.objects.filter(
            status='completed',
            created_at__gte=start_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Subscription metrics
        total_subscriptions = Subscription.objects.filter(is_active=True).count()
        new_subscriptions = Subscription.objects.filter(
            created_at__gte=start_date
        ).count()
        
        cancelled_subscriptions = Subscription.objects.filter(
            is_active=False,
            cancelled_at__gte=start_date
        ).count() if hasattr(Subscription, 'cancelled_at') else 0
        
        # Calculate churn rate
        churn_rate = (cancelled_subscriptions / max(total_subscriptions, 1)) * 100
        
        # Monthly recurring revenue (MRR)
        monthly_subscriptions = Subscription.objects.filter(
            is_active=True,
            plan_type='monthly'  # Assuming you have plan types
        ).count() if hasattr(Subscription, 'plan_type') else 0
        
        yearly_subscriptions = Subscription.objects.filter(
            is_active=True,
            plan_type='yearly'
        ).count() if hasattr(Subscription, 'plan_type') else 0
        
        # Simplified MRR calculation
        mrr = (monthly_subscriptions * 9.99) + (yearly_subscriptions * 99.99 / 12)  # Example pricing
        
        return Response({
            'revenue_metrics': {
                'total_revenue': float(total_revenue),
                'mrr': float(mrr),
                'period': f'last_{days}_days'
            },
            'subscription_metrics': {
                'total_active_subscriptions': total_subscriptions,
                'new_subscriptions': new_subscriptions,
                'cancelled_subscriptions': cancelled_subscriptions,
                'churn_rate': round(churn_rate, 2)
            },
            'subscription_breakdown': {
                'monthly_subscriptions': monthly_subscriptions,
                'yearly_subscriptions': yearly_subscriptions
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get revenue analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def user_retention_analytics(request):
    """Get user retention and churn analysis"""
    
    try:
        # Get date range
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Calculate retention cohorts
        total_users = User.objects.count()
        
        # Users registered in different periods
        week_1_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        month_1_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        month_3_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=90)
        ).count()
        
        # Active users in different periods
        active_week_1 = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        active_month_1 = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        active_month_3 = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=90)
        ).count()
        
        # Calculate retention rates
        retention_rates = {
            'week_1_retention': (active_week_1 / max(week_1_users, 1)) * 100,
            'month_1_retention': (active_month_1 / max(month_1_users, 1)) * 100,
            'month_3_retention': (active_month_3 / max(month_3_users, 1)) * 100
        }
        
        # User engagement levels
        high_engagement = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=1)
        ).count()
        
        medium_engagement = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=7),
            last_login__lt=timezone.now() - timedelta(days=1)
        ).count()
        
        low_engagement = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=30),
            last_login__lt=timezone.now() - timedelta(days=7)
        ).count()
        
        return Response({
            'retention_rates': retention_rates,
            'engagement_levels': {
                'high_engagement': high_engagement,
                'medium_engagement': medium_engagement,
                'low_engagement': low_engagement,
                'total_active': high_engagement + medium_engagement + low_engagement
            },
            'user_counts': {
                'total_users': total_users,
                'week_1_users': week_1_users,
                'month_1_users': month_1_users,
                'month_3_users': month_3_users
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get retention analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def content_analytics(request):
    """Get content performance analytics"""
    
    try:
        # Get date range
        days = int(request.GET.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Video analytics
        total_videos = Video.objects.count()
        videos_this_period = Video.objects.filter(created_at__gte=start_date).count()
        
        # Top performing videos
        top_videos = Video.objects.annotate(
            view_count=Count('videoview')
        ).order_by('-view_count')[:10]
        
        top_videos_data = []
        for video in top_videos:
            top_videos_data.append({
                'id': str(video.id),
                'title': video.title,
                'view_count': video.view_count,
                'uploader': video.uploader.get_full_name() if hasattr(video, 'uploader') else 'Unknown'
            })
        
        # Party analytics
        total_parties = WatchParty.objects.count()
        parties_this_period = WatchParty.objects.filter(created_at__gte=start_date).count()
        
        # Average party duration and participants
        avg_party_stats = WatchParty.objects.aggregate(
            avg_participants=Avg('participants__count') if hasattr(WatchParty, 'participants') else 0
        )
        
        # Content categories (if available)
        video_categories = {}
        if hasattr(Video, 'category'):
            categories = Video.objects.values('category').annotate(
                count=Count('id')
            ).order_by('-count')[:10]
            
            for cat in categories:
                video_categories[cat['category']] = cat['count']
        
        return Response({
            'video_analytics': {
                'total_videos': total_videos,
                'videos_this_period': videos_this_period,
                'top_videos': top_videos_data,
                'categories': video_categories
            },
            'party_analytics': {
                'total_parties': total_parties,
                'parties_this_period': parties_this_period,
                'avg_participants': avg_party_stats['avg_participants'] or 0
            },
            'period': f'last_{days}_days'
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get content analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
