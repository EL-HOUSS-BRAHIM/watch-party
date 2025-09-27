"""
Celery beat schedule for periodic tasks
"""

from celery import Celery
from celery.schedules import crontab

app = Celery('watchparty')

app.conf.beat_schedule = {
    # Send party reminders every 5 minutes
    'send-party-reminders': {
        'task': 'utils.email_service.schedule_party_reminders',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    
    # Clean up expired sessions every hour
    'cleanup-sessions': {
        'task': 'watchparty.tasks.cleanup_expired_sessions',
        'schedule': crontab(minute=0),  # Every hour
    },
    
    # Generate daily analytics reports
    'daily-analytics': {
        'task': 'apps.analytics.tasks.generate_daily_report',
        'schedule': crontab(hour=6, minute=0),  # 6 AM daily
    },
    
    # Clean up old analytics events
    'cleanup-old-analytics': {
        'task': 'apps.analytics.tasks.cleanup_old_events',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
    
    # Check for inactive parties and clean up
    'cleanup-inactive-parties': {
        'task': 'apps.parties.tasks.cleanup_inactive_parties',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    
    # Process video uploads and thumbnails
    'process-video-uploads': {
        'task': 'apps.videos.tasks.process_pending_videos',
        'schedule': crontab(minute='*/2'),  # Every 2 minutes
    },
    
    # Update user analytics
    'update-user-analytics': {
        'task': 'apps.analytics.tasks.update_user_analytics',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
}

app.conf.timezone = 'UTC'
