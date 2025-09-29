"""
Celery beat schedule for periodic tasks
"""

from celery import Celery
from celery.schedules import crontab

app = Celery('config')

app.conf.beat_schedule = {
    # Send party reminders every 30 minutes
    'send-party-reminders': {
        'task': 'apps.parties.tasks.send_party_reminders_batch',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
    },
    
    # Clean up expired sessions every hour
    'cleanup-sessions': {
        'task': 'shared.background_tasks.cleanup_expired_data',
        'schedule': crontab(minute=0),  # Every hour
    },
    
    # Generate daily analytics reports
    'daily-analytics': {
        'task': 'apps.analytics.tasks.generate_daily_reports',
        'schedule': crontab(hour=6, minute=0),  # 6 AM daily
    },
    
    # Clean up old analytics events
    'cleanup-old-analytics': {
        'task': 'apps.analytics.tasks.cleanup_old_analytics',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
    
    # Check for inactive parties and clean up 
    'cleanup-inactive-parties': {
        'task': 'apps.parties.tasks.cleanup_inactive_parties',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    
    # Process video uploads and cleanup failed uploads
    'process-video-cleanup': {
        'task': 'apps.videos.tasks.cleanup_failed_uploads',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    
    # Update user analytics
    'update-user-analytics': {
        'task': 'apps.analytics.tasks.calculate_user_metrics',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
}

app.conf.timezone = 'UTC'
