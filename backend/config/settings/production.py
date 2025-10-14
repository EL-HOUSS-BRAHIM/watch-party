"""
Production settings for Watch Party Backend - Phase 2 Enhanced
"""

from .base import *
import dj_database_url
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from shared.aws import get_optional_secret
import logging

logger = logging.getLogger(__name__)

# Security
DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# Disable automatic slash appending to prevent POST->GET redirect issues
APPEND_SLASH = False

# Additional security settings for production
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Dynamic Database Configuration from AWS Secrets Manager
def get_database_config():
    """Get RDS database configuration from AWS Secrets Manager with fallback to environment."""
    try:
        # Try to get the RDS credentials from AWS Secrets Manager
        rds_secret = get_optional_secret('rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae')
        if rds_secret:
            username = rds_secret.get('username')
            password = rds_secret.get('password')
            
            # RDS secret may not include host/port/dbname, so use hardcoded values for this RDS instance
            host = rds_secret.get('host', 'all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com')
            port = rds_secret.get('port', 5432)
            dbname = rds_secret.get('dbname', 'watchparty_prod')
            
            if username and password:
                # URL-encode the password to handle special characters
                import urllib.parse
                encoded_password = urllib.parse.quote(password, safe='')
                database_url = f'postgresql://{username}:{encoded_password}@{host}:{port}/{dbname}?sslmode=require'
                logger.info(f"Using RDS credentials from AWS Secrets Manager for host: {host}")
                return {
                    'default': dj_database_url.parse(
                        database_url,
                        conn_max_age=0,
                        conn_health_checks=True,
                        ssl_require=True,
                    )
                }
            else:
                logger.warning("RDS secret incomplete, missing username or password")
        else:
            logger.info("RDS secret not found in Secrets Manager, using environment fallback")
    except Exception as e:
        logger.warning(f"Failed to fetch RDS credentials from AWS Secrets Manager: {e}")
    
    # Fallback to environment variable DATABASE_URL
    return {
        'default': dj_database_url.config(
            conn_max_age=0,
            conn_health_checks=True,
            ssl_require=True,
        )
    }

DATABASES = get_database_config()

# Dynamic Redis/Valkey Configuration from AWS Secrets Manager
def get_valkey_config():
    """Get Valkey configuration from AWS Secrets Manager with fallback to environment."""
    try:
        # Try to get the auth token from AWS Secrets Manager
        valkey_secret = get_optional_secret('watch-party-valkey-001-auth-token')
        if valkey_secret and 'auth_token' in valkey_secret:
            auth_token = valkey_secret['auth_token']
            # Use the ElastiCache endpoint with the dynamic auth token
            valkey_endpoint = config('VALKEY_ENDPOINT', default='clustercfg.watch-party-valkey-001.rnipvl.memorydb.eu-west-3.amazonaws.com:6379')
            return f'rediss://:{auth_token}@{valkey_endpoint}/0'
        else:
            logger.info("Valkey auth token not found in Secrets Manager, using environment fallback")
    except Exception as e:
        logger.warning(f"Failed to fetch Valkey credentials from AWS Secrets Manager: {e}")
    
    # Fallback to environment variable
    return config('REDIS_URL', default='redis://127.0.0.1:6379/0')

# Redis Configuration - Enhanced for Phase 2 features
REDIS_URL = get_valkey_config()
logger.info(f"Using Redis/Valkey URL: {REDIS_URL.split('@')[0]}@***")  # Log URL without exposing credentials

# Redis Cache Configuration with fallback
try:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 100,
                    'retry_on_timeout': True,
                    'socket_connect_timeout': 5,
                    'socket_timeout': 5,
                },
                'IGNORE_EXCEPTIONS': True,
            },
            'KEY_PREFIX': 'watchparty_prod',
            'TIMEOUT': 3600,
        }
    }
except Exception:
    # Fallback to local memory cache if Redis is unavailable
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'watchparty-cache',
            'TIMEOUT': 3600,
        }
    }

# Session Configuration - Redis backed (restored)
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Enhanced Celery Configuration for Phase 2
# Use the same dynamic Redis URL but with different databases for broker and result backend
def get_celery_redis_url(db_number):
    """Get Celery Redis URL with specific database number."""
    base_url = REDIS_URL
    if base_url.startswith('rediss://') and '@' in base_url:
        # For SSL Redis URLs like rediss://:token@host:port/0
        parts = base_url.rsplit('/', 1)
        return f"{parts[0]}/{db_number}"
    elif base_url.startswith('redis://') and '@' in base_url:
        # For non-SSL Redis URLs like redis://:token@host:port/0
        parts = base_url.rsplit('/', 1)
        return f"{parts[0]}/{db_number}"
    else:
        # Fallback to environment variables
        return config(f'CELERY_BROKER_URL', default=f'redis://127.0.0.1:6379/{db_number}')

CELERY_BROKER_URL = get_celery_redis_url(2)
CELERY_RESULT_BACKEND = get_celery_redis_url(3)
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

logger.info(f"Celery broker URL: {CELERY_BROKER_URL.split('@')[0]}@***")
logger.info(f"Celery result backend: {CELERY_RESULT_BACKEND.split('@')[0]}@***")

# Celery Redis connection settings with fallback
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10
CELERY_RESULT_BACKEND_CONNECTION_RETRY = True

# Task routing for different queues
CELERY_TASK_ROUTES = {
    'utils.email_service.*': {'queue': 'email'},
    'apps.analytics.tasks.*': {'queue': 'analytics'},
    'apps.videos.tasks.*': {'queue': 'video_processing'},
    'shared.background_tasks.*': {'queue': 'maintenance'},
}

# Channels Configuration with fallback
try:
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
except Exception:
    # Fallback to in-memory channel layer if Redis is unavailable
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

# CSRF and CORS Configuration
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://watchparty.com,http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# Add CORS allowed origins from environment
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me,http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Allow GitHub Codespaces origins (*.app.github.dev)
CORS_ALLOWED_ORIGIN_REGEXES = config(
    'CORS_ALLOWED_ORIGIN_REGEXES',
    default=r'^https://.*\.app\.github\.dev$',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Additional CORS settings for proper preflight handling
CORS_ALLOW_HEADERS = config(
    'CORS_ALLOW_HEADERS',
    default='accept,authorization,content-type,user-agent,x-csrftoken,x-requested-with',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_METHODS = config(
    'CORS_ALLOW_METHODS', 
    default='GET,POST,PUT,PATCH,DELETE,OPTIONS',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_PREFLIGHT_MAX_AGE = config('CORS_PREFLIGHT_MAX_AGE', default=86400, cast=int)

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
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
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
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
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
            'formatter': 'detailed',
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
        'shared': {
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
