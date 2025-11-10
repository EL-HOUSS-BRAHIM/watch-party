"""
Development settings for Watch Party Backend
"""

from .base import *

# Debug
DEBUG = True

# Database - Use SQLite for development to avoid PostgreSQL setup issues
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Uncomment below for PostgreSQL in development
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME', default='watchparty_dev'),
#         'USER': config('DB_USER', default='postgres'),
#         'PASSWORD': config('DB_PASSWORD', default='password'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Explicitly allow localhost and GitHub Codespaces for development
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Allow GitHub Codespaces origins (*.app.github.dev)
CORS_ALLOWED_ORIGIN_REGEXES = config(
    'CORS_ALLOWED_ORIGIN_REGEXES',
    default=r'^https://.*\.app\.github\.dev$',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# CSRF trusted origins for development
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# VS Code Simple Browser and development tools support
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.app\.github\.dev$',   # GitHub Codespaces
    r'^https://.*\.vscode-cdn\.net$',    # VS Code Simple Browser
    r'^vscode-webview://.*$',             # VS Code webview protocol
    r'^http://localhost:\d+$',            # Any localhost port
    r'^http://127\.0\.0\.1:\d+$',       # Any 127.0.0.1 port
]

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Add development tools
INSTALLED_APPS += [
    'django_extensions',
    'debug_toolbar',
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Debug toolbar configuration
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Disable security features for development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Logging - more verbose in development
LOGGING['loggers']['shared']['level'] = 'DEBUG'

# Media files served by Django in development
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'mediafiles'

# Override Redis-based configurations for development
# Use dummy cache backend to avoid Redis dependency
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Use database-backed sessions instead of Redis
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Use in-memory channel layer for development
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# Disable Celery for development
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
