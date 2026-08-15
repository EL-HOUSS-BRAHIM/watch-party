#!/usr/bin/env bash
set -euo pipefail

python -m pip install --upgrade pip
pip install -r requirements/production.txt
python manage.py collectstatic --noinput