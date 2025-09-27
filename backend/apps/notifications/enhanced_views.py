"""
Enhanced notifications views for Watch Party Backend
"""

from rest_framework import permissions, status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from drf_spectacular.utils import extend_schema
from datetime import timedelta, datetime

from shared.responses import StandardResponse
from shared.permissions import IsAdminUser
from .models import (
    Notification, NotificationPreference, NotificationTemplate, 
    NotificationBatch, NotificationAnalytics, PushSubscription
)

User = get_user_model()


class NotificationListView(APIView):
    """Enhanced notification list with filtering and pagination"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationListView GET")
    def get(self, request):
        """Get notifications for authenticated user"""
        user = request.user
        
        # Get query parameters
        status_filter = request.GET.get('status', '')
        is_read = request.GET.get('is_read', '')
        priority = request.GET.get('priority', '')
        notification_type = request.GET.get('type', '')
        date_from = request.GET.get('date_from', '')
        date_to = request.GET.get('date_to', '')
        limit = min(int(request.GET.get('limit', 20)), 100)
        offset = int(request.GET.get('offset', 0))
        
        # Base queryset
        queryset = user.notifications.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).select_related('template', 'party', 'video', 'related_user')
        
        # Apply filters
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if is_read:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        if notification_type:
            queryset = queryset.filter(template__notification_type=notification_type)
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=date_from_obj)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__lte=date_to_obj)
            except ValueError:
                pass
        
        # Get total count
        total_count = queryset.count()
        
        # Apply pagination
        notifications = queryset.order_by('-created_at')[offset:offset + limit]
        
        # Serialize notifications
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': notification.id,
                'title': notification.title,
                'content': notification.content,
                'html_content': notification.html_content,
                'icon': notification.icon,
                'color': notification.color,
                'priority': notification.priority,
                'is_read': notification.is_read,
                'requires_action': notification.requires_action,
                'action_url': notification.action_url,
                'action_text': notification.action_text,
                'status': notification.status,
                'created_at': notification.created_at,
                'read_at': notification.read_at,
                'expires_at': notification.expires_at,
                'party': {
                    'id': notification.party.id,
                    'title': notification.party.title,
                } if notification.party else None,
                'video': {
                    'id': notification.video.id,
                    'title': notification.video.title,
                    'thumbnail': notification.video.thumbnail.url if notification.video.thumbnail else None,
                } if notification.video else None,
                'related_user': {
                    'id': notification.related_user.id,
                    'username': notification.related_user.username,
                    'name': notification.related_user.get_full_name(),
                    'profile_picture': notification.related_user.profile_picture.url if notification.related_user.profile_picture else None,
                } if notification.related_user else None,
                'metadata': notification.metadata,
            })
        
        # Get unread count
        unread_count = user.notifications.filter(
            Q(is_read=False) & (Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now()))
        ).count()
        
        return StandardResponse.success(
            data={
                'notifications': notifications_data,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': total_count > offset + limit,
                },
                'unread_count': unread_count,
            },
            message=f"Retrieved {len(notifications_data)} notifications"
        )


class NotificationDetailView(APIView):
    """Get, update, or delete a specific notification"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationDetailView GET")
    def get(self, request, notification_id):
        """Get notification details"""
        try:
            notification = Notification.objects.select_related(
                'template', 'party', 'video', 'related_user'
            ).get(id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return StandardResponse.error("Notification not found", status.HTTP_404_NOT_FOUND)
        
        # Auto-mark as read when viewing details
        if not notification.is_read:
            notification.mark_as_read()
        
        notification_data = {
            'id': notification.id,
            'title': notification.title,
            'content': notification.content,
            'html_content': notification.html_content,
            'icon': notification.icon,
            'color': notification.color,
            'priority': notification.priority,
            'is_read': notification.is_read,
            'requires_action': notification.requires_action,
            'action_url': notification.action_url,
            'action_text': notification.action_text,
            'status': notification.status,
            'created_at': notification.created_at,
            'read_at': notification.read_at,
            'expires_at': notification.expires_at,
            'metadata': notification.metadata,
        }
        
        return StandardResponse.success(
            data={'notification': notification_data},
            message="Notification retrieved successfully"
        )
    
    @extend_schema(summary="NotificationDetailView PATCH")
    def patch(self, request, notification_id):
        """Update notification (mark as read/dismissed)"""
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return StandardResponse.error("Notification not found", status.HTTP_404_NOT_FOUND)
        
        is_read = request.data.get('is_read')
        status_update = request.data.get('status')
        
        if is_read is not None:
            if is_read and not notification.is_read:
                notification.mark_as_read()
            elif not is_read and notification.is_read:
                notification.is_read = False
                notification.read_at = None
                notification.save(update_fields=['is_read', 'read_at'])
        
        if status_update in ['dismissed', 'read']:
            notification.status = status_update
            if status_update == 'dismissed':
                notification.is_read = True
                if not notification.read_at:
                    notification.read_at = timezone.now()
            notification.save(update_fields=['status', 'is_read', 'read_at'])
        
        return StandardResponse.success(message="Notification updated successfully")
    
    @extend_schema(summary="NotificationDetailView DELETE")
    def delete(self, request, notification_id):
        """Delete notification"""
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.delete()
            return StandardResponse.success(message="Notification deleted successfully")
        except Notification.DoesNotExist:
            return StandardResponse.error("Notification not found", status.HTTP_404_NOT_FOUND)


class NotificationBulkActionsView(APIView):
    """Bulk actions for notifications"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationBulkActionsView POST")
    def post(self, request):
        """Perform bulk actions on notifications"""
        action = request.data.get('action')
        notification_ids = request.data.get('notification_ids', [])
        
        if not action or not notification_ids:
            return StandardResponse.error("Action and notification_ids are required")
        
        if action not in ['mark_as_read', 'mark_as_unread', 'dismiss', 'delete']:
            return StandardResponse.error("Invalid action")
        
        # Get notifications belonging to the user
        notifications = Notification.objects.filter(
            id__in=notification_ids,
            user=request.user
        )
        
        if not notifications:
            return StandardResponse.error("No valid notifications found")
        
        count = 0
        with transaction.atomic():
            if action == 'mark_as_read':
                for notification in notifications:
                    if not notification.is_read:
                        notification.mark_as_read()
                        count += 1
            
            elif action == 'mark_as_unread':
                notifications.update(
                    is_read=False,
                    read_at=None,
                    status='delivered'
                )
                count = notifications.count()
            
            elif action == 'dismiss':
                notifications.update(
                    status='dismissed',
                    is_read=True,
                    read_at=timezone.now()
                )
                count = notifications.count()
            
            elif action == 'delete':
                count = notifications.count()
                notifications.delete()
        
        return StandardResponse.success(
            data={'affected_count': count},
            message=f"Successfully performed {action} on {count} notifications"
        )


class NotificationPreferencesView(APIView):
    """Manage user notification preferences"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationPreferencesView GET")
    def get(self, request):
        """Get user's notification preferences"""
        user = request.user
        
        # Get all available notification types
        templates = NotificationTemplate.objects.filter(is_active=True)
        
        preferences_data = {}
        for template in templates:
            try:
                pref = NotificationPreference.objects.get(
                    user=user,
                    notification_type=template.notification_type
                )
            except NotificationPreference.DoesNotExist:
                # Create default preferences
                pref = NotificationPreference.objects.create(
                    user=user,
                    notification_type=template.notification_type
                )
            
            preferences_data[template.notification_type] = {
                'display_name': template.get_notification_type_display(),
                'in_app_enabled': pref.in_app_enabled,
                'email_enabled': pref.email_enabled,
                'push_enabled': pref.push_enabled,
                'sms_enabled': pref.sms_enabled,
                'frequency': pref.frequency,
                'quiet_hours_start': pref.quiet_hours_start,
                'quiet_hours_end': pref.quiet_hours_end,
            }
        
        return StandardResponse.success(
            data={'preferences': preferences_data},
            message="Notification preferences retrieved successfully"
        )
    
    @extend_schema(summary="NotificationPreferencesView PUT")
    def put(self, request):
        """Update notification preferences"""
        user = request.user
        preferences_data = request.data.get('preferences', {})
        
        if not preferences_data:
            return StandardResponse.error("Preferences data is required")
        
        updated_count = 0
        with transaction.atomic():
            for notification_type, settings in preferences_data.items():
                pref, created = NotificationPreference.objects.get_or_create(
                    user=user,
                    notification_type=notification_type,
                    defaults=settings
                )
                
                if not created:
                    # Update existing preferences
                    for key, value in settings.items():
                        setattr(pref, key, value)
                    pref.save()
                
                updated_count += 1
        
        return StandardResponse.success(
            data={'updated_count': updated_count},
            message="Notification preferences updated successfully"
        )


