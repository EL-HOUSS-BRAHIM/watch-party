"""Testing settings that include the notifications app."""

from .testing import *  # noqa

INSTALLED_APPS = list(INSTALLED_APPS) + ['apps.notifications']

ROOT_URLCONF = 'config.notifications_test_urls'
