"""
Notifications views for Watch Party Backend
"""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta
from .models import Notification, NotificationPreferences, NotificationTemplate, NotificationDelivery
from .serializers import (
    NotificationSerializer, NotificationPreferencesSerializer, 
    NotificationTemplateSerializer, NotificationCreateSerializer
)

User = get_user_model()


class NotificationListView(generics.ListAPIView):
    """Get list of notifications for authenticated user"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = user.notifications.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).select_related('template', 'party', 'video', 'related_user')
        
        # Filter by status
        status_filter = self.request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by read status
        is_read = self.request.GET.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by priority
        priority = self.request.GET.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by date range
        days = self.request.GET.get('days')
        if days:
            try:
                days_int = int(days)
                since = timezone.now() - timedelta(days=days_int)
                queryset = queryset.filter(created_at__gte=since)
            except ValueError:
                pass
        
        return queryset.order_by('-created_at')


class NotificationDetailView(generics.RetrieveAPIView):
    """Get details of a specific notification"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        notification_id = self.kwargs.get('notification_id')
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            user=self.request.user
        )
        
        # Auto-mark as delivered when accessed
        if notification.status == 'sent':
            notification.mark_as_delivered()
        
        return notification


class MarkAsReadView(generics.GenericAPIView):
    """Mark notifications as read"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        notification_ids = request.data.get('notification_ids', [])
        mark_all = request.data.get('mark_all', False)
        
        if mark_all:
            # Mark all unread notifications as read
            notifications = user.notifications.filter(is_read=False)
            count = notifications.count()
            notifications.update(
                is_read=True,
                read_at=timezone.now(),
                status='read'
            )
            return Response({
                'message': f'Marked {count} notifications as read',
                'count': count
            })
        
        elif notification_ids:
            # Mark specific notifications as read
            notifications = user.notifications.filter(
                id__in=notification_ids,
                is_read=False
            )
            count = 0
            for notification in notifications:
                notification.mark_as_read()
                count += 1
            
            return Response({
                'message': f'Marked {count} notifications as read',
                'count': count
            })
        
        else:
            return Response(
                {'error': 'Either notification_ids or mark_all must be provided'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MarkAsReadSingleView(generics.GenericAPIView):
    """Mark a single notification as read"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            user=request.user
        )
        
        if not notification.is_read:
            notification.mark_as_read()
            return Response({'message': 'Notification marked as read'})
        else:
            return Response({'message': 'Notification was already read'})


