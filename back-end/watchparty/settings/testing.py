"""
Testing settings for Watch Party Backend
"""

from .base import *

# Use in-memory database for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations for tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Use simple password hasher for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable logging during tests
LOGGING_CONFIG = None

# Use console email backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Use dummy cache for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Disable Celery for tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Test-specific settings
DEBUG = False
SECRET_KEY = 'test-secret-key'
CORS_ALLOW_ALL_ORIGINS = True
TESTING = True  # Mark as testing environment for health checks

# Security Headers Configuration - Disable CSP for tests
CSP_REPORT_ONLY = True
CSP_POLICY = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;"

# Media files for tests
MEDIA_ROOT = BASE_DIR / 'test_media'
