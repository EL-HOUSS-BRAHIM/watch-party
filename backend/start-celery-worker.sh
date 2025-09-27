cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec celery -A config worker -l info --concurrency=1
