"""
Celery configuration for Watch Party Backend
"""

import os
from celery import Celery
from django.conf import settings

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')

app = Celery('watchparty')

# Load settings from Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Import beat schedule if available
try:
    from .beat_schedule import app as beat_app
    app.conf.update(beat_app.conf)
except ImportError:
    pass

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
    
@app.task
def test_task():
    """Simple test task"""
    return "Test task completed successfully"