class NotificationBatchView(APIView):
    """Manage notification batches (admin only)"""
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(summary="NotificationBatchView GET")
    def get(self, request):
        """Get notification batches"""
        batches = NotificationBatch.objects.all().order_by('-created_at')
        
        batches_data = []
        for batch in batches:
            batches_data.append({
                'id': batch.id,
                'name': batch.name,
                'description': batch.description,
                'status': batch.status,
                'total_recipients': batch.total_recipients,
                'sent_count': batch.sent_count,
                'delivered_count': batch.delivered_count,
                'failed_count': batch.failed_count,
                'scheduled_at': batch.scheduled_at,
                'started_at': batch.started_at,
                'completed_at': batch.completed_at,
                'created_by': {
                    'id': batch.created_by.id,
                    'username': batch.created_by.username,
                },
                'created_at': batch.created_at,
            })
        
        return StandardResponse.success(
            data={'batches': batches_data},
            message=f"Retrieved {len(batches_data)} notification batches"
        )
    
    @extend_schema(summary="NotificationBatchView POST")
    def post(self, request):
        """Create a new notification batch"""
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()
        html_content = request.data.get('html_content', '')
        target_criteria = request.data.get('target_criteria', {})
        scheduled_at = request.data.get('scheduled_at')
        
        if not all([name, title, content]):
            return StandardResponse.error("Name, title, and content are required")
        
        # Parse scheduled_at
        scheduled_datetime = None
        if scheduled_at:
            try:
                scheduled_datetime = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
            except ValueError:
                return StandardResponse.error("Invalid scheduled_at format")
        
        batch = NotificationBatch.objects.create(
            name=name,
            description=description,
            title=title,
            content=content,
            html_content=html_content,
            target_criteria=target_criteria,
            scheduled_at=scheduled_datetime,
            created_by=request.user,
            status='scheduled' if scheduled_datetime else 'draft'
        )
        
        return StandardResponse.success(
            data={'batch_id': batch.id},
            message="Notification batch created successfully"
        )


