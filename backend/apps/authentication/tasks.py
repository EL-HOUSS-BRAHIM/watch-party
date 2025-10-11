"""
Celery tasks for authentication app
"""

from celery import shared_task
from django.utils import timezone
from django.db.models import Q

from .models import UserSession, EmailVerification, PasswordReset


@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired user sessions
    Runs periodically to remove expired session records from the database
    """
    try:
        # Delete expired sessions
        deleted_count, _ = UserSession.objects.filter(
            Q(expires_at__lt=timezone.now()) | Q(is_active=False)
        ).delete()
        
        print(f"Cleaned up {deleted_count} expired/inactive user sessions")
        return {
            'success': True,
            'deleted_count': deleted_count,
            'message': f'Successfully cleaned up {deleted_count} sessions'
        }
    except Exception as e:
        print(f"Error cleaning up sessions: {e}")
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def cleanup_expired_tokens():
    """
    Clean up expired email verification and password reset tokens
    """
    try:
        # Delete expired email verifications
        email_deleted, _ = EmailVerification.objects.filter(
            Q(expires_at__lt=timezone.now()) | Q(is_verified=True)
        ).delete()
        
        # Delete expired password resets
        password_deleted, _ = PasswordReset.objects.filter(
            Q(expires_at__lt=timezone.now()) | Q(is_used=True)
        ).delete()
        
        print(f"Cleaned up {email_deleted} email verifications and {password_deleted} password resets")
        return {
            'success': True,
            'email_verifications_deleted': email_deleted,
            'password_resets_deleted': password_deleted,
            'message': f'Successfully cleaned up {email_deleted + password_deleted} tokens'
        }
    except Exception as e:
        print(f"Error cleaning up tokens: {e}")
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def cleanup_inactive_sessions():
    """
    Clean up sessions that have been inactive for more than 30 days
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=30)
        
        deleted_count, _ = UserSession.objects.filter(
            updated_at__lt=cutoff_date,
            is_active=False
        ).delete()
        
        print(f"Cleaned up {deleted_count} inactive sessions older than 30 days")
        return {
            'success': True,
            'deleted_count': deleted_count,
            'message': f'Successfully cleaned up {deleted_count} inactive sessions'
        }
    except Exception as e:
        print(f"Error cleaning up inactive sessions: {e}")
        return {
            'success': False,
            'error': str(e)
        }
