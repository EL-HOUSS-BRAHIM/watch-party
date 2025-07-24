"""
Background tasks for the Watch Party platform
"""

from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_sessions():
    """Clean up expired user sessions"""
    try:
        call_command('clearsessions')
        logger.info("Expired sessions cleaned up successfully")
        return "Sessions cleaned"
    except Exception as e:
        logger.error(f"Failed to clean up sessions: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def send_test_email():
    """Test task to verify Celery is working"""
    from utils.email_service import EmailService
    
    email_service = EmailService()
    # This is just a test - in production you'd have proper recipients
    logger.info("Test Celery task executed successfully")
    return "Test email task completed"


@shared_task
def health_check():
    """Periodic health check task"""
    from django.db import connection
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        logger.info("Health check passed - database connection OK")
        return "Health check passed"
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return f"Health check failed: {str(e)}"
