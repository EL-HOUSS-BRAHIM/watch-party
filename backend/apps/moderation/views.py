"""
Content reporting views for Watch Party Backend
"""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q, Avg
from django.db.models.functions import Extract
from datetime import timedelta
from shared.permissions import IsAdminUser
from shared.pagination import StandardResultsSetPagination
from .models import ContentReport, ReportAction
from .serializers import (
    ContentReportSerializer, ContentReportCreateSerializer,
    ReportActionSerializer, ReportResolutionSerializer,
    ContentReportStatsSerializer, ModerationQueueSerializer
)

User = get_user_model()


class ContentReportListCreateView(generics.ListCreateAPIView):
    """List user's reports or create new report"""
    
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContentReportCreateSerializer
        return ContentReportSerializer
    
    def get_queryset(self):
        # Handle schema generation when there's no user
        if getattr(self, 'swagger_fake_view', False):
            return ContentReport.objects.none()
        
        user = self.request.user
        
        # Admin users can see all reports
        if user.is_staff:
            return ContentReport.objects.select_related(
                'reported_by', 'assigned_to', 'reported_video', 
                'reported_party', 'reported_user'
            ).all()
        
        # Regular users can only see their own reports
        return ContentReport.objects.select_related(
            'reported_by', 'assigned_to', 'reported_video', 
            'reported_party', 'reported_user'
        ).filter(reported_by=user)
    
    def perform_create(self, serializer):
        """Create a new content report"""
        serializer.save(reported_by=self.request.user)


class ContentReportDetailView(generics.RetrieveUpdateAPIView):
    """Get or update specific content report"""
    
    serializer_class = ContentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin users can access all reports
        if user.is_staff:
            return ContentReport.objects.select_related(
                'reported_by', 'assigned_to', 'reported_video', 
                'reported_party', 'reported_user'
            ).all()
        
        # Regular users can only access their own reports
        return ContentReport.objects.select_related(
            'reported_by', 'assigned_to', 'reported_video', 
            'reported_party', 'reported_user'
        ).filter(reported_by=user)


class ModerationQueueView(generics.ListAPIView):
    """Admin view for moderation queue"""
    
    serializer_class = ModerationQueueSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Get filtered moderation queue"""
        queryset = ContentReport.objects.select_related(
            'reported_by', 'assigned_to', 'reported_video', 
            'reported_party', 'reported_user'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority')
        if priority_filter and priority_filter != 'all':
            queryset = queryset.filter(priority=priority_filter)
        
        # Filter by content type
        content_type_filter = self.request.query_params.get('content_type')
        if content_type_filter and content_type_filter != 'all':
            queryset = queryset.filter(content_type=content_type_filter)
        
        # Filter by report type
        report_type_filter = self.request.query_params.get('report_type')
        if report_type_filter and report_type_filter != 'all':
            queryset = queryset.filter(report_type=report_type_filter)
        
        # Filter assigned to current user
        assigned_to_me = self.request.query_params.get('assigned_to_me')
        if assigned_to_me == 'true':
            queryset = queryset.filter(assigned_to=self.request.user)
        
        # Search by description or reporter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(reported_by__username__icontains=search) |
                Q(reported_by__email__icontains=search)
            )
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_report(request, report_id):
    """Assign report to moderator"""
    
    report = get_object_or_404(ContentReport, id=report_id)
    moderator_id = request.data.get('moderator_id')
    
    if moderator_id:
        moderator = get_object_or_404(User, id=moderator_id, is_staff=True)
        report.assigned_to = moderator
    else:
        report.assigned_to = request.user
    
    report.status = 'investigating'
    report.save()
    
    serializer = ContentReportSerializer(report)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def resolve_report(request, report_id):
    """Resolve a content report"""
    
    report = get_object_or_404(ContentReport, id=report_id)
    serializer = ReportResolutionSerializer(data=request.data)
    
    if serializer.is_valid():
        data = serializer.validated_data
        
        # Create report action
        ReportAction.objects.create(
            report=report,
            action_type=data['action_type'],
            moderator=request.user,
            description=data['description'],
            duration_days=data.get('duration_days')
        )
        
        # Resolve the report
        report.resolve(
            moderator=request.user,
            action=data['description'],
            notes=data.get('resolution_notes', '')
        )
        
        # Apply action to content/user if needed
        _apply_moderation_action(report, data)
        
        return Response({
            'message': 'Report resolved successfully',
            'report': ContentReportSerializer(report).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def dismiss_report(request, report_id):
    """Dismiss a content report"""
    
    report = get_object_or_404(ContentReport, id=report_id)
    reason = request.data.get('reason', 'No action required')
    
    report.dismiss(moderator=request.user, reason=reason)
    
    # Create report action
    ReportAction.objects.create(
        report=report,
        action_type='no_action',
        moderator=request.user,
        description=f"Report dismissed: {reason}"
    )
    
    return Response({
        'message': 'Report dismissed successfully',
        'report': ContentReportSerializer(report).data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def moderation_stats(request):
    """Get moderation statistics"""
    
    # Basic counts
    total_reports = ContentReport.objects.count()
    pending_reports = ContentReport.objects.filter(status='pending').count()
    resolved_reports = ContentReport.objects.filter(status='resolved').count()
    dismissed_reports = ContentReport.objects.filter(status='dismissed').count()
    high_priority_reports = ContentReport.objects.filter(
        priority__in=['high', 'critical'], 
        status__in=['pending', 'investigating']
    ).count()
    
    # Reports by type
    reports_by_type = dict(
        ContentReport.objects.values('report_type').annotate(
            count=Count('id')
        ).values_list('report_type', 'count')
    )
    
    # Reports by content type
    reports_by_content_type = dict(
        ContentReport.objects.values('content_type').annotate(
            count=Count('id')
        ).values_list('content_type', 'count')
    )
    
    # Average resolution time (in hours)
    resolved_reports_with_time = ContentReport.objects.filter(
        status='resolved',
        resolved_at__isnull=False
    )
    
    avg_resolution_time = 0
    if resolved_reports_with_time.exists():
        resolution_times = []
        for report in resolved_reports_with_time:
            time_diff = report.resolved_at - report.created_at
            resolution_times.append(time_diff.total_seconds() / 3600)  # Convert to hours
        
        avg_resolution_time = sum(resolution_times) / len(resolution_times)
    
    stats_data = {
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'resolved_reports': resolved_reports,
        'dismissed_reports': dismissed_reports,
        'high_priority_reports': high_priority_reports,
        'reports_by_type': reports_by_type,
        'reports_by_content_type': reports_by_content_type,
        'average_resolution_time': round(avg_resolution_time, 2)
    }
    
    serializer = ContentReportStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def moderation_dashboard(request):
    """Get comprehensive moderation dashboard data"""
    
    # Get date range for trends
    days_back = int(request.query_params.get('days', 30))
    start_date = timezone.now() - timedelta(days=days_back)
    
    # Recent reports trend
    daily_reports = ContentReport.objects.filter(
        created_at__gte=start_date
    ).extra(
        {'day': 'date(created_at)'}
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    # Top reporters (users with most reports)
    top_reporters = ContentReport.objects.values(
        'reported_by__username'
    ).annotate(
        report_count=Count('id')
    ).order_by('-report_count')[:10]
    
    # Most reported content types
    content_type_stats = ContentReport.objects.values(
        'content_type'
    ).annotate(
        count=Count('id'),
        pending=Count('id', filter=Q(status='pending')),
        resolved=Count('id', filter=Q(status='resolved'))
    ).order_by('-count')
    
    # Moderator performance
    moderator_stats = ContentReport.objects.filter(
        assigned_to__isnull=False,
        resolved_at__isnull=False
    ).values(
        'assigned_to__username'
    ).annotate(
        resolved_count=Count('id'),
        avg_resolution_time=Avg(
            Extract(timezone.now() - timezone.F('created_at'), 'epoch') / 3600
        )
    ).order_by('-resolved_count')
    
    dashboard_data = {
        'stats': moderation_stats(request).data,
        'daily_reports': list(daily_reports),
        'top_reporters': list(top_reporters),
        'content_type_stats': list(content_type_stats),
        'moderator_stats': list(moderator_stats)
    }
    
    return Response(dashboard_data)


class ReportActionListView(generics.ListAPIView):
    """List actions taken on a specific report"""
    
    serializer_class = ReportActionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        # Prevent errors during schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ReportAction.objects.none()
        report_id = self.kwargs['report_id']
        return ReportAction.objects.filter(
            report_id=report_id
        ).select_related('moderator', 'report')


def _apply_moderation_action(report: ContentReport, action_data: dict):
    """Apply moderation action to content or user"""
    action_type = action_data['action_type']
    
    try:
        if action_type == 'content_removed':
            # Remove the reported content
            if report.reported_video:
                report.reported_video.is_deleted = True
                report.reported_video.save()
            elif report.reported_party:
                report.reported_party.is_deleted = True
                report.reported_party.save()
        
        elif action_type == 'user_suspended':
            # Suspend the user
            if report.reported_user:
                from datetime import timedelta
                suspension_days = action_data.get('duration_days', 7)
                report.reported_user.is_suspended = True
                report.reported_user.suspension_ends = timezone.now() + timedelta(days=suspension_days)
                report.reported_user.save()
        
        elif action_type == 'user_banned':
            # Ban the user permanently
            if report.reported_user:
                report.reported_user.is_active = False
                report.reported_user.save()
        
        elif action_type == 'warning':
            # Send warning notification to user
            if report.reported_user:
                from shared.services.notification_service import notification_service
                notification_service.send_warning_notification(
                    user=report.reported_user,
                    reason=action_data['description']
                )
    
    except Exception as e:
        # Log the error but don't fail the resolution
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to apply moderation action: {str(e)}")


# Utility endpoints for frontend
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def report_types(request):
    """Get available report types"""
    return Response([
        {'value': choice[0], 'label': choice[1]} 
        for choice in ContentReport.REPORT_TYPES
    ])


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def content_types(request):
    """Get available content types for reporting"""
    return Response([
        {'value': choice[0], 'label': choice[1]} 
        for choice in ContentReport.CONTENT_TYPES
    ])


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_report_action(request):
    """Handle bulk actions on multiple reports"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    report_ids = request.data.get('report_ids', [])
    action = request.data.get('action')
    
    if not report_ids or not action:
        return Response(
            {'error': 'report_ids and action are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reports = ContentReport.objects.filter(id__in=report_ids)
    updated_count = 0
    
    if action == 'assign_to_me':
        reports.update(
            assigned_to=request.user,
            status='investigating'
        )
        updated_count = reports.count()
    
    elif action == 'mark_pending':
        reports.update(status='pending', assigned_to=None)
        updated_count = reports.count()
    
    elif action == 'bulk_dismiss':
        reason = request.data.get('reason', 'Bulk dismissed')
        for report in reports:
            report.dismiss(moderator=request.user, reason=reason)
            ReportAction.objects.create(
                report=report,
                action_type='no_action',
                moderator=request.user,
                description=f"Bulk dismissed: {reason}"
            )
        updated_count = reports.count()
    
    return Response({
        'message': f'Successfully updated {updated_count} reports',
        'updated_count': updated_count
    })
