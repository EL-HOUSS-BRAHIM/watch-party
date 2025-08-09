"""
Production settings for Watch Party Backend - Phase 2 Enhanced
"""

from .base import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration

# Security
DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# Database - Use environment configuration with connection pooling
DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# Redis Configuration - Enhanced for Phase 2 features
REDIS_URL = config('REDIS_URL', default='redis://127.0.0.1:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            }
        },
        'KEY_PREFIX': 'watchparty_prod',
        'TIMEOUT': 3600,
    }
}

# Session Configuration - Redis backed
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Enhanced Celery Configuration for Phase 2
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/2')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://127.0.0.1:6379/3')
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Task routing for different queues
CELERY_TASK_ROUTES = {
    'utils.email_service.*': {'queue': 'email'},
    'apps.analytics.tasks.*': {'queue': 'analytics'},
    'apps.videos.tasks.*': {'queue': 'video_processing'},
    'watchparty.tasks.*': {'queue': 'maintenance'},
}

# Channels Configuration - Redis backed for production WebSocket
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_URL],
            "capacity": 2000,
            "expiry": 60,
        },
    },
}

# Enhanced Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CSRF and CORS Configuration
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://watchparty.com',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# Add CORS allowed origins from environment
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Static files - Use WhiteNoise with compression
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files - Enhanced S3 configuration for Phase 2
USE_S3 = config('USE_S3', default=True, cast=bool)

if USE_S3 and AWS_STORAGE_BUCKET_NAME:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    # Video uploads to separate bucket if configured
    VIDEO_STORAGE_BUCKET = config('VIDEO_STORAGE_BUCKET', default=AWS_STORAGE_BUCKET_NAME)

# Email - Production SMTP with enhanced configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = True

# Phase 2 Email Features
EMAIL_TRACK_OPENS = True
EMAIL_TRACK_CLICKS = True

# Enhanced Sentry Configuration
if config('SENTRY_DSN', default=''):
    sentry_sdk.init(
        dsn=config('SENTRY_DSN'),
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment=config('ENVIRONMENT', default='production'),
        before_send=lambda event, hint: event if not DEBUG else None,
    )

# Enhanced Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            'class': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/watchparty/django.log',
            'formatter': 'verbose',
            'maxBytes': 1024*1024*100,  # 100 MB
            'backupCount': 10,
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler', 
            'filename': '/var/log/watchparty/django_errors.log',
            'formatter': 'json',
            'maxBytes': 1024*1024*50,  # 50 MB
            'backupCount': 5,
        },
        'console': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'watchparty': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'celery': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Phase 2 Specific Production Settings

# Advanced Rate Limiting for Production
RATE_LIMIT_CONFIGS = {
    'default': {
        'requests': 2000,
        'window': 3600,  # 1 hour
    },
    'auth': {
        'requests': 30,
        'window': 900,   # 15 minutes
    },
    'upload': {
        'requests': 20,
        'window': 3600,  # 1 hour
    },
    'api': {
        'requests': 10000,
        'window': 3600,  # 1 hour
    },
}

# Analytics Configuration
ANALYTICS_RETENTION_DAYS = config('ANALYTICS_RETENTION_DAYS', default=365, cast=int)

# Video Processing
VIDEO_MAX_FILE_SIZE = config('VIDEO_MAX_FILE_SIZE', default=5368709120, cast=int)  # 5GB
VIDEO_PROCESSING_TIMEOUT = config('VIDEO_PROCESSING_TIMEOUT', default=1800, cast=int)  # 30 min

# WebSocket Production Configuration
WS_MAX_CONNECTIONS_PER_IP = config('WS_MAX_CONNECTIONS_PER_IP', default=20, cast=int)
WS_HEARTBEAT_INTERVAL = config('WS_HEARTBEAT_INTERVAL', default=30, cast=int)

# Party Limits
MAX_PARTY_PARTICIPANTS = config('MAX_PARTY_PARTICIPANTS', default=100, cast=int)

# Machine Learning Features
ML_PREDICTIONS_ENABLED = config('ML_PREDICTIONS_ENABLED', default=True, cast=bool)
