#!/usr/bin/env bash
set -euo pipefail

python manage.py migrate --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120