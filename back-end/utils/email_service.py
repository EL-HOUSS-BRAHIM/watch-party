"""
Enhanced email service for Watch Party Platform
Phase 2 implementation with template support and advanced features
"""

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from typing import Dict, List, Optional, Any
import logging
from datetime import timedelta
from celery import shared_task

logger = logging.getLogger(__name__)


class EmailService:
    """Enhanced email service with template support and analytics"""
    
    def __init__(self):
        self.from_email = settings.DEFAULT_FROM_EMAIL
        self.base_context = {
            'site_url': getattr(settings, 'SITE_URL', 'https://watchparty.com'),
            'support_url': getattr(settings, 'SUPPORT_URL', 'https://watchparty.com/support'),
            'privacy_url': getattr(settings, 'PRIVACY_URL', 'https://watchparty.com/privacy'),
            'unsubscribe_url': 'https://watchparty.com/unsubscribe',
            'twitter_url': 'https://twitter.com/watchparty',
            'discord_url': 'https://discord.gg/watchparty',
            'github_url': 'https://github.com/watchparty/watchparty',
        }
    
    def send_templated_email(
        self,
        template_name: str,
        to_email: str,
        subject: str,
        context: Dict[str, Any] = None,
        from_email: str = None,
        priority: str = 'normal',
        track_opens: bool = True,
        track_clicks: bool = True
    ) -> bool:
        """
        Send templated email with enhanced features
        
        Args:
            template_name: Template name (without .html extension)
            to_email: Recipient email address
            subject: Email subject
            context: Template context variables
            from_email: Sender email (defaults to settings)
            priority: Email priority (high, normal, low)
            track_opens: Enable open tracking
            track_clicks: Enable click tracking
        """
        try:
            # Prepare context
            email_context = {**self.base_context}
            if context:
                email_context.update(context)
            
            # Generate unsubscribe token
            email_context['unsubscribe_token'] = self._generate_unsubscribe_token(to_email)
            
            # Render templates
            html_template = f'emails/{template_name}.html'
            text_template = f'emails/{template_name}.txt'
            
            html_content = render_to_string(html_template, email_context)
            
            # Try to render text version, fallback if not found
            try:
                text_content = render_to_string(text_template, email_context)
            except:
                text_content = self._html_to_text(html_content)
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email or self.from_email,
                to=[to_email]
            )
            
            email.attach_alternative(html_content, "text/html")
            
            # Add tracking headers
            if track_opens:
                email.extra_headers['X-Track-Opens'] = '1'
            if track_clicks:
                email.extra_headers['X-Track-Clicks'] = '1'
                
            # Set priority
            priority_map = {'high': '1', 'normal': '3', 'low': '5'}
            email.extra_headers['X-Priority'] = priority_map.get(priority, '3')
            
            # Send email
            result = email.send()
            
            # Log email send
            self._log_email_send(to_email, template_name, subject, result > 0)
            
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, user) -> bool:
        """Send welcome email to new user"""
        context = {
            'user': user,
            'dashboard_url': f"{self.base_context['site_url']}/dashboard",
            'help_url': f"{self.base_context['site_url']}/help",
        }
        
        return self.send_templated_email(
            template_name='welcome',
            to_email=user.email,
            subject=f'Welcome to Watch Party, {user.first_name or user.username}! 🎬',
            context=context,
            priority='high'
        )
    
    def send_party_invitation(self, invitation, party, inviter) -> bool:
        """Send party invitation email"""
        context = {
            'invitation': invitation,
            'party': party,
            'inviter': inviter,
            'join_url': f"{self.base_context['site_url']}/join/{party.party_code}?token={invitation.token}",
            'decline_url': f"{self.base_context['site_url']}/decline/{invitation.id}?token={invitation.token}",
        }
        
        return self.send_templated_email(
            template_name='party_invitation',
            to_email=invitation.email,
            subject=f'🎉 You\'re invited to "{party.title}" watch party!',
            context=context,
            priority='high'
        )
    
    def send_party_starting_reminder(self, party, user) -> bool:
        """Send party starting soon reminder"""
        time_until_start = party.scheduled_start_time - timezone.now()
        time_until_str = self._format_timedelta(time_until_start)
        
        context = {
            'party': party,
            'user': user,
            'time_until_start': time_until_str,
            'join_url': f"{self.base_context['site_url']}/party/{party.party_code}",
        }
        
        return self.send_templated_email(
            template_name='party_starting',
            to_email=user.email,
            subject=f'🚨 "{party.title}" starts in {time_until_str}!',
            context=context,
            priority='high'
        )
    
    def send_party_ended_summary(self, party, user, stats) -> bool:
        """Send party summary after it ends"""
        context = {
            'party': party,
            'user': user,
            'stats': stats,
            'dashboard_url': f"{self.base_context['site_url']}/dashboard",
        }
        
        return self.send_templated_email(
            template_name='party_summary',
            to_email=user.email,
            subject=f'📊 Your "{party.title}" party summary',
            context=context,
            priority='normal'
        )
    
    def send_friend_request_notification(self, friend_request, recipient) -> bool:
        """Send friend request notification"""
        context = {
            'friend_request': friend_request,
            'sender': friend_request.sender,
            'recipient': recipient,
            'accept_url': f"{self.base_context['site_url']}/friends/accept/{friend_request.id}",
            'decline_url': f"{self.base_context['site_url']}/friends/decline/{friend_request.id}",
        }
        
        return self.send_templated_email(
            template_name='friend_request',
            to_email=recipient.email,
            subject=f'👋 {friend_request.sender.first_name or friend_request.sender.username} wants to be friends!',
            context=context,
            priority='normal'
        )
    
    def _generate_unsubscribe_token(self, email: str) -> str:
        """Generate unsubscribe token for email"""
        import hashlib
        import hmac
        
        secret = settings.SECRET_KEY.encode('utf-8')
        message = email.encode('utf-8')
        return hmac.new(secret, message, hashlib.sha256).hexdigest()[:16]
    
    def _html_to_text(self, html_content: str) -> str:
        """Convert HTML to plain text (basic implementation)"""
        import re
        
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', html_content)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _format_timedelta(self, td: timedelta) -> str:
        """Format timedelta for human reading"""
        total_seconds = int(td.total_seconds())
        
        if total_seconds < 60:
            return f"{total_seconds} seconds"
        elif total_seconds < 3600:
            minutes = total_seconds // 60
            return f"{minutes} minute{'s' if minutes != 1 else ''}"
        else:
            hours = total_seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''}"
    
    def _log_email_send(self, to_email: str, template: str, subject: str, success: bool):
        """Log email send for analytics"""
        from apps.analytics.models import AnalyticsEvent
        
        try:
            AnalyticsEvent.objects.create(
                event_type='email_sent' if success else 'email_failed',
                metadata={
                    'to_email': to_email,
                    'template': template,
                    'subject': subject,
                    'timestamp': timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.warning(f"Failed to log email send: {str(e)}")


# Celery tasks for async email sending
@shared_task(bind=True, max_retries=3)
def send_welcome_email_task(self, user_id):
    """Async task to send welcome email"""
    try:
        from apps.authentication.models import User
        user = User.objects.get(id=user_id)
        
        email_service = EmailService()
        success = email_service.send_welcome_email(user)
        
        if not success:
            raise Exception("Failed to send welcome email")
            
        return f"Welcome email sent to {user.email}"
        
    except Exception as exc:
        logger.error(f"Welcome email task failed: {str(exc)}")
        self.retry(countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_party_invitation_task(self, invitation_id):
    """Async task to send party invitation email"""
    try:
        from apps.parties.models import PartyInvitation
        invitation = PartyInvitation.objects.select_related('party', 'inviter').get(id=invitation_id)
        
        email_service = EmailService()
        success = email_service.send_party_invitation(
            invitation, invitation.party, invitation.inviter
        )
        
        if not success:
            raise Exception("Failed to send party invitation email")
            
        return f"Party invitation sent to {invitation.email}"
        
    except Exception as exc:
        logger.error(f"Party invitation task failed: {str(exc)}")
        self.retry(countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_party_reminder_task(self, party_id, user_id):
    """Async task to send party starting reminder"""
    try:
        from apps.parties.models import WatchParty
        from apps.authentication.models import User
        
        party = WatchParty.objects.get(id=party_id)
        user = User.objects.get(id=user_id)
        
        email_service = EmailService()
        success = email_service.send_party_starting_reminder(party, user)
        
        if not success:
            raise Exception("Failed to send party reminder email")
            
        return f"Party reminder sent to {user.email}"
        
    except Exception as exc:
        logger.error(f"Party reminder task failed: {str(exc)}")
        self.retry(countdown=60 * (2 ** self.request.retries))


# Scheduled task to send party reminders
@shared_task
def schedule_party_reminders():
    """Send reminders for parties starting soon"""
    from apps.parties.models import WatchParty
    
    # Find parties starting in 15 minutes
    reminder_time = timezone.now() + timedelta(minutes=15)
    upcoming_parties = WatchParty.objects.filter(
        scheduled_start_time__range=(
            reminder_time - timedelta(minutes=5),
            reminder_time + timedelta(minutes=5)
        ),
        status='scheduled'
    )
    
    sent_count = 0
    
    for party in upcoming_parties:
        # Send reminders to all participants
        participants = party.participants.all()
        
        for participant in participants:
            # Check if user wants email reminders
            if hasattr(participant, 'notification_preferences'):
                prefs = participant.notification_preferences
                if prefs.email_party_reminders:
                    send_party_reminder_task.delay(party.id, participant.id)
                    sent_count += 1
    
    logger.info(f"Scheduled {sent_count} party reminder emails")
    return sent_count
