"""Test package bootstrap helpers for pytest and Django."""

import os

import django
from django.apps import apps as django_apps

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.testing')

if not django_apps.ready:
    django.setup()
