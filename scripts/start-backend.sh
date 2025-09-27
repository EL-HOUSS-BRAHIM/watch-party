#!/bin/bash
set -e

cd $(dirname $0)/../backend

echo "Starting backend development server..."
source venv/bin/activate
set -a && source .env && set +a
python manage.py runserver 127.0.0.1:8001