class DismissNotificationView(generics.GenericAPIView):
    """Dismiss/delete a notification"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, notification_id):
        notification = get_object_or_404(
            Notification, 
            id=notification_id, 
            user=request.user
        )
        
        # Update status instead of deleting for audit trail
        notification.status = 'dismissed'
        notification.save()
        
        return Response({'message': 'Notification dismissed'})


class NotificationPreferencesView(generics.RetrieveUpdateAPIView):
    """Get and update user notification preferences"""
    
    serializer_class = NotificationPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        preferences, created = NotificationPreferences.objects.get_or_create(user=user)
        return preferences


class SendNotificationView(generics.CreateAPIView):
    """Send a notification (admin only)"""
    
    serializer_class = NotificationCreateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        recipient_ids = serializer.validated_data.pop('recipient_ids', [])
        send_to_all = serializer.validated_data.pop('send_to_all', False)
        
        if send_to_all:
            # Send to all users
            recipients = User.objects.filter(is_active=True)
        elif recipient_ids:
            # Send to specific users
            recipients = User.objects.filter(id__in=recipient_ids, is_active=True)
        else:
            return Response(
                {'error': 'Either recipient_ids or send_to_all must be provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create notifications for all recipients
        notifications_created = 0
        for recipient in recipients:
            # Check user preferences
            prefs, _ = NotificationPreferences.objects.get_or_create(user=recipient)
            notification_type = serializer.validated_data.get('template', {}).get('notification_type', 'system_update')
            
            if prefs.is_category_enabled(notification_type):
                notification = Notification.objects.create(
                    user=recipient,
                    **serializer.validated_data
                )
                
                # Queue for delivery
                self._queue_notification_delivery(notification, prefs)
                notifications_created += 1
        
        return Response({
            'message': f'Notification sent to {notifications_created} users',
            'recipients_count': notifications_created
        })
    
    def _queue_notification_delivery(self, notification, preferences):
        """Queue notification for delivery across enabled channels"""
        from .tasks import deliver_notification  # Import here to avoid circular imports
        
        channels = []
        if preferences.is_channel_enabled('in_app'):
            channels.append('in_app')
        if preferences.is_channel_enabled('email'):
            channels.append('email')
        if preferences.is_channel_enabled('push'):
            channels.append('push')
        
        for channel in channels:
            delivery = NotificationDelivery.objects.create(
                notification=notification,
                channel=channel
            )
            
            # Queue delivery task
            deliver_notification.delay(delivery.id)


class BulkNotificationView(generics.GenericAPIView):
    """Send bulk notifications (admin only)"""
    
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def post(self, request):
        template_id = request.data.get('template_id')
        user_filters = request.data.get('user_filters', {})
        context_data = request.data.get('context_data', {})
        schedule_at = request.data.get('schedule_at')
        
        if not template_id:
            return Response(
                {'error': 'template_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        template = get_object_or_404(NotificationTemplate, id=template_id, is_active=True)
        
        # Build user queryset based on filters
        queryset = User.objects.filter(is_active=True)
        
        if user_filters.get('is_premium'):
            queryset = queryset.filter(is_premium=True)
        if user_filters.get('subscription_expiring'):
            expiry_date = timezone.now() + timedelta(days=7)
            queryset = queryset.filter(subscription_expires__lte=expiry_date)
        if user_filters.get('inactive_days'):
            inactive_since = timezone.now() - timedelta(days=user_filters['inactive_days'])
            queryset = queryset.filter(last_login__lt=inactive_since)
        
        recipient_count = queryset.count()
        
        # Create bulk notification task
        from .tasks import create_bulk_notifications
        
        scheduled_time = None
        if schedule_at:
            try:
                scheduled_time = timezone.datetime.fromisoformat(schedule_at.replace('Z', '+00:00'))
            except ValueError:
                return Response(
                    {'error': 'Invalid schedule_at format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        task_result = create_bulk_notifications.delay(
            template_id=str(template.id),
            user_filters=user_filters,
            context_data=context_data,
            scheduled_at=scheduled_time.isoformat() if scheduled_time else None
        )
        
        return Response({
            'message': f'Bulk notification queued for {recipient_count} users',
            'task_id': task_result.id,
            'estimated_recipients': recipient_count
        })


class NotificationStatsView(generics.GenericAPIView):
    """Get notification statistics for user"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get counts by status
        stats = user.notifications.aggregate(
            total=Count('id'),
            unread=Count('id', filter=Q(is_read=False)),
            urgent=Count('id', filter=Q(priority='urgent', is_read=False)),
            this_week=Count('id', filter=Q(created_at__gte=timezone.now() - timedelta(days=7)))
        )
        
        # Get counts by category (based on template type)
        category_stats = user.notifications.filter(
            template__isnull=False
        ).values(
            'template__notification_type'
        ).annotate(
            count=Count('id'),
            unread_count=Count('id', filter=Q(is_read=False))
        ).order_by('-count')
        
        return Response({
            'overall': stats,
            'categories': list(category_stats),
            'has_urgent': stats['urgent'] > 0
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_count(request):
    """Get count of unread notifications"""
    user = request.user
    count = user.notifications.filter(is_read=False).count()
    urgent_count = user.notifications.filter(is_read=False, priority='urgent').count()
    
    return Response({
        'unread_count': count,
        'urgent_count': urgent_count,
        'has_unread': count > 0
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_notification(request):
    """Send a test notification to the current user (for testing)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff users can send test notifications'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    notification = Notification.objects.create(
        user=request.user,
        title="Test Notification",
        content="This is a test notification to verify the notification system is working.",
        icon="bell",
        color="blue",
        priority="normal"
    )
    
    return Response({
        'message': 'Test notification sent',
        'notification_id': notification.id
    })


class AdminNotificationTemplateListView(generics.ListCreateAPIView):
    """List and create notification templates (admin only)"""
    
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        return NotificationTemplate.objects.all().order_by('notification_type')


class AdminNotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete notification template (admin only)"""
    
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    queryset = NotificationTemplate.objects.all()


class AdminNotificationStatsView(generics.GenericAPIView):
    """Get system-wide notification statistics (admin only)"""
    
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        # Overall stats
        total_notifications = Notification.objects.count()
        total_deliveries = NotificationDelivery.objects.count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_notifications = Notification.objects.filter(created_at__gte=thirty_days_ago)
        
        recent_stats = recent_notifications.aggregate(
            total=Count('id'),
            delivered=Count('id', filter=Q(status='delivered')),
            failed=Count('id', filter=Q(status='failed')),
            read=Count('id', filter=Q(is_read=True))
        )
        
        # Delivery stats by channel
        delivery_stats = NotificationDelivery.objects.filter(
            created_at__gte=thirty_days_ago
        ).values('channel').annotate(
            total=Count('id'),
            successful=Count('id', filter=Q(status='delivered')),
            failed=Count('id', filter=Q(status='failed'))
        ).order_by('-total')
        
        # Template usage stats
        template_stats = recent_notifications.filter(
            template__isnull=False
        ).values(
            'template__notification_type',
            'template__title_template'
        ).annotate(
            count=Count('id'),
            read_rate=Count('id', filter=Q(is_read=True)) * 100.0 / Count('id')
        ).order_by('-count')
        
        return Response({
            'overall': {
                'total_notifications': total_notifications,
                'total_deliveries': total_deliveries,
                'active_templates': NotificationTemplate.objects.filter(is_active=True).count()
            },
            'recent_activity': recent_stats,
            'delivery_channels': list(delivery_stats),
            'template_usage': list(template_stats)
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_push_token(request):
    """Update user's push notification token"""
    token = request.data.get('push_token')
    device_type = request.data.get('device_type', 'web')
    
    if not token:
        return Response(
            {'error': 'push_token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    preferences, created = NotificationPreferences.objects.get_or_create(
        user=request.user
    )
    
    preferences.push_token = token
    preferences.push_device_type = device_type
    preferences.save()
    
    return Response({
        'message': 'Push token updated successfully'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_all_notifications(request):
    """Clear all notifications for the current user"""
    user = request.user
    
    # Mark all notifications as dismissed instead of deleting
    count = user.notifications.filter(
        status__in=['pending', 'sent', 'delivered', 'read']
    ).update(status='dismissed')
    
    return Response({
        'message': f'Cleared {count} notifications',
        'count': count
    })