class NotificationAnalyticsView(APIView):
    """Notification analytics and reporting"""
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(summary="NotificationAnalyticsView GET")
    def get(self, request):
        """Get notification analytics"""
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        notification_type = request.GET.get('type', '')
        
        # Default to last 30 days
        if not date_from:
            date_from = (timezone.now().date() - timedelta(days=30)).isoformat()
        if not date_to:
            date_to = timezone.now().date().isoformat()
        
        # Get analytics data
        analytics_query = NotificationAnalytics.objects.filter(
            date__range=[date_from, date_to]
        )
        
        if notification_type:
            analytics_query = analytics_query.filter(notification_type=notification_type)
        
        analytics = analytics_query.order_by('-date')
        
        # Calculate summary statistics
        total_sent = sum(a.total_sent for a in analytics)
        total_delivered = sum(a.total_delivered for a in analytics)
        total_failed = sum(a.total_failed for a in analytics)
        total_read = sum(a.total_read for a in analytics)
        
        delivery_rate = (total_delivered / total_sent * 100) if total_sent > 0 else 0
        read_rate = (total_read / total_delivered * 100) if total_delivered > 0 else 0
        failure_rate = (total_failed / total_sent * 100) if total_sent > 0 else 0
        
        # Get channel breakdown
        channel_stats = {
            'in_app': sum(a.in_app_sent for a in analytics),
            'email': sum(a.email_sent for a in analytics),
            'push': sum(a.push_sent for a in analytics),
            'sms': sum(a.sms_sent for a in analytics),
        }
        
        # Prepare daily data
        daily_data = []
        for analytic in analytics:
            daily_data.append({
                'date': analytic.date,
                'total_sent': analytic.total_sent,
                'total_delivered': analytic.total_delivered,
                'total_failed': analytic.total_failed,
                'total_read': analytic.total_read,
                'delivery_rate': analytic.delivery_rate,
                'read_rate': analytic.read_rate,
                'avg_delivery_time_seconds': analytic.avg_delivery_time_seconds,
                'avg_read_time_minutes': analytic.avg_read_time_minutes,
            })
        
        return StandardResponse.success(
            data={
                'summary': {
                    'total_sent': total_sent,
                    'total_delivered': total_delivered,
                    'total_failed': total_failed,
                    'total_read': total_read,
                    'delivery_rate': round(delivery_rate, 2),
                    'read_rate': round(read_rate, 2),
                    'failure_rate': round(failure_rate, 2),
                },
                'channel_breakdown': channel_stats,
                'daily_analytics': daily_data,
                'date_range': {
                    'from': date_from,
                    'to': date_to,
                }
            },
            message="Notification analytics retrieved successfully"
        )


class PushSubscriptionView(APIView):
    """Manage push notification subscriptions"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="PushSubscriptionView POST")
    def post(self, request):
        """Register push notification subscription"""
        endpoint = request.data.get('endpoint')
        p256dh_key = request.data.get('keys', {}).get('p256dh')
        auth_key = request.data.get('keys', {}).get('auth')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        if not all([endpoint, p256dh_key, auth_key]):
            return StandardResponse.error("Endpoint and keys are required")
        
        # Create or update subscription
        subscription, created = PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=endpoint,
            defaults={
                'p256dh_key': p256dh_key,
                'auth_key': auth_key,
                'user_agent': user_agent,
                'is_active': True,
            }
        )
        
        return StandardResponse.success(
            data={'subscription_id': subscription.id},
            message="Push subscription registered successfully"
        )
    
    @extend_schema(summary="PushSubscriptionView DELETE")
    def delete(self, request):
        """Remove push notification subscription"""
        endpoint = request.data.get('endpoint')
        
        if not endpoint:
            return StandardResponse.error("Endpoint is required")
        
        try:
            subscription = PushSubscription.objects.get(
                user=request.user,
                endpoint=endpoint
            )
            subscription.delete()
            return StandardResponse.success(message="Push subscription removed successfully")
        except PushSubscription.DoesNotExist:
            return StandardResponse.error("Subscription not found", status.HTTP_404_NOT_FOUND)
