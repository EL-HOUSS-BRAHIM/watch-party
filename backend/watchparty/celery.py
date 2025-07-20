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

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
