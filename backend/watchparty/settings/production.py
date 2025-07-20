"""
Production settings for Watch Party Backend
"""

from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

# Security
DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# Database - Use environment configuration
DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Static files - Use WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files - Use S3 in production
if AWS_STORAGE_BUCKET_NAME:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }

# Email - Use SendGrid or SMTP in production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Sentry error tracking
if config('SENTRY_DSN', default=''):
    sentry_sdk.init(
        dsn=config('SENTRY_DSN'),
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=True,
        environment=config('ENVIRONMENT', default='production'),
    )

# Logging - Production configuration
LOGGING['handlers']['file']['filename'] = '/var/log/watchparty/django.log'
LOGGING['handlers']['file']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['watchparty']['level'] = 'INFO'

# CORS - Restrict to allowed origins only
CORS_ALLOW_ALL_ORIGINS = False
