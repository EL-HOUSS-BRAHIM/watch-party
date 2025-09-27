"""
Notifications views for Watch Party Backend
"""

from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from drf_spectacular.utils import extend_schema
from datetime import timedelta
from shared.permissions import IsAdminUser
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
        # Handle schema generation when there's no user
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
        
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
    
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="MarkAsReadView POST")
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
    
    @extend_schema(summary="MarkAsReadSingleView POST")
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
    
    @extend_schema(summary="DismissNotificationView DELETE")
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
    
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    @extend_schema(summary="BulkNotificationView POST")
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
    
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationStatsView GET")
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
    
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    @extend_schema(summary="AdminNotificationStatsView GET")
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
    preferences.push_enabled = True  # Enable push notifications when token is updated
    preferences.save()
    
    # Subscribe to general topic for broadcast notifications
    try:
        from shared.services.mobile_push_service import mobile_push_service
        mobile_push_service.subscribe_to_topic([token], 'general_announcements')
    except Exception as e:
        logger.warning(f"Failed to subscribe to topic: {str(e)}")
    
    return Response({
        'message': 'Push token updated successfully'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_push_token(request):
    """Remove user's push notification token"""
    request.data.get('device_type', 'web')
    
    try:
        preferences = NotificationPreferences.objects.get(user=request.user)
        
        # Unsubscribe from topics before removing token
        if preferences.push_token:
            try:
                from shared.services.mobile_push_service import mobile_push_service
                mobile_push_service.unsubscribe_from_topic(
                    [preferences.push_token], 
                    'general_announcements'
                )
            except Exception as e:
                logger.warning(f"Failed to unsubscribe from topic: {str(e)}")
        
        preferences.push_token = ''
        preferences.push_enabled = False
        preferences.save()
        
        return Response({
            'message': 'Push token removed successfully'
        })
        
    except NotificationPreferences.DoesNotExist:
        return Response({
            'message': 'No push token found'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_push_notification(request):
    """Send a test push notification to the user"""
    try:
        from shared.services.mobile_push_service import mobile_push_service
        
        result = mobile_push_service.send_to_user(
            user=request.user,
            title="Test Notification",
            body="This is a test push notification from Watch Party",
            data={
                'type': 'test',
                'timestamp': timezone.now().isoformat()
            }
        )
        
        return Response({
            'message': 'Test notification sent',
            'result': result
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to send test notification: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_broadcast_push(request):
    """Send broadcast push notification to all users"""
    title = request.data.get('title')
    body = request.data.get('body')
    topic = request.data.get('topic', 'general_announcements')
    
    if not title or not body:
        return Response(
            {'error': 'title and body are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from shared.services.mobile_push_service import mobile_push_service
        
        message_id = mobile_push_service.send_to_topic(
            topic=topic,
            title=title,
            body=body,
            data={
                'type': 'broadcast',
                'timestamp': timezone.now().isoformat()
            }
        )
        
        return Response({
            'message': 'Broadcast notification sent',
            'message_id': message_id
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to send broadcast: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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


# Missing function implementations for URL compatibility
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    """Mark a single notification as read"""
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
        notification.status = 'read'
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({
            'message': 'Notification marked as read',
            'notification_id': str(pk)
        })
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    count = request.user.notifications.filter(
        status__in=['pending', 'sent', 'delivered']
    ).update(
        status='read',
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'Marked {count} notifications as read',
        'count': count
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_notification_preferences(request):
    """Update user notification preferences"""
    try:
        preferences, created = NotificationPreferences.objects.get_or_create(
            user=request.user
        )
        
        # Update preferences from request data
        for key, value in request.data.items():
            if hasattr(preferences, key):
                setattr(preferences, key, value)
        
        preferences.save()
        
        serializer = NotificationPreferencesSerializer(preferences)
        return Response({
            'message': 'Preferences updated successfully',
            'preferences': serializer.data
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


# Additional view classes for URL compatibility
class NotificationTemplateListView(generics.ListCreateAPIView):
    """List and create notification templates (Admin only)"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return NotificationTemplate.objects.all()


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete notification templates (Admin only)"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return NotificationTemplate.objects.all()


class NotificationChannelListView(generics.ListAPIView):
    """List notification channels (Admin only)"""
    serializer_class = NotificationPreferencesSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Get notification preferences queryset with swagger_fake_view handling."""
        # Handle swagger_fake_view for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return NotificationPreferences.objects.none()
        
        return NotificationPreferences.objects.select_related('user').all()
    
    @extend_schema(summary="NotificationChannelListView GET")
    def get(self, request):
        channels = self.get_queryset()
        
        data = []
        # Only process objects if not in schema generation mode
        if not getattr(self, 'swagger_fake_view', False):
            for channel in channels:
                data.append({
                    'id': str(channel.id),
                    'user': {
                        'id': str(channel.user.id),
                        'username': channel.user.username,
                        'email': channel.user.email
                    },
                    'email_enabled': channel.email_enabled,
                    'push_enabled': channel.push_enabled,
                    'sms_enabled': channel.sms_enabled,
                    'in_app_enabled': channel.in_app_enabled,
                    'created_at': channel.created_at,
                    'updated_at': channel.updated_at
                })
        
        return Response({
            'channels': data,
            'total': len(data)
        })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def notification_stats(request):
    """Get notification statistics"""
    from django.db.models import Count
    
    # Get stats for different time periods
    today = timezone.now().date()
    this_week = today - timedelta(days=7)
    this_month = today - timedelta(days=30)
    
    stats = {
        'total_notifications': Notification.objects.count(),
        'today': Notification.objects.filter(created_at__date=today).count(),
        'this_week': Notification.objects.filter(created_at__gte=this_week).count(),
        'this_month': Notification.objects.filter(created_at__gte=this_month).count(),
        'by_status': dict(
            Notification.objects.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        ),
        'by_type': dict(
            Notification.objects.values('notification_type').annotate(
                count=Count('id')
            ).values_list('notification_type', 'count')
        )
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def delivery_stats(request):
    """Get notification delivery statistics"""
    from .models import NotificationDelivery
    
    delivery_stats = {
        'total_deliveries': NotificationDelivery.objects.count(),
        'by_channel': dict(
            NotificationDelivery.objects.values('channel').annotate(
                count=Count('id')
            ).values_list('channel', 'count')
        ),
        'by_status': dict(
            NotificationDelivery.objects.values('status').annotate(
                count=Count('id')
            ).values_list('status', 'count')
        ),
        'success_rate': 0  # Calculate success rate
    }
    
    total = delivery_stats['total_deliveries']
    if total > 0:
        successful = NotificationDelivery.objects.filter(status='delivered').count()
        delivery_stats['success_rate'] = round((successful / total) * 100, 2)
    
    return Response(delivery_stats)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_send_notifications(request):
    """Send notifications in bulk"""
    notification_type = request.data.get('type')
    title = request.data.get('title')
    content = request.data.get('content')
    user_ids = request.data.get('user_ids', [])
    
    if not all([notification_type, title, content]):
        return Response(
            {'error': 'Type, title, and content are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get target users
    if user_ids:
        users = User.objects.filter(id__in=user_ids)
    else:
        users = User.objects.filter(is_active=True)
    
    # Create notifications
    notifications = []
    for user in users:
        notifications.append(Notification(
            user=user,
            notification_type=notification_type,
            title=title,
            content=content,
            metadata={'bulk_send': True}
        ))
    
    created_notifications = Notification.objects.bulk_create(notifications)
    
    return Response({
        'message': f'Created {len(created_notifications)} notifications',
        'count': len(created_notifications)
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def cleanup_old_notifications(request):
    """Clean up old notifications"""
    days = int(request.data.get('days', 30))
    cutoff_date = timezone.now() - timedelta(days=days)
    
    # Delete old dismissed and read notifications
    deleted_count, _ = Notification.objects.filter(
        Q(status='dismissed') | Q(status='read'),
        created_at__lt=cutoff_date
    ).delete()
    
    return Response({
        'message': f'Cleaned up {deleted_count} old notifications',
        'deleted_count': deleted_count
    })
