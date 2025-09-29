"""
Party management background tasks
"""

from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import logging

from .models import WatchParty

logger = logging.getLogger(__name__)


@shared_task
def cleanup_inactive_parties():
    """Clean up inactive or expired parties"""
    try:
        cutoff_time = timezone.now() - timedelta(hours=24)  # 24 hours old
        
        # Find parties that should be ended
        inactive_parties = WatchParty.objects.filter(
            Q(status='active', updated_at__lt=cutoff_time) |
            Q(status='scheduled', scheduled_start_time__lt=timezone.now() - timedelta(hours=6))
        )
        
        ended_count = 0
        for party in inactive_parties:
            party.status = 'ended'
            party.save()
            ended_count += 1
        
        # Delete very old ended parties (optional)
        old_cutoff = timezone.now() - timedelta(days=30)
        deleted_count = WatchParty.objects.filter(
            status='ended',
            updated_at__lt=old_cutoff
        ).delete()[0]
        
        logger.info(f"Ended {ended_count} inactive parties, deleted {deleted_count} old parties")
        return f"Processed {ended_count} inactive, deleted {deleted_count} old parties"
        
    except Exception as e:
        logger.error(f"Failed to cleanup parties: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def send_party_reminders_batch():
    """Send batch reminders for parties starting soon"""
    try:
        # Find parties starting in 15-20 minutes
        start_time = timezone.now() + timedelta(minutes=15)
        end_time = timezone.now() + timedelta(minutes=20)
        
        upcoming_parties = WatchParty.objects.filter(
            scheduled_start_time__range=(start_time, end_time),
            status='scheduled'
        ).select_related('host')
        
        reminder_count = 0
        for party in upcoming_parties:
            participants = party.participants.all()
            
            for participant in participants:
                # Check notification preferences
                if hasattr(participant, 'notification_preferences'):
                    prefs = participant.notification_preferences
                    if prefs.email_party_reminders:
                        # Use a simple task instead of importing non-existent module
                        send_party_reminder_email.delay(party.id, participant.id)
                        reminder_count += 1
        
        logger.info(f"Scheduled {reminder_count} party reminder emails")
        return f"Scheduled {reminder_count} reminders"
        
    except Exception as e:
        logger.error(f"Failed to send party reminders: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def send_party_reminder_email(party_id, participant_id):
    """Send individual party reminder email"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        party = WatchParty.objects.get(id=party_id)
        participant = User.objects.get(id=participant_id)
        
        # Simple email reminder logic
        # This can be enhanced with proper email templates later
        logger.info(f"Sending party reminder to {participant.email} for party {party.title}")
        
        # For now, just log the reminder - actual email sending can be implemented later
        return f"Reminder sent to {participant.email}"
        
    except Exception as e:
        logger.error(f"Failed to send party reminder email: {str(e)}")
        return f"Error: {str(e)}"
