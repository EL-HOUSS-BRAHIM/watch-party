"""Ensure Django is configured before importing analytics tests.

Pytest collects tests from the ``apps`` package directly, which means the
bootstrap logic that lives in the top-level ``tests`` package is bypassed for
these modules.  When the test runner tries to import the DRF ``APITestCase``
without Django being set up we get an ``ImproperlyConfigured`` error.  To keep
the analytics regression tests self-contained we mirror the bootstrap logic
here so that Django is always configured prior to importing the test modules.
"""

import importlib
import os
import sys
from pathlib import Path

import django
from django.apps import apps as django_apps
from django.core.management import call_command
from django.db import connections

BASE_DIR = Path(__file__).resolve().parents[3]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.testing')

if not django_apps.ready:
    django.setup()

default_connection = connections['default']
existing_tables = set(default_connection.introspection.table_names())

if 'authentication_user' not in existing_tables:
    call_command('migrate', run_syncdb=True, interactive=False, verbosity=0)

alias_target = importlib.import_module(f'{__name__}.dashboard_views_regression')
sys.modules.setdefault('tests.test_dashboard_views', alias_target)
