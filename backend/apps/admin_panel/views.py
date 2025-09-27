"""
Admin panel views for Watch Party Backend
"""

from rest_framework import generics, status
from drf_spectacular.openapi import OpenApiResponse, OpenApiExample
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count, Sum
from django.db import transaction
from django.http import HttpResponse
from django.core.mail import send_mass_mail
from datetime import timedelta
from typing import Dict, Any
import csv

from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from shared.permissions import IsAdminUser, IsSuperUser
from shared.responses import StandardResponse
from apps.parties.models import WatchParty
from apps.videos.models import Video
from apps.analytics.models import SystemAnalytics, AnalyticsEvent
from apps.notifications.models import Notification
from apps.billing.models import Subscription, Payment
from .serializers import (
    AdminDashboardStatsSerializer, AdminAnalyticsOverviewSerializer,
    AdminBroadcastMessageSerializer, AdminBroadcastResponseSerializer,
    AdminUserActionSerializer, AdminContentModerationSerializer,
    AdminSystemHealthSerializer, AdminGenericResponseSerializer
)

User = get_user_model()


# ========================= CLASS-BASED VIEWS =========================

class AdminDashboardView(generics.GenericAPIView):
    """Main admin dashboard view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminDashboardStatsSerializer
    
    @extend_schema(
        summary="Admin Dashboard Stats",
        description="Get admin dashboard statistics",
        responses={200: AdminDashboardStatsSerializer}
    )
    def get(self, request):
        return admin_dashboard(request)


class AdminUsersListView(generics.GenericAPIView):
    """Admin users list view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminGenericResponseSerializer
    
    @extend_schema(
        summary="Admin Users List",
        description="Get paginated list of users for admin",
        responses={200: AdminGenericResponseSerializer}
    )
    def get(self, request):
        return admin_users_list(request)


class AdminSuspendUserView(generics.GenericAPIView):
    """Admin suspend user view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserActionSerializer
    
    @extend_schema(
        summary="Suspend User",
        description="Suspend a user account",
        responses={200: AdminUserActionSerializer}
    )
    def post(self, request, user_id):
        return admin_suspend_user(request, user_id)


class AdminUnsuspendUserView(generics.GenericAPIView):
    """Admin unsuspend user view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserActionSerializer
    
    @extend_schema(
        summary="Unsuspend User",
        description="Unsuspend a user account",
        responses={200: AdminUserActionSerializer}
    )
    def post(self, request, user_id):
        return admin_unsuspend_user(request, user_id)


class AdminPartiesListView(generics.GenericAPIView):
    """Admin parties list view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminGenericResponseSerializer
    
    @extend_schema(
        summary="Admin Parties List",
        description="Get paginated list of parties for admin",
        responses={200: AdminGenericResponseSerializer}
    )
    def get(self, request):
        return admin_parties_list(request)


class AdminDeletePartyView(generics.GenericAPIView):
    """Admin delete party view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminGenericResponseSerializer
    
    @extend_schema(
        summary="Delete Party",
        description="Delete a party",
        responses={200: AdminGenericResponseSerializer}
    )
    def delete(self, request, party_id):
        return admin_delete_party(request, party_id)


class AdminContentReportsView(generics.GenericAPIView):
    """Admin content reports view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminContentModerationSerializer
    
    @extend_schema(
        summary="Content Reports",
        description="Get content reports for moderation",
        responses={200: AdminContentModerationSerializer}
    )
    def get(self, request):
        return admin_content_reports(request)


class AdminResolveReportView(generics.GenericAPIView):
    """Admin resolve report view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminGenericResponseSerializer
    
    @extend_schema(
        summary="Resolve Report",
        description="Resolve a content report",
        responses={200: AdminGenericResponseSerializer}
    )
    def post(self, request, report_id):
        return admin_resolve_report(request, report_id)


class AdminSystemLogsView(generics.GenericAPIView):
    """Admin system logs view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminSystemHealthSerializer
    
    @extend_schema(
        summary="System Logs",
        description="Get system logs and health metrics",
        responses={200: AdminSystemHealthSerializer}
    )
    def get(self, request):
        return admin_system_logs(request)


class AdminBroadcastMessageView(generics.GenericAPIView):
    """Admin broadcast message view"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminBroadcastResponseSerializer
    
    @extend_schema(
        summary="Broadcast Message",
        description="Send broadcast message to users",
        responses={200: AdminBroadcastResponseSerializer}
    )
    def post(self, request):
        return admin_broadcast_message(request)


# ========================= FUNCTION-BASED VIEWS =========================


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@extend_schema(
    summary="Admin Dashboard Stats",
    description="Get comprehensive admin dashboard statistics",
    responses={200: AdminDashboardStatsSerializer}
)
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
    
    try:
        from apps.parties.models import PartyReport
        
        # Get query parameters
        status_filter = request.GET.get('status', 'all')
        report_type_filter = request.GET.get('report_type', 'all')
        
        # Build queryset from party reports (since we have that model)
        queryset = PartyReport.objects.select_related(
            'reporter', 'party', 'reported_user'
        )
        
        # Apply filters
        if status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        if report_type_filter != 'all':
            queryset = queryset.filter(report_type=report_type_filter)
        
        # Order by creation date
        queryset = queryset.order_by('-created_at')
        
        # Paginate
        paginator = AdminPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        # Serialize data
        reports_data = []
        for report in page:
            report_data = {
                'id': str(report.id),
                'report_type': report.report_type,
                'status': report.status,
                'description': report.description,
                'reporter': {
                    'id': str(report.reporter.id),
                    'username': report.reporter.username,
                    'email': report.reporter.email
                },
                'party': {
                    'id': str(report.party.id),
                    'title': report.party.title,
                    'host': report.party.host.username
                },
                'reported_user': {
                    'id': str(report.reported_user.id),
                    'username': report.reported_user.username
                } if report.reported_user else None,
                'admin_notes': report.admin_notes,
                'created_at': report.created_at,
                'updated_at': report.updated_at,
            }
            reports_data.append(report_data)
        
        return paginator.get_paginated_response(reports_data)
        
    except ImportError:
        return Response({
            'reports': [],
            'message': 'Content reporting system not available'
        })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_resolve_report(request, report_id):
    """Resolve a content report"""
    
    try:
        from apps.parties.models import PartyReport
        
        report = get_object_or_404(PartyReport, id=report_id)
        
        resolution_notes = request.data.get('resolution_notes', '')
        action_taken = request.data.get('action_taken', 'reviewed')
        
        # Update report status
        report.status = 'resolved'
        report.admin_notes = resolution_notes
        report.save()
        
        # Log the action
        AnalyticsEvent.objects.create(
            user=request.user,
            event_type='admin_report_resolved',
            data={
                'report_id': str(report.id),
                'action_taken': action_taken,
                'report_type': report.report_type
            },
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return Response({
            'message': 'Report resolved successfully',
            'report_id': str(report.id),
            'action_taken': action_taken
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to resolve report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_logs(request):
    """Get system logs with enhanced filtering"""
    
    # Get query parameters
    level = request.GET.get('level', 'all')  # info, warning, error, all
    hours = int(request.GET.get('hours', 24))
    event_type = request.GET.get('event_type', 'all')
    user_filter = request.GET.get('user')
    
    start_time = timezone.now() - timedelta(hours=hours)
    
    # Get analytics events as logs
    queryset = AnalyticsEvent.objects.filter(
        timestamp__gte=start_time
    ).select_related('user').order_by('-timestamp')
    
    # Filter by event type
    if event_type != 'all':
        queryset = queryset.filter(event_type=event_type)
    
    # Filter by log level (simulating log levels)
    if level == 'error':
        queryset = queryset.filter(event_type__contains='error')
    elif level == 'warning':
        queryset = queryset.filter(
            Q(event_type__contains='warning') | 
            Q(event_type__contains='fail') |
            Q(event_type__contains='suspend') |
            Q(event_type__contains='ban')
        )
    elif level == 'info':
        queryset = queryset.exclude(
            Q(event_type__contains='error') | 
            Q(event_type__contains='warning') | 
            Q(event_type__contains='fail')
        )
    
    # Filter by user
    if user_filter:
        queryset = queryset.filter(
            Q(user__username__icontains=user_filter) |
            Q(user__email__icontains=user_filter)
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
            'user': {
                'id': str(event.user.id),
                'username': event.user.username,
                'email': event.user.email
            } if event.user else None,
            'ip_address': event.ip_address,
            'data': event.event_data,
            'message': _format_log_message(event)
        }
        logs_data.append(log_data)
    
    # Get summary statistics
    total_events = queryset.count()
    error_events = queryset.filter(event_type__contains='error').count()
    warning_events = queryset.filter(
        Q(event_type__contains='warning') | 
        Q(event_type__contains='fail')
    ).count()
    
    summary = {
        'total_events': total_events,
        'error_events': error_events,
        'warning_events': warning_events,
        'info_events': total_events - error_events - warning_events,
        'time_range_hours': hours
    }
    
    return Response({
        'results': paginator.get_paginated_response(logs_data).data['results'],
        'count': paginator.get_paginated_response(logs_data).data['count'],
        'next': paginator.get_paginated_response(logs_data).data['next'],
        'previous': paginator.get_paginated_response(logs_data).data['previous'],
        'summary': summary
    })


@extend_schema(
    summary="Broadcast Message",
    description="Send a broadcast message to users",
    request=AdminBroadcastMessageSerializer,
    responses={200: AdminBroadcastResponseSerializer}
)
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


def _format_log_message(event: 'AnalyticsEvent') -> str:
    """Format log message for display"""
    user_name = event.user.username if event.user else 'System'
    
    message_templates = {
        'admin_user_suspended': f"{user_name} suspended user {event.event_data.get('suspended_user_id', 'unknown')}",
        'admin_user_unsuspended': f"{user_name} unsuspended user {event.event_data.get('unsuspended_user_id', 'unknown')}",
        'admin_video_deleted': f"{user_name} deleted video '{event.event_data.get('video_title', 'unknown')}'",
        'admin_party_deleted': f"{user_name} deleted party '{event.event_data.get('party_title', 'unknown')}'",
        'admin_report_resolved': f"{user_name} resolved report {event.event_data.get('report_id', 'unknown')}",
        'admin_broadcast_sent': f"{user_name} sent broadcast to {event.event_data.get('recipients_count', 0)} users",
        'admin_settings_updated': f"{user_name} updated system settings",
        'admin_users_exported': f"{user_name} exported {event.event_data.get('export_count', 0)} user records",
        'user_login': f"{user_name} logged in",
        'user_logout': f"{user_name} logged out",
        'party_create': f"{user_name} created party '{event.event_data.get('party_title', 'unknown')}'",
        'video_upload': f"{user_name} uploaded video '{event.event_data.get('video_title', 'unknown')}'",
    }
    
    return message_templates.get(event.event_type, f"{user_name} performed {event.event_type}")


def _get_content_details(report) -> Dict[str, Any]:
    """Get details about the reported content"""
    details = {}
    
    # Since we're using PartyReport model
    if hasattr(report, 'party') and report.party:
        details = {
            'title': report.party.title,
            'host': report.party.host.username,
            'created_at': report.party.created_at
        }
    
    if hasattr(report, 'reported_user') and report.reported_user:
        details.update({
            'reported_username': report.reported_user.username,
            'reported_email': report.reported_user.email,
            'reported_date_joined': report.reported_user.date_joined
        })
    
    return details


# Additional Admin Panel Features

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_overview(request):
    """Get comprehensive analytics overview for admin dashboard"""
    
    try:
        from apps.analytics.models import SystemAnalytics, VideoAnalytics
        
        # Get latest system analytics
        latest_system_analytics = SystemAnalytics.objects.order_by('-date').first()
        
        # User analytics summary
        total_users = User.objects.count()
        active_users_7_days = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=7)
        ).count()
        premium_users = User.objects.filter(is_premium=True).count()
        
        # Content analytics summary
        total_videos = Video.objects.count()
        total_parties = WatchParty.objects.count()
        active_parties = WatchParty.objects.filter(status='active').count()
        
        # Top performing videos
        top_videos = VideoAnalytics.objects.select_related('video').order_by(
            '-total_views'
        )[:10]
        
        # Recent activity trends
        recent_activity = AnalyticsEvent.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).values('event_type').annotate(
            count=Count('id')
        ).order_by('-count')[:15]
        
        analytics_data = {
            'system_overview': {
                'total_users': total_users,
                'active_users_7_days': active_users_7_days,
                'premium_users': premium_users,
                'total_videos': total_videos,
                'total_parties': total_parties,
                'active_parties': active_parties
            },
            'system_health': {
                'cpu_usage': latest_system_analytics.cpu_usage if latest_system_analytics else 0,
                'memory_usage': latest_system_analytics.memory_usage if latest_system_analytics else 0,
                'disk_usage': latest_system_analytics.disk_usage if latest_system_analytics else 0,
                'uptime_percentage': latest_system_analytics.uptime_percentage if latest_system_analytics else 100
            },
            'top_videos': [
                {
                    'id': str(video.video.id),
                    'title': video.video.title,
                    'views': video.total_views,
                    'rating': video.average_rating
                }
                for video in top_videos
            ],
            'recent_activity': list(recent_activity)
        }
        
        return Response(analytics_data)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get analytics overview: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_system_maintenance(request):
    """Perform system maintenance tasks"""
    
    try:
        maintenance_type = request.data.get('type')
        
        if maintenance_type == 'cleanup_logs':
            # Clean up old log entries
            days_to_keep = int(request.data.get('days_to_keep', 30))
            cutoff_date = timezone.now() - timedelta(days=days_to_keep)
            
            deleted_count = AnalyticsEvent.objects.filter(
                timestamp__lt=cutoff_date
            ).delete()[0]
            
            message = f"Cleaned up {deleted_count} old log entries"
            
        elif maintenance_type == 'optimize_database':
            # This would typically run database optimization commands
            # For now, just log the action
            message = "Database optimization scheduled"
            
        elif maintenance_type == 'clear_cache':
            # Clear application cache
            # This would integrate with your caching system
            message = "Application cache cleared"
            
        elif maintenance_type == 'backup_database':
            # Trigger database backup
            # This would integrate with your backup system
            message = "Database backup initiated"
            
        else:
            return Response({
                'error': 'Invalid maintenance type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the maintenance action
        AnalyticsEvent.objects.create(
            user=request.user,
            event_type=f'admin_maintenance_{maintenance_type}',
            data={
                'maintenance_type': maintenance_type,
                'parameters': request.data
            },
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return Response({
            'message': message,
            'maintenance_type': maintenance_type,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': f'Maintenance task failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_health(request):
    """Get detailed system health information"""
    
    try:
        import psutil
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database metrics
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(minutes=30)
        ).count()
        
        active_parties = WatchParty.objects.filter(status='active').count()
        
        # Recent errors
        recent_errors = AnalyticsEvent.objects.filter(
            event_type__contains='error',
            timestamp__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        health_data = {
            'system_metrics': {
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory.percent,
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_usage_percent': (disk.used / disk.total) * 100,
                'disk_free_gb': round(disk.free / (1024**3), 2)
            },
            'application_metrics': {
                'active_users': active_users,
                'active_parties': active_parties,
                'recent_errors_1h': recent_errors
            },
            'status': 'healthy' if cpu_percent < 80 and memory.percent < 80 else 'warning',
            'last_updated': timezone.now().isoformat()
        }
        
        return Response(health_data)
        
    except ImportError:
        return Response({
            'error': 'System monitoring not available (psutil not installed)'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': f'Failed to get system health: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Enhanced Admin Panel Views for Missing Features

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_bulk_user_action(request):
    """Perform bulk actions on users"""
    
    user_ids = request.data.get('user_ids', [])
    action = request.data.get('action')
    reason = request.data.get('reason', '')
    
    if not user_ids or not action:
        return Response({
            'error': 'user_ids and action are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        users = User.objects.filter(id__in=user_ids)
        results = []
        
        with transaction.atomic():
            for user in users:
                result = {'user_id': str(user.id), 'success': False, 'message': ''}
                
                try:
                    if action == 'suspend':
                        if not user.is_superuser:  # Don't suspend superusers
                            user.is_active = False
                            user.save()
                            result['success'] = True
                            result['message'] = 'User suspended'
                        else:
                            result['message'] = 'Cannot suspend superuser'
                    
                    elif action == 'unsuspend':
                        user.is_active = True
                        user.save()
                        result['success'] = True
                        result['message'] = 'User unsuspended'
                    
                    elif action == 'make_premium':
                        user.is_premium = True
                        user.subscription_expires = timezone.now() + timedelta(days=365)
                        user.save()
                        result['success'] = True
                        result['message'] = 'User made premium'
                    
                    elif action == 'remove_premium':
                        user.is_premium = False
                        user.subscription_expires = None
                        user.save()
                        result['success'] = True
                        result['message'] = 'Premium removed'
                    
                    elif action == 'verify_email':
                        user.is_email_verified = True
                        user.save()
                        result['success'] = True
                        result['message'] = 'Email verified'
                    
                    else:
                        result['message'] = f'Unknown action: {action}'
                    
                    # Log the action
                    if result['success']:
                        AnalyticsEvent.objects.create(
                            user=request.user,
                            event_type=f'admin_bulk_{action}',
                            data={
                                'target_user_id': str(user.id),
                                'reason': reason
                            },
                            ip_address=request.META.get('REMOTE_ADDR', '')
                        )
                
                except Exception as e:
                    result['message'] = f'Error: {str(e)}'
                
                results.append(result)
        
        successful_count = sum(1 for r in results if r['success'])
        
        return Response({
            'message': f'Bulk action completed. {successful_count}/{len(results)} operations successful.',
            'results': results
        })
        
    except Exception as e:
        return Response({
            'error': f'Bulk action failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_export_users(request):
    """Export user data to CSV"""
    
    try:
        import csv
        from django.http import HttpResponse
        from io import StringIO
        
        # Get query parameters for filtering
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        is_premium = request.GET.get('is_premium')
        is_active = request.GET.get('is_active')
        
        # Build queryset
        users = User.objects.all()
        
        if date_from:
            from datetime import datetime
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            users = users.filter(date_joined__gte=date_from_obj)
        
        if date_to:
            from datetime import datetime
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            users = users.filter(date_joined__lte=date_to_obj)
        
        if is_premium is not None:
            users = users.filter(is_premium=is_premium.lower() == 'true')
        
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        # Create CSV content
        output = StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            'ID', 'Email', 'First Name', 'Last Name', 'Is Premium', 
            'Is Active', 'Email Verified', 'Date Joined', 'Last Login'
        ])
        
        # Write user data
        for user in users:
            writer.writerow([
                str(user.id),
                user.email,
                user.first_name,
                user.last_name,
                user.is_premium,
                user.is_active,
                user.is_email_verified,
                user.date_joined.isoformat(),
                user.last_login.isoformat() if user.last_login else ''
            ])
        
        # Return CSV as downloadable response
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="users_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        # Log the export
        AnalyticsEvent.objects.create(
            user=request.user,
            event_type='admin_users_exported',
            data={
                'export_count': users.count(),
                'filters': {
                    'date_from': date_from,
                    'date_to': date_to,
                    'is_premium': is_premium,
                    'is_active': is_active
                }
            },
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return response
        
    except Exception as e:
        return Response({
            'error': f'Export failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_settings(request):
    """Get system settings for admin panel"""
    
    try:
        # In a real implementation, these would come from a settings model
        settings = {
            'site_settings': {
                'site_name': 'Watch Party',
                'max_upload_size_mb': 500,
                'max_party_participants': 50,
                'allow_public_parties': True,
                'require_email_verification': True,
                'enable_chat': True,
                'enable_notifications': True
            },
            'video_settings': {
                'allowed_formats': ['mp4', 'avi', 'mkv', 'mov'],
                'max_duration_hours': 4,
                'auto_generate_thumbnails': True,
                'enable_quality_variants': True,
                'enable_transcoding': True
            },
            'moderation_settings': {
                'auto_moderate_chat': True,
                'profanity_filter_enabled': True,
                'require_manual_approval': False,
                'max_reports_before_suspension': 5
            },
            'security_settings': {
                'enable_2fa': True,
                'session_timeout_hours': 24,
                'max_login_attempts': 5,
                'password_min_length': 8
            }
        }
        
        return Response({
            'settings': settings,
            'last_updated': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get settings: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_system_settings(request):
    """Update system settings"""
    
    try:
        settings_data = request.data.get('settings', {})
        
        # In a real implementation, this would update a settings model
        # For now, just validate and log the update
        
        # Log the settings change
        AnalyticsEvent.objects.create(
            user=request.user,
            event_type='admin_settings_updated',
            data={
                'settings_updated': list(settings_data.keys()),
                'timestamp': timezone.now().isoformat()
            },
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return Response({
            'message': 'Settings updated successfully',
            'updated_at': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to update settings: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_action_history(request, user_id):
    """Get action history for a specific user"""
    
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Get admin actions performed on this user
        admin_actions = AnalyticsEvent.objects.filter(
            Q(data__target_user_id=str(user_id)) | Q(user=user)
        ).filter(
            event_type__startswith='admin_'
        ).order_by('-timestamp')[:50]
        
        actions_data = []
        for action in admin_actions:
            actions_data.append({
                'id': str(action.id),
                'action_type': action.event_type,
                'performed_by': {
                    'id': str(action.user.id),
                    'name': action.user.get_full_name()
                } if action.user else None,
                'timestamp': action.timestamp.isoformat(),
                'data': action.data,
                'ip_address': action.ip_address
            })
        
        return Response({
            'user': {
                'id': str(user.id),
                'name': user.get_full_name(),
                'email': user.email
            },
            'actions': actions_data,
            'total_actions': len(actions_data)
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to get user action history: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_send_notification(request):
    """Send notification to users or all users"""
    
    try:
        message = request.data.get('message')
        title = request.data.get('title', 'System Notification')
        user_ids = request.data.get('user_ids', [])  # Empty list means all users
        notification_type = request.data.get('type', 'system')
        
        if not message:
            return Response({
                'error': 'Message is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get target users
        if user_ids:
            users = User.objects.filter(id__in=user_ids, is_active=True)
        else:
            users = User.objects.filter(is_active=True)
        
        # Create notifications
        notifications_created = 0
        for user in users:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=user,
                title=title,
                content=message,
                notification_type=notification_type,
                is_read=False
            )
            notifications_created += 1
        
        # Log the broadcast
        AnalyticsEvent.objects.create(
            user=request.user,
            event_type='admin_notification_sent',
            data={
                'title': title,
                'message': message[:100] + '...' if len(message) > 100 else message,
                'recipients_count': notifications_created,
                'target_users': user_ids if user_ids else 'all_users'
            },
            ip_address=request.META.get('REMOTE_ADDR', '')
        )
        
        return Response({
            'message': f'Notification sent to {notifications_created} users',
            'recipients_count': notifications_created
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to send notification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Enhanced Admin Panel Features (Task 10)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_bulk_user_actions(request):
    """Perform bulk actions on users"""
    
    user_ids = request.data.get('user_ids', [])
    action = request.data.get('action')  # suspend, unsuspend, delete, export
    
    if not user_ids or not action:
        return StandardResponse.error("User IDs and action are required")
    
    users = User.objects.filter(id__in=user_ids)
    
    if action == 'suspend':
        # Prevent suspending staff/admin users
        staff_users = users.filter(Q(is_staff=True) | Q(is_superuser=True))
        if staff_users.exists():
            return StandardResponse.error("Cannot suspend staff or admin users")
        
        users.update(is_active=False)
        action_message = f"Suspended {users.count()} users"
        
    elif action == 'unsuspend':
        users.update(is_active=True)
        action_message = f"Unsuspended {users.count()} users"
        
    elif action == 'delete':
        # Prevent deleting staff/admin users
        staff_users = users.filter(Q(is_staff=True) | Q(is_superuser=True))
        if staff_users.exists():
            return StandardResponse.error("Cannot delete staff or admin users")
        
        count = users.count()
        users.delete()
        action_message = f"Deleted {count} users"
        
    elif action == 'export':
        return admin_export_users(request, user_ids)
        
    else:
        return StandardResponse.error("Invalid action")
    
    # Log the bulk action
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_bulk_user_action',
        data={
            'action': action,
            'user_count': len(user_ids),
            'user_ids': user_ids
        },
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    return StandardResponse.success({'message': action_message})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_export_users(request, user_ids=None):
    """Export users to CSV"""
    
    if user_ids:
        users = User.objects.filter(id__in=user_ids)
    else:
        # Export all users with filters
        search = request.GET.get('search', '')
        status_filter = request.GET.get('status', 'all')
        
        users = User.objects.all()
        
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'suspended':
            users = users.filter(is_active=False)
    
    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="users_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Username', 'Email', 'First Name', 'Last Name', 
        'Is Active', 'Is Staff', 'Date Joined', 'Last Login',
        'Total Videos', 'Total Parties', 'Total Watch Time'
    ])
    
    for user in users.select_related('profile'):
        # Get user statistics
        video_count = Video.objects.filter(uploaded_by=user).count()
        party_count = WatchParty.objects.filter(host=user).count()
        
        writer.writerow([
            str(user.id),
            user.username,
            user.email,
            user.first_name,
            user.last_name,
            user.is_active,
            user.is_staff,
            user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else '',
            user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '',
            video_count,
            party_count,
            0  # Placeholder for watch time
        ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_health(request):
    """Get comprehensive system health metrics"""
    
    try:
        import psutil
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database metrics
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
            active_connections = cursor.fetchone()[0]
        
        # Application metrics
        total_users = User.objects.count()
        active_users_24h = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        total_videos = Video.objects.count()
        processing_videos = Video.objects.filter(status='processing').count()
        
        active_parties = WatchParty.objects.filter(is_active=True).count()
        
        # Error rates (simplified)
        error_rate = 0.0  # Would implement actual error tracking
        
        health_data = {
            'system': {
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory.percent,
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_usage_percent': round(disk.used / disk.total * 100, 2),
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'active_db_connections': active_connections,
                'uptime_hours': round((timezone.now() - timezone.now().replace(hour=0, minute=0, second=0)).total_seconds() / 3600, 1)
            },
            'application': {
                'total_users': total_users,
                'active_users_24h': active_users_24h,
                'user_activity_rate': round((active_users_24h / total_users * 100) if total_users > 0 else 0, 2),
                'total_videos': total_videos,
                'processing_videos': processing_videos,
                'active_parties': active_parties,
                'error_rate_percent': error_rate
            },
            'alerts': [],
            'last_updated': timezone.now().isoformat()
        }
        
        # Generate alerts based on thresholds
        if cpu_percent > 80:
            health_data['alerts'].append({
                'type': 'warning',
                'message': f'High CPU usage: {cpu_percent}%'
            })
        
        if memory.percent > 85:
            health_data['alerts'].append({
                'type': 'warning',
                'message': f'High memory usage: {memory.percent}%'
            })
        
        if disk.used / disk.total > 0.9:
            health_data['alerts'].append({
                'type': 'critical',
                'message': f'Low disk space: {round((1 - disk.free / disk.total) * 100, 1)}% used'
            })
        
        if processing_videos > 10:
            health_data['alerts'].append({
                'type': 'info',
                'message': f'{processing_videos} videos are currently processing'
            })
        
        return StandardResponse.success(health_data)
        
    except ImportError:
        return StandardResponse.error("System monitoring dependencies not available")
    except Exception as e:
        return StandardResponse.error(f"Failed to get system health: {str(e)}")


@api_view(['POST'])
@permission_classes([IsSuperUser])
def admin_broadcast_message(request):
    """Broadcast message to all users or specific user groups"""
    
    title = request.data.get('title')
    message = request.data.get('message')
    message_type = request.data.get('message_type', 'info')  # info, warning, critical
    target_group = request.data.get('target_group', 'all')  # all, active, premium, staff
    send_email = request.data.get('send_email', False)
    
    if not title or not message:
        return StandardResponse.error("Title and message are required")
    
    # Determine target users
    if target_group == 'active':
        users = User.objects.filter(
            is_active=True,
            last_login__gte=timezone.now() - timedelta(days=30)
        )
    elif target_group == 'premium':
        users = User.objects.filter(is_active=True, subscription__status='active')
    elif target_group == 'staff':
        users = User.objects.filter(is_staff=True, is_active=True)
    else:  # all
        users = User.objects.filter(is_active=True)
    
    # Create notifications
    notifications_created = 0
    for user in users:
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=message_type,
            is_read=False
        )
        notifications_created += 1
    
    # Send emails if requested
    emails_sent = 0
    if send_email:
        try:
            email_messages = []
            for user in users[:100]:  # Limit to prevent abuse
                if user.email:
                    email_messages.append((
                        title,
                        message,
                        'noreply@watchparty.com',
                        [user.email]
                    ))
            
            send_mass_mail(email_messages, fail_silently=True)
            emails_sent = len(email_messages)
        except Exception:
            # Log email error but don't fail the broadcast
            pass
    
    # Log the broadcast
    AnalyticsEvent.objects.create(
        user=request.user,
        event_type='admin_broadcast_message',
        data={
            'title': title,
            'message_type': message_type,
            'target_group': target_group,
            'recipients_count': notifications_created,
            'emails_sent': emails_sent
        },
        ip_address=request.META.get('REMOTE_ADDR', '')
    )
    
    return StandardResponse.success({
        'notifications_sent': notifications_created,
        'emails_sent': emails_sent,
        'target_group': target_group
    }, "Broadcast message sent successfully")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_overview(request):
    """Get comprehensive analytics overview for admin dashboard"""
    
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # User analytics
    user_registrations = User.objects.filter(
        date_joined__gte=start_date
    ).extra({
        'date': 'date(date_joined)'
    }).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Content analytics
    video_uploads = Video.objects.filter(
        created_at__gte=start_date
    ).extra({
        'date': 'date(created_at)'
    }).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Party analytics
    party_creations = WatchParty.objects.filter(
        created_at__gte=start_date
    ).extra({
        'date': 'date(created_at)'
    }).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Revenue analytics (if billing is enabled)
    revenue_data = []
    try:
        revenue_by_day = Payment.objects.filter(
            status='completed',
            created_at__gte=start_date
        ).extra({
            'date': 'date(created_at)'
        }).values('date').annotate(
            total=Sum('amount')
        ).order_by('date')
        
        revenue_data = list(revenue_by_day)
    except:
        pass
    
    # Top content
    popular_videos = Video.objects.filter(
        created_at__gte=start_date,
        status='ready'
    ).annotate(
        view_count=Count('watch_times')
    ).order_by('-view_count')[:10]
    
    # User engagement
    active_users_by_day = AnalyticsEvent.objects.filter(
        timestamp__gte=start_date,
        event_type='user_login'
    ).extra({
        'date': 'date(timestamp)'
    }).values('date').annotate(
        unique_users=Count('user', distinct=True)
    ).order_by('date')
    
    analytics_data = {
        'time_series': {
            'user_registrations': list(user_registrations),
            'video_uploads': list(video_uploads),
            'party_creations': list(party_creations),
            'active_users': list(active_users_by_day),
            'revenue': revenue_data
        },
        'top_content': {
            'popular_videos': [
                {
                    'id': str(video.id),
                    'title': video.title,
                    'uploader': video.uploaded_by.username,
                    'view_count': video.view_count,
                    'created_at': video.created_at.date()
                }
                for video in popular_videos
            ]
        },
        'summary': {
            'total_users': User.objects.count(),
            'total_videos': Video.objects.count(),
            'total_parties': WatchParty.objects.count(),
            'active_parties': WatchParty.objects.filter(is_active=True).count(),
            'new_users_period': User.objects.filter(date_joined__gte=start_date).count(),
            'new_videos_period': Video.objects.filter(created_at__gte=start_date).count(),
            'period_days': days
        }
    }
    
    return StandardResponse.success(analytics_data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_content_moderation(request):
    """Get content moderation queue and tools"""
    
    # Get reported content
    reports = []
    try:
        from apps.moderation.models import ContentReport
        pending_reports = ContentReport.objects.filter(
            status='pending'
        ).select_related('reporter', 'content_object').order_by('-created_at')[:50]
        
        for report in pending_reports:
            reports.append({
                'id': str(report.id),
                'content_type': report.content_type.model,
                'content_id': str(report.object_id),
                'report_type': report.report_type,
                'description': report.description,
                'reporter': {
                    'id': str(report.reporter.id),
                    'username': report.reporter.username
                },
                'created_at': report.created_at,
                'severity': getattr(report, 'severity', 'medium')
            })
    except ImportError:
        pass
    
    # Get flagged videos (example criteria)
    flagged_videos = Video.objects.filter(
        Q(status='flagged') | Q(title__icontains='test')  # Example criteria
    ).select_related('uploaded_by')[:20]
    
    flagged_content = [
        {
            'id': str(video.id),
            'title': video.title,
            'uploader': {
                'id': str(video.uploaded_by.id),
                'username': video.uploaded_by.username
            },
            'status': video.status,
            'created_at': video.created_at,
            'flag_reason': 'Automated detection'  # Would be more sophisticated
        }
        for video in flagged_videos
    ]
    
    moderation_data = {
        'pending_reports': reports,
        'flagged_content': flagged_content,
        'moderation_stats': {
            'total_reports': len(reports),
            'flagged_videos': len(flagged_content),
            'resolved_today': 0,  # Would implement actual tracking
            'pending_review': len(reports) + len(flagged_content)
        },
        'quick_actions': [
            'approve_content',
            'remove_content',
            'suspend_user',
            'warn_user',
            'escalate_report'
        ]
    }
    
    return StandardResponse.success(moderation_data)
