"""
Notification service for Watch Party Backend
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from apps.notifications.models import (
    Notification, NotificationTemplate, NotificationChannel, PushSubscription
)

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications and delivery"""
    
    def __init__(self):
        self.logger = logger
    
    def send_notification(
        self, 
        user: User, 
        notification_type: str, 
        context: Dict[str, Any] = None,
        channels: List[str] = None
    ) -> Notification:
        """
        Send a notification to a user through specified channels
        
        Args:
            user: Target user
            notification_type: Type of notification
            context: Template context variables
            channels: List of delivery channels ('in_app', 'email', 'push')
        
        Returns:
            Created notification instance
        """
        try:
            # Get notification template
            template = NotificationTemplate.objects.get(
                notification_type=notification_type
            )
            
            # Get user's notification preferences
            user_channels = self._get_user_notification_channels(user, notification_type)
            
            # Use provided channels or user preferences
            if channels is None:
                channels = user_channels
            
            # Render notification content
            content = self._render_notification_content(template, context or {})
            
            # Create in-app notification
            notification = Notification.objects.create(
                user=user,
                notification_type=notification_type,
                title=content['title'],
                content=content['content'],
                metadata=context or {},
                channels_sent=channels
            )
            
            # Send through requested channels
            if 'email' in channels:
                self._send_email_notification(user, template, content, context or {})
            
            if 'push' in channels:
                self._send_push_notification(user, content)
            
            self.logger.info(f"Notification sent to user {user.id}: {notification_type}")
            return notification
            
        except NotificationTemplate.DoesNotExist:
            self.logger.error(f"Notification template not found: {notification_type}")
            raise
        except Exception as e:
            self.logger.error(f"Failed to send notification: {str(e)}")
            raise
    
    def send_bulk_notification(
        self,
        users: List[User],
        notification_type: str,
        context: Dict[str, Any] = None,
        channels: List[str] = None
    ) -> List[Notification]:
        """Send notifications to multiple users"""
        notifications = []
        
        for user in users:
            try:
                notification = self.send_notification(
                    user=user,
                    notification_type=notification_type,
                    context=context,
                    channels=channels
                )
                notifications.append(notification)
            except Exception as e:
                self.logger.error(f"Failed to send notification to user {user.id}: {str(e)}")
                continue
        
        return notifications
    
    def send_friend_request_notification(self, requester: User, addressee: User) -> Notification:
        """Send friend request notification"""
        context = {
            'requester_name': requester.get_full_name() or requester.username,
            'requester_username': requester.username,
            'requester_id': str(requester.id)
        }
        
        return self.send_notification(
            user=addressee,
            notification_type='friend_request',
            context=context
        )
    
    def send_party_invitation(self, party, inviter: User, invitee: User) -> Notification:
        """Send party invitation notification"""
        context = {
            'party_title': party.title,
            'party_id': str(party.id),
            'inviter_name': inviter.get_full_name() or inviter.username,
            'scheduled_start': party.scheduled_start.isoformat() if party.scheduled_start else None
        }
        
        return self.send_notification(
            user=invitee,
            notification_type='party_invite',
            context=context
        )
    
    def send_party_started_notification(self, party) -> List[Notification]:
        """Send party started notifications to all participants"""
        participants = party.participants.all()
        context = {
            'party_title': party.title,
            'party_id': str(party.id),
            'host_name': party.host.get_full_name() or party.host.username
        }
        
        return self.send_bulk_notification(
            users=participants,
            notification_type='party_started',
            context=context
        )
    
    def send_video_processed_notification(self, video, user: User) -> Notification:
        """Send video processing completion notification"""
        context = {
            'video_title': video.title,
            'video_id': str(video.id),
            'processing_duration': getattr(video, 'processing_duration', None)
        }
        
        return self.send_notification(
            user=user,
            notification_type='video_processed',
            context=context
        )
    
    def send_subscription_expiring_notification(self, user: User, days_remaining: int) -> Notification:
        """Send subscription expiring notification"""
        context = {
            'days_remaining': days_remaining,
            'user_name': user.get_full_name() or user.username
        }
        
        return self.send_notification(
            user=user,
            notification_type='subscription_expiring',
            context=context,
            channels=['email', 'in_app']  # Force important notifications
        )
    
    def send_payment_failed_notification(self, user: User, amount: str) -> Notification:
        """Send payment failed notification"""
        context = {
            'amount': amount,
            'user_name': user.get_full_name() or user.username
        }
        
        return self.send_notification(
            user=user,
            notification_type='payment_failed',
            context=context,
            channels=['email', 'in_app']  # Force important notifications
        )
    
    def _get_user_notification_channels(self, user: User, notification_type: str) -> List[str]:
        """Get user's preferred notification channels for a specific type"""
        try:
            channel_prefs = NotificationChannel.objects.get(user=user)
            preferences = channel_prefs.preferences or {}
            
            # Default channels if not specified
            default_channels = ['in_app']
            
            # Get type-specific preferences
            type_prefs = preferences.get(notification_type, {})
            
            channels = []
            if type_prefs.get('in_app', True):
                channels.append('in_app')
            if type_prefs.get('email', False):
                channels.append('email')
            if type_prefs.get('push', False):
                channels.append('push')
            
            return channels if channels else default_channels
            
        except NotificationChannel.DoesNotExist:
            # Create default preferences
            NotificationChannel.objects.create(
                user=user,
                preferences={
                    notification_type: {
                        'in_app': True,
                        'email': False,
                        'push': False
                    }
                }
            )
            return ['in_app']
    
    def _render_notification_content(
        self, 
        template: NotificationTemplate, 
        context: Dict[str, Any]
    ) -> Dict[str, str]:
        """Render notification content using template"""
        from django.template import Template, Context
        
        # Add current timestamp to context
        context.update({
            'timestamp': timezone.now(),
            'app_name': getattr(settings, 'APP_NAME', 'Watch Party')
        })
        
        # Render title and content
        title_template = Template(template.title_template)
        content_template = Template(template.content_template)
        
        rendered_context = Context(context)
        
        return {
            'title': title_template.render(rendered_context),
            'content': content_template.render(rendered_context),
            'email_subject': template.email_subject_template,
            'email_content': template.email_content_template
        }
    
    def _send_email_notification(
        self, 
        user: User, 
        template: NotificationTemplate, 
        content: Dict[str, str],
        context: Dict[str, Any]
    ):
        """Send email notification"""
        if not template.email_subject_template or not template.email_content_template:
            return
        
        try:
            from django.template import Template, Context
            
            # Render email content
            email_subject_template = Template(template.email_subject_template)
            email_content_template = Template(template.email_content_template)
            
            rendered_context = Context(context)
            
            subject = email_subject_template.render(rendered_context)
            message = email_content_template.render(rendered_context)
            
            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
            
            self.logger.info(f"Email notification sent to {user.email}")
            
        except Exception as e:
            self.logger.error(f"Failed to send email notification: {str(e)}")
    
    def _send_push_notification(self, user: User, content: Dict[str, str]):
        """Send push notification using Firebase Cloud Messaging"""
        try:
            from services.mobile_push_service import mobile_push_service
            
            # Check if user has push notifications enabled
            preferences = user.notification_preferences
            if not preferences.push_enabled:
                return
            
            # Extract notification data
            title = content.get('title', 'Watch Party')
            body = content.get('content', '')
            
            # Prepare data payload
            data = {
                'notification_type': content.get('notification_type', 'general'),
                'timestamp': timezone.now().isoformat()
            }
            
            # Add context data if available
            if 'context' in content:
                context = content['context']
                if isinstance(context, dict):
                    data.update(context)
            
            # Send push notification
            result = mobile_push_service.send_to_user(
                user=user,
                title=title,
                body=body,
                data=data,
                action_url=content.get('action_url')
            )
            
            self.logger.info(f"Push notification sent to {user.username}: {result}")
            
        except Exception as e:
            self.logger.error(f"Failed to send push notification: {str(e)}")
    
    def mark_notification_read(self, notification_id: str, user: User) -> bool:
        """Mark a notification as read"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            return True
            
        except Notification.DoesNotExist:
            return False
    
    def mark_all_notifications_read(self, user: User) -> int:
        """Mark all user's notifications as read"""
        count = Notification.objects.filter(
            user=user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return count
    
    def get_unread_count(self, user: User) -> int:
        """Get count of unread notifications for user"""
        return Notification.objects.filter(
            user=user,
            is_read=False
        ).count()
    
    def cleanup_old_notifications(self, days: int = 30) -> int:
        """Clean up old read notifications"""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        count, _ = Notification.objects.filter(
            is_read=True,
            read_at__lt=cutoff_date
        ).delete()
        
        self.logger.info(f"Cleaned up {count} old notifications")
        return count


# Create singleton instance
notification_service = NotificationService()
