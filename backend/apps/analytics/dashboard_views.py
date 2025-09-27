"""
Analytics dashboard API views for Watch Party Backend
"""

from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from django.db.models.functions import TruncDate, TruncMonth
from datetime import timedelta
from decimal import Decimal
from typing import Dict, List, Any

from apps.analytics.models import (
    UserAnalytics, PartyAnalytics, VideoAnalytics, 
    AnalyticsEvent, SystemAnalytics, UserSession, WatchTime
)
from apps.parties.models import WatchParty
from apps.videos.models import Video
try:  # Billing is optional in the lightweight test settings
    from apps.billing.models import Subscription, Payment
except Exception:  # pragma: no cover - gracefully handle missing billing app
    Subscription = None
    Payment = None
from shared.permissions import IsAdminUser

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for authenticated user"""
    user = request.user
    
    # Get date range from query params
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # User stats
    user_analytics, _ = UserAnalytics.objects.get_or_create(user=user)
    
    # Recent activity
    recent_parties = WatchParty.objects.filter(
        host=user,
        created_at__gte=start_date
    ).count()
    
    recent_watch_time = (
        WatchTime.objects.filter(
            user=user,
            created_at__gte=start_date
        ).aggregate(total=Sum('total_watch_time'))['total']
        or 0
    )
    
    # Friend activity (optional when the friendships app is disabled)
    friend_parties = 0
    try:
        friends_qs = user.friends
    except Exception:  # pragma: no cover - friendships app may be absent in tests
        friends_qs = None

    if friends_qs is not None:
        friend_parties = WatchParty.objects.filter(
            participants__in=friends_qs,
            created_at__gte=start_date
        ).count()
    
    stats = {
        'user_stats': {
            'total_parties_hosted': user_analytics.total_parties_hosted,
            'total_parties_joined': user_analytics.total_parties_joined,
            'total_watch_time': user_analytics.total_watch_time_minutes,
            'total_videos_uploaded': user_analytics.videos_uploaded,
            'recent_parties_hosted': recent_parties,
            'recent_watch_time': recent_watch_time,
            'friend_activity': friend_parties
        },
        'recent_activity': _get_recent_activity(user, start_date),
        'favorite_genres': _get_favorite_genres(user),
        'watch_time_by_day': _get_watch_time_by_day(user, start_date)
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_analytics(request):
    """Get detailed user analytics"""
    user = request.user
    
    # Get time period
    period = request.GET.get('period', 'month')  # week, month, year
    
    if period == 'week':
        start_date = timezone.now() - timedelta(weeks=1)
        trunc_func = TruncDate
    elif period == 'month':
        start_date = timezone.now() - timedelta(days=30)
        trunc_func = TruncDate
    elif period == 'year':
        start_date = timezone.now() - timedelta(days=365)
        trunc_func = TruncMonth
    else:
        start_date = timezone.now() - timedelta(days=30)
        trunc_func = TruncDate
    
    # Watch time trends
    watch_time_trend = WatchTime.objects.filter(
        user=user,
        created_at__gte=start_date
    ).annotate(
        period=trunc_func('created_at')
    ).values('period').annotate(
        total_duration=Sum('total_watch_time'),
        session_count=Count('id')
    ).order_by('period')
    
    # Party activity
    party_trend = WatchParty.objects.filter(
        Q(host=user) | Q(participants=user),
        created_at__gte=start_date
    ).annotate(
        period=trunc_func('created_at')
    ).values('period').annotate(
        parties_hosted=Count('id', filter=Q(host=user)),
        parties_joined=Count('id', filter=Q(participants=user))
    ).order_by('period')
    
    # Device usage
    device_usage = UserSession.objects.filter(
        user=user,
        start_time__gte=start_date
    ).values('device_type').annotate(
        session_count=Count('id'),
        total_duration=Sum('duration')
    ).order_by('-session_count')
    
    analytics = {
        'watch_time_trend': list(watch_time_trend),
        'party_trend': list(party_trend),
        'device_usage': list(device_usage),
        'summary': {
            'total_watch_time': WatchTime.objects.filter(
                user=user, created_at__gte=start_date
            ).aggregate(Sum('total_watch_time'))['total_watch_time__sum'] or 0,
            'total_parties': WatchParty.objects.filter(
                Q(host=user) | Q(participants=user),
                created_at__gte=start_date
            ).count(),
            'total_sessions': UserSession.objects.filter(
                user=user, start_time__gte=start_date
            ).count()
        }
    }
    
    return Response(analytics)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_analytics(request, video_id):
    """Get analytics for a specific video"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check if user has permission to view analytics
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get analytics data
    analytics, _ = VideoAnalytics.objects.get_or_create(video=video)
    
    # Get view trends (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    view_trend = WatchTime.objects.filter(
        video=video,
        created_at__gte=thirty_days_ago
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        views=Count('user', distinct=True),
        watch_time=Sum('total_watch_time')
    ).order_by('date')
    
    # Geographic data (if available)
    geographic_data = WatchTime.objects.filter(
        video=video,
        created_at__gte=thirty_days_ago
    ).exclude(
        user__profile__country__isnull=True
    ).values(
        'user__profile__country'
    ).annotate(
        views=Count('user', distinct=True)
    ).order_by('-views')[:10]
    
    data = {
        'video_info': {
            'id': str(video.id),
            'title': video.title,
            'uploaded_at': video.created_at,
            'file_size': video.file_size,
            'duration': video.duration
        },
        'analytics': {
            'total_views': analytics.view_count,
            'total_watch_time': analytics.total_watch_time,
            'unique_viewers': analytics.unique_viewers,
            'average_watch_time': analytics.average_watch_time,
            'engagement_rate': analytics.engagement_rate
        },
        'trends': {
            'view_trend': list(view_trend),
            'geographic_data': list(geographic_data)
        }
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def party_analytics(request, party_id):
    """Get analytics for a specific party"""
    party = get_object_or_404(WatchParty, id=party_id)
    
    # Check if user has permission to view analytics
    if party.host != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get analytics data
    analytics, _ = PartyAnalytics.objects.get_or_create(party=party)
    
    # Participant engagement
    participant_stats = WatchTime.objects.filter(
        party=party
    ).values('user').annotate(
        total_watch_time=Sum('total_watch_time'),
        session_count=Count('id')
    ).order_by('-total_watch_time')
    
    # Add user info to participant stats
    user_ids = [stat['user'] for stat in participant_stats]
    users = User.objects.filter(id__in=user_ids).values('id', 'username', 'first_name', 'last_name')
    user_dict = {user['id']: user for user in users}
    
    for stat in participant_stats:
        user_info = user_dict.get(stat['user'], {})
        stat['user_info'] = {
            'username': user_info.get('username', ''),
            'full_name': f"{user_info.get('first_name', '')} {user_info.get('last_name', '')}".strip()
        }
    
    # Activity timeline
    activity_timeline = AnalyticsEvent.objects.filter(
        party=party
    ).values('event_type', 'timestamp', 'user__username').order_by('timestamp')
    
    data = {
        'party_info': {
            'id': str(party.id),
            'title': party.title,
            'created_at': party.created_at,
            'scheduled_start': party.scheduled_start,
            'status': party.status
        },
        'analytics': {
            'total_participants': analytics.participant_count,
            'total_watch_time': analytics.total_watch_time,
            'average_session_duration': analytics.average_session_duration,
            'peak_concurrent_users': analytics.peak_concurrent_users,
            'engagement_score': analytics.engagement_score
        },
        'participant_stats': list(participant_stats),
        'activity_timeline': list(activity_timeline)
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def system_analytics(request):
    """Get system-wide analytics (admin only)"""
    
    # Get date range
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # User metrics
    total_users = User.objects.count()
    new_users = User.objects.filter(date_joined__gte=start_date).count()
    active_users = UserSession.objects.filter(
        start_time__gte=start_date
    ).values('user').distinct().count()
    
    # Content metrics
    total_videos = Video.objects.count()
    new_videos = Video.objects.filter(created_at__gte=start_date).count()
    total_parties = WatchParty.objects.count()
    new_parties = WatchParty.objects.filter(created_at__gte=start_date).count()
    
    # Engagement metrics
    total_watch_time = WatchTime.objects.filter(
        created_at__gte=start_date
    ).aggregate(Sum('total_watch_time'))['total_watch_time__sum'] or 0
    
    avg_session_duration = UserSession.objects.filter(
        start_time__gte=start_date,
        duration__isnull=False
    ).aggregate(Avg('duration'))['duration__avg'] or 0
    
    # Revenue metrics (if billing is enabled)
    revenue_data = {}
    if Payment is not None and Subscription is not None and hasattr(request.user, 'subscription'):
        total_revenue = Payment.objects.filter(
            created_at__gte=start_date,
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

        active_subscriptions = Subscription.objects.filter(
            status='active'
        ).count()
        
        revenue_data = {
            'total_revenue': float(total_revenue),
            'active_subscriptions': active_subscriptions
        }
    
    # Performance metrics
    system_analytics, _ = SystemAnalytics.objects.get_or_create(
        date=timezone.now().date()
    )
    
    # User growth trend
    user_growth = User.objects.filter(
        date_joined__gte=start_date
    ).annotate(
        date=TruncDate('date_joined')
    ).values('date').annotate(
        new_users=Count('id')
    ).order_by('date')
    
    # Popular content
    popular_videos = Video.objects.annotate(
        view_count=Count('watch_times')
    ).order_by('-view_count')[:10].values(
        'id', 'title', 'view_count', 'uploader__username'
    )
    
    data = {
        'user_metrics': {
            'total_users': total_users,
            'new_users': new_users,
            'active_users': active_users,
            'user_growth': list(user_growth)
        },
        'content_metrics': {
            'total_videos': total_videos,
            'new_videos': new_videos,
            'total_parties': total_parties,
            'new_parties': new_parties,
            'popular_videos': list(popular_videos)
        },
        'engagement_metrics': {
            'total_watch_time': total_watch_time,
            'average_session_duration': avg_session_duration
        },
        'system_metrics': {
            'cpu_usage': system_analytics.cpu_usage,
            'memory_usage': system_analytics.memory_usage,
            'disk_usage': system_analytics.disk_usage,
            'active_connections': system_analytics.active_connections
        }
    }
    
    if revenue_data:
        data['revenue_metrics'] = revenue_data
    
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_event(request):
    """Track an analytics event"""
    
    event_type = request.data.get('event_type')
    if not event_type:
        return Response(
            {'error': 'event_type is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create analytics event
    event = AnalyticsEvent.objects.create(
        user=request.user,
        event_type=event_type,
        event_data=request.data.get('data', {}),
        session_id=request.data.get('session_id', ''),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        ip_address=request.META.get('REMOTE_ADDR', ''),
        party_id=request.data.get('party_id'),
        video_id=request.data.get('video_id')
    )
    
    return Response({'event_id': str(event.id)}, status=status.HTTP_201_CREATED)


def _get_recent_activity(user: User, start_date) -> List[Dict[str, Any]]:
    """Get recent user activity"""
    events = AnalyticsEvent.objects.filter(
        user=user,
        timestamp__gte=start_date
    ).order_by('-timestamp')[:20]
    
    return [
        {
            'event_type': event.event_type,
            'timestamp': event.timestamp,
            'data': event.event_data
        }
        for event in events
    ]


def _get_favorite_genres(user: User) -> List[Dict[str, Any]]:
    """Get user's favorite video genres"""
    # This would require genre tracking in videos
    # For now, return empty list
    return []


def _get_watch_time_by_day(user: User, start_date) -> List[Dict[str, Any]]:
    """Get watch time grouped by day"""
    watch_time_by_day = WatchTime.objects.filter(
        user=user,
        created_at__gte=start_date
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        total_duration=Sum('total_watch_time')
    ).order_by('date')
    
    return [
        {
            'date': item['date'].isoformat(),
            'duration': item['total_duration']
        }
        for item in watch_time_by_day
    ]
