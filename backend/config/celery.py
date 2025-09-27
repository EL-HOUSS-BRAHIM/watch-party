"""Celery configuration for Watch Party Backend with instrumentation hooks."""

import os
from celery import Celery
from celery.signals import task_failure, task_postrun, task_prerun

from shared.observability import observability

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

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


def _resolve_task_name(sender, task):
    if sender is not None:
        return getattr(sender, "name", str(sender))
    if task is not None:
        return getattr(task, "name", task.__class__.__name__)
    return "unknown"


def instrument_task_prerun(sender=None, task_id=None, task=None, **kwargs):
    """Record the start of a Celery task via the observability collector."""

    task_name = _resolve_task_name(sender, task)
    queue = None
    request = getattr(task, "request", None)
    if request is not None:
        delivery_info = getattr(request, "delivery_info", None) or {}
        queue = delivery_info.get("routing_key")

    observability.begin_task(task_id=task_id, task_name=task_name, queue=queue)


def instrument_task_postrun(sender=None, task_id=None, task=None, retval=None, state=None, **kwargs):
    """Record successful task completion metrics."""

    task_name = _resolve_task_name(sender, task)
    status = state or "SUCCESS"
    observability.complete_task(task_id=task_id, status=status, result=retval or task_name)


def instrument_task_failure(sender=None, task_id=None, exception=None, **kwargs):
    """Record failed task metrics and error details."""

    if exception is None:
        return
    observability.fail_task(task_id=task_id, exception=exception)


task_prerun.connect(instrument_task_prerun, weak=False)
task_postrun.connect(instrument_task_postrun, weak=False)
task_failure.connect(instrument_task_failure, weak=False)


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
    
@app.task
def test_task():
    """Simple test task"""
    return "Test task completed successfully"
