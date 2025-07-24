"""
Admin panel views for Watch Party Backend
"""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from django.db import transaction
from datetime import timedelta
from typing import Dict, List, Any

from core.permissions import IsAdminUser, IsSuperUser
from apps.parties.models import WatchParty
from apps.videos.models import Video
from apps.analytics.models import SystemAnalytics, AnalyticsEvent
from apps.notifications.models import Notification
from apps.billing.models import Subscription, Payment

User = get_user_model()


class AdminDashboardView(generics.GenericAPIView):
    """Main admin dashboard view"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        return admin_dashboard(request)


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Get admin dashboard statistics"""
    
    # Get date range
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # User statistics
    total_users = User.objects.count()
    new_users_today = User.objects.filter(
        date_joined__date=timezone.now().date()
    ).count()
    active_users = User.objects.filter(
        last_login__gte=start_date
    ).count()
    suspended_users = User.objects.filter(
        is_active=False
    ).count()
    
    # Content statistics
    total_videos = Video.objects.count()
    new_videos_today = Video.objects.filter(
        created_at__date=timezone.now().date()
    ).count()
    pending_videos = Video.objects.filter(
        status='processing'
    ).count()
    
    total_parties = WatchParty.objects.count()
    active_parties = WatchParty.objects.filter(
        status='active'
    ).count()
    
    # System health
    try:
        system_stats = SystemAnalytics.objects.filter(
            date=timezone.now().date()
        ).first()
        
        system_health = {
            'cpu_usage': system_stats.cpu_usage if system_stats else 0,
            'memory_usage': system_stats.memory_usage if system_stats else 0,
            'disk_usage': system_stats.disk_usage if system_stats else 0,
            'active_connections': system_stats.active_connections if system_stats else 0
        }
    except:
        system_health = {
            'cpu_usage': 0,
            'memory_usage': 0,
            'disk_usage': 0,
            'active_connections': 0
        }
    
    # Recent activity
    recent_events = AnalyticsEvent.objects.filter(
        timestamp__gte=timezone.now() - timedelta(hours=24)
    ).values('event_type').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Revenue data (if applicable)
    revenue_data = {}
    try:
        total_revenue = Payment.objects.filter(
            status='completed',
            created_at__gte=start_date
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        active_subscriptions = Subscription.objects.filter(
            status='active'
        ).count()
        
        revenue_data = {
            'total_revenue': float(total_revenue),
            'active_subscriptions': active_subscriptions
        }
    except:
        pass
    
    dashboard_data = {
        'user_stats': {
            'total_users': total_users,
            'new_users_today': new_users_today,
            'active_users': active_users,
            'suspended_users': suspended_users
        },
        'content_stats': {
            'total_videos': total_videos,
            'new_videos_today': new_videos_today,
            'pending_videos': pending_videos,
            'total_parties': total_parties,
            'active_parties': active_parties
        },
        'system_health': system_health,
        'recent_activity': list(recent_events)
    }
    
    if revenue_data:
        dashboard_data['revenue_stats'] = revenue_data
    
    return Response(dashboard_data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Get paginated list of users for admin management"""
    
    # Get query parameters
    search = request.GET.get('search', '')
    status_filter = request.GET.get('status', 'all')  # all, active, suspended
    order_by = request.GET.get('order_by', '-date_joined')
    
    # Build queryset
    queryset = User.objects.select_related('profile')
    
    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Apply status filter
    if status_filter == 'active':
        queryset = queryset.filter(is_active=True)
    elif status_filter == 'suspended':
        queryset = queryset.filter(is_active=False)
    
    # Apply ordering
    queryset = queryset.order_by(order_by)
    
    # Paginate
    paginator = AdminPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    # Serialize data
    users_data = []
    for user in page:
        user_data = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'profile': {
                'avatar': getattr(user.profile, 'avatar', None),
                'country': getattr(user.profile, 'country', None),
                'is_verified': getattr(user.profile, 'is_verified', False)
            } if hasattr(user, 'profile') else None
        }
        users_data.append(user_data)
    
    return paginator.get_paginated_response(users_data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_suspend_user(request, user_id):
    """Suspend a user account"""
    
    user = get_object_or_404(User, id=user_id)
    
    if user.is_staff or user.is_superuser:
        return Response(
            {'error': 'Cannot suspend staff or superuser accounts'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.is_active = False
    user.save()
    
    # Log the action
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_user_suspended',
        data={'suspended_user_id': str(user.id)},
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    return Response({'message': f'User {user.username} has been suspended'})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_unsuspend_user(request, user_id):
    """Unsuspend a user account"""
    
    user = get_object_or_404(User, id=user_id)
    
    user.is_active = True
    user.save()
    
    # Log the action
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_user_unsuspended',
        data={'unsuspended_user_id': str(user.id)},
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    return Response({'message': f'User {user.username} has been unsuspended'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_parties_list(request):
    """Get paginated list of parties for admin management"""
    
    # Get query parameters
    search = request.GET.get('search', '')
    status_filter = request.GET.get('status', 'all')
    order_by = request.GET.get('order_by', '-created_at')
    
    # Build queryset
    queryset = WatchParty.objects.select_related('host')
    
    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(host__username__icontains=search)
        )
    
    # Apply status filter
    if status_filter != 'all':
        queryset = queryset.filter(status=status_filter)
    
    # Apply ordering
    queryset = queryset.order_by(order_by)
    
    # Paginate
    paginator = AdminPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    # Serialize data
    parties_data = []
    for party in page:
        party_data = {
            'id': str(party.id),
            'title': party.title,
            'host': {
                'id': str(party.host.id),
                'username': party.host.username,
                'full_name': party.host.get_full_name()
            },
            'status': party.status,
            'created_at': party.created_at,
            'scheduled_start': party.scheduled_start,
            'participant_count': party.participants.count(),
            'max_participants': party.max_participants,
            'visibility': party.visibility
        }
        parties_data.append(party_data)
    
    return paginator.get_paginated_response(parties_data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_party(request, party_id):
    """Delete a party (admin only)"""
    
    party = get_object_or_404(WatchParty, id=party_id)
    
    # Log the action before deletion
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_party_deleted',
        data={
            'party_id': str(party.id),
            'party_title': party.title,
            'host_id': str(party.host.id)
        },
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    party.delete()
    
    return Response({'message': 'Party has been deleted'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_content_reports(request):
    """Get content reports for moderation"""
    
    # This would require a ContentReport model
    # For now, return a placeholder
    return Response({
        'reports': [],
        'message': 'Content reporting system not yet implemented'
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_resolve_report(request, report_id):
    """Resolve a content report"""
    
    # This would require a ContentReport model
    # For now, return a placeholder
    return Response({
        'message': 'Content reporting system not yet implemented'
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_logs(request):
    """Get system logs"""
    
    # Get query parameters
    level = request.GET.get('level', 'all')  # info, warning, error, all
    hours = int(request.GET.get('hours', 24))
    
    start_time = timezone.now() - timedelta(hours=hours)
    
    # Get analytics events as logs
    queryset = AnalyticsEvent.objects.filter(
        timestamp__gte=start_time
    ).order_by('-timestamp')
    
    # Filter by event type (simulating log levels)
    if level == 'error':
        queryset = queryset.filter(event_type__contains='error')
    elif level == 'warning':
        queryset = queryset.filter(event_type__contains='warning')
    elif level == 'info':
        queryset = queryset.exclude(
            Q(event_type__contains='error') | Q(event_type__contains='warning')
        )
    
    # Paginate
    paginator = AdminPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    # Serialize data
    logs_data = []
    for event in page:
        log_data = {
            'id': str(event.id),
            'timestamp': event.timestamp,
            'level': _get_log_level(event.event_type),
            'event_type': event.event_type,
            'user': event.user.username if event.user else 'System',
            'ip_address': event.ip_address,
            'data': event.data
        }
        logs_data.append(log_data)
    
    return paginator.get_paginated_response(logs_data)


@api_view(['POST'])
@permission_classes([IsSuperUser])
def admin_broadcast_message(request):
    """Send a broadcast message to all users"""
    
    message_title = request.data.get('title')
    message_content = request.data.get('content')
    target_audience = request.data.get('audience', 'all')  # all, active, premium
    
    if not message_title or not message_content:
        return Response(
            {'error': 'Title and content are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get target users
    if target_audience == 'active':
        target_users = User.objects.filter(
            is_active=True,
            last_login__gte=timezone.now() - timedelta(days=30)
        )
    elif target_audience == 'premium':
        # Get users with active subscriptions
        target_users = User.objects.filter(
            subscription__status='active'
        )
    else:
        target_users = User.objects.filter(is_active=True)
    
    # Create notifications for all target users
    notifications_created = 0
    batch_size = 100
    
    for i in range(0, target_users.count(), batch_size):
        batch_users = target_users[i:i + batch_size]
        notifications = [
            Notification(
                user=user,
                notification_type='system_broadcast',
                title=message_title,
                content=message_content,
                metadata={
                    'broadcast_id': request.data.get('broadcast_id', str(timezone.now().timestamp())),
                    'admin_user': request.user.username
                }
            )
            for user in batch_users
        ]
        
        Notification.objects.bulk_create(notifications)
        notifications_created += len(notifications)
    
    # Log the broadcast
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_broadcast_sent',
        data={
            'title': message_title,
            'audience': target_audience,
            'recipients_count': notifications_created
        },
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    return Response({
        'message': f'Broadcast sent to {notifications_created} users',
        'recipients_count': notifications_created
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_video_management(request):
    """Get videos for admin management"""
    
    # Get query parameters
    search = request.GET.get('search', '')
    status_filter = request.GET.get('status', 'all')
    order_by = request.GET.get('order_by', '-created_at')
    
    # Build queryset
    queryset = Video.objects.select_related('uploaded_by')
    
    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(uploaded_by__username__icontains=search)
        )
    
    # Apply status filter
    if status_filter != 'all':
        queryset = queryset.filter(status=status_filter)
    
    # Apply ordering
    queryset = queryset.order_by(order_by)
    
    # Paginate
    paginator = AdminPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    # Serialize data
    videos_data = []
    for video in page:
        video_data = {
            'id': str(video.id),
            'title': video.title,
            'uploaded_by': {
                'id': str(video.uploaded_by.id),
                'username': video.uploaded_by.username,
                'full_name': video.uploaded_by.get_full_name()
            },
            'status': video.status,
            'created_at': video.created_at,
            'file_size': video.file_size,
            'duration': video.duration,
            'visibility': video.visibility,
            'view_count': getattr(video, 'view_count', 0)
        }
        videos_data.append(video_data)
    
    return paginator.get_paginated_response(videos_data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_video(request, video_id):
    """Delete a video (admin only)"""
    
    video = get_object_or_404(Video, id=video_id)
    
    # Log the action before deletion
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_video_deleted',
        data={
            'video_id': str(video.id),
            'video_title': video.title,
            'uploaded_by_id': str(video.uploaded_by.id)
        },
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    video.delete()
    
    return Response({'message': 'Video has been deleted'})


def _get_log_level(event_type: str) -> str:
    """Determine log level from event type"""
    if 'error' in event_type.lower():
        return 'error'
    elif 'warning' in event_type.lower() or 'fail' in event_type.lower():
        return 'warning'
    else:
        return 'info'
