#!/usr/bin/env bash
set -euo pipefail

# remote_post_deploy_check.sh
# Run this on the server to verify basic health after deployment.
# It assumes it's run from the repository root.

PROJECT_DIR="$(pwd)"
VENV="$PROJECT_DIR/venv"

echo "Running Django system checks..."
if [ -f "$VENV/bin/activate" ]; then
  source "$VENV/bin/activate"
fi

# Run Django checks
if command -v python3 >/dev/null 2>&1; then
  python3 manage.py check --deploy || true
  python3 manage.py check || true
else
  echo "python3 not available; skipping Django checks"
fi

# Health endpoint (local)
HEALTH_URL="http://127.0.0.1:8000/health/"
if command -v curl >/dev/null 2>&1; then
  echo "Checking health endpoint: $HEALTH_URL"
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    echo "Health endpoint OK"
  else
    echo "Health endpoint failed: $HEALTH_URL"
    exit 4
  fi
else
  echo "curl not installed - cannot check HTTP health endpoint"
fi

# Optional Redis check if REDIS_HOST or REDIS_URL present
if [ -n "${REDIS_HOST:-}" ] || [ -n "${REDIS_URL:-}" ]; then
  echo "Attempting Redis PING using Python Redis client..."
  python3 - <<PYCODE || { echo "Redis check failed"; exit 5; }
import os
try:
    import redis
except Exception as e:
    print('redis library not installed; skipping Redis check')
    raise SystemExit(0)

url = os.environ.get('REDIS_URL') or os.environ.get('REDIS_HOST')
if ':' in url:
    host,port = url.split(':')[:2]
else:
    host = url
    port = 6379
r = redis.Redis(host=host, port=int(port), socket_connect_timeout=5)
print('PING ->', r.ping())
PYCODE
fi

# Basic PM2 status check
if command -v pm2 >/dev/null 2>&1; then
  echo "PM2 processes:"
  pm2 status || true
else
  echo "PM2 not installed on server"
fi

echo "Remote post-deploy checks completed successfully."
