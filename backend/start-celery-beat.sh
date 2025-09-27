cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
