"""
Analytics background tasks
"""

from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
import logging

from .models import UserAnalytics, PartyAnalytics, AnalyticsEvent

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def generate_daily_report():
    """Generate daily analytics report"""
    try:
        yesterday = timezone.now().date() - timedelta(days=1)
        
        # Calculate daily metrics
        daily_active_users = User.objects.filter(
            last_login__date=yesterday
        ).count()
        
        parties_created = AnalyticsEvent.objects.filter(
            event_type='party_created',
            timestamp__date=yesterday
        ).count()
        
        total_watch_time = AnalyticsEvent.objects.filter(
            event_type='video_watch',
            timestamp__date=yesterday
        ).count() * 30  # Approximate 30 min average
        
        # Store or send report
        logger.info(f"Daily report for {yesterday}: {daily_active_users} DAU, {parties_created} parties, {total_watch_time} min watched")
        
        return f"Daily report generated for {yesterday}"
        
    except Exception as e:
        logger.error(f"Failed to generate daily report: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def cleanup_old_events():
    """Clean up old analytics events"""
    try:
        cutoff_date = timezone.now() - timedelta(days=90)  # Keep 90 days
        
        deleted_count = AnalyticsEvent.objects.filter(
            timestamp__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old analytics events")
        return f"Cleaned up {deleted_count} events"
        
    except Exception as e:
        logger.error(f"Failed to clean up old events: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def update_user_analytics():
    """Update user analytics data"""
    try:
        # Update analytics for active users in the last hour
        recent_active_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(hours=1)
        )
        
        updated_count = 0
        for user in recent_active_users:
            analytics, created = UserAnalytics.objects.get_or_create(user=user)
            
            # Update metrics based on recent activity
            analytics.last_updated = timezone.now()
            analytics.save()
            
            updated_count += 1
        
        logger.info(f"Updated analytics for {updated_count} users")
        return f"Updated {updated_count} user analytics"
        
    except Exception as e:
        logger.error(f"Failed to update user analytics: {str(e)}")
        return f"Error: {str(e)}"
