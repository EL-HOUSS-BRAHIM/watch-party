"""
Base settings for Watch Party Backend
"""

from pathlib import Path
from decouple import config

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='your-super-secret-key-here-change-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'channels',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_celery_beat',
]

LOCAL_APPS = [
    'shared',
    
    'apps.authentication',
    'apps.users',
    'apps.videos',
    'apps.parties',
    'apps.chat',
    'apps.billing',
    'apps.analytics',
    'apps.notifications',
    'apps.integrations',
    'apps.interactive',
    'apps.admin_panel',
    'apps.moderation',
    'apps.store',
    'apps.search',
    'apps.social',
    'apps.messaging',
    'apps.support',
    'apps.events',
    'apps.mobile',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    
    # Performance and optimization middleware (before authentication)
    'shared.middleware.performance_middleware.ResponseCompressionMiddleware',
    'shared.middleware.database_optimization.QueryOptimizationMiddleware',
    'shared.middleware.database_optimization.DatabaseConnectionMiddleware',
    'shared.middleware.database_optimization.CacheOptimizationMiddleware',
    
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # Added standard CSRF middleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Enhanced security middleware (after authentication)
    'shared.middleware.security_middleware.EnhancedSecurityMiddleware',
    'shared.middleware.security_middleware.AdvancedRateLimitMiddleware',
    'shared.middleware.security_middleware.FileUploadSecurityMiddleware',
    'shared.middleware.security_middleware.APIVersioningMiddleware',
    'shared.middleware.security_middleware.CSRFProtectionMiddleware',  # Enhanced CSRF protection
    'shared.middleware.performance_middleware.RateLimitMiddleware',
    
    # Enhanced custom middleware
    'shared.middleware.enhanced_middleware.RequestLoggingMiddleware',
    'shared.middleware.enhanced_middleware.SecurityHeadersMiddleware',
    'shared.middleware.enhanced_middleware.UserActivityMiddleware',
    'shared.middleware.enhanced_middleware.ErrorHandlingMiddleware',
    'shared.middleware.enhanced_middleware.MaintenanceMiddleware',
    'shared.middleware.enhanced_middleware.APIVersionMiddleware',
    'shared.middleware.enhanced_middleware.ContentTypeMiddleware',
    
    # Security audit middleware (later in stack)
    'shared.middleware.security_middleware.SecurityAuditMiddleware',
    
    # Performance monitoring
    'shared.middleware.performance_middleware.APIPerformanceMiddleware',
    'shared.middleware.database_optimization.QueryCountLimitMiddleware',
    'shared.middleware.database_optimization.DatabaseIndexHintMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database with optimizations
from shared.database_optimization import get_optimized_database_config, get_cache_config

# Use optimized database configuration
DATABASES = get_optimized_database_config()

# Enhanced cache configuration with Redis
CACHES = get_cache_config()

# Query optimization settings
ENABLE_QUERY_LOGGING = DEBUG
SLOW_QUERY_THRESHOLD_MS = 500
MAX_QUERIES_PER_REQUEST = 50
USE_CACHE = True
ENABLE_RATE_LIMITING = True
ENABLE_PERFORMANCE_MONITORING = True

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'mediafiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'shared.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'shared.api_documentation.EnhancedAutoSchema',
    'EXCEPTION_HANDLER': 'shared.error_handling.enhanced_exception_handler',
}

# Enhanced settings for performance and monitoring
USE_CACHE = True
ENABLE_RATE_LIMITING = True
ENABLE_PERFORMANCE_MONITORING = True

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY', default=SECRET_KEY),
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only for development

# Cache Configuration (now using optimized configuration from above)
# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'
SESSION_COOKIE_AGE = 1800  # 30 minutes

# Cache key prefixes
CACHE_KEY_PREFIX = 'watchparty'

# Cache versioning
CACHE_VERSION = 1

# Celery Configuration for Background Tasks
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/2')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://127.0.0.1:6379/3')
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    'daily-analytics-processing': {
        'task': 'shared.background_tasks.schedule_daily_tasks',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-expired-data': {
        'task': 'shared.background_tasks.cleanup_expired_data',
        'schedule': 86400.0,  # Daily
    },
}
CELERY_TASK_ROUTES = {
    'shared.background_tasks.process_search_analytics': {'queue': 'analytics'},
    'shared.background_tasks.process_notification_analytics': {'queue': 'analytics'},
    'shared.background_tasks.cleanup_expired_data': {'queue': 'maintenance'},
    'shared.background_tasks.optimize_database_indexes': {'queue': 'maintenance'},
}

# Channels Configuration with support for AWS ElastiCache Valkey
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.shared.RedisChannelLayer',
        'CONFIG': {
            "hosts": [config('CHANNEL_LAYERS_CONFIG_HOSTS', default=config('REDIS_URL', default='redis://127.0.0.1:6379/1'))],
            # SSL/TLS configuration for AWS ElastiCache
            "symmetric_encryption_keys": [config('CHANNELS_ENCRYPTION_KEY', default=SECRET_KEY)],
            "capacity": 1500,
            "expiry": 60,
        },
    },
}

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.shared.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@watchparty.com')

# AWS S3 Configuration
AWS_STORAGE_BUCKET_NAME = config('AWS_S3_BUCKET_NAME', default='')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = 'private'
AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN', default='')

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_ID = config('GOOGLE_DRIVE_CLIENT_ID', default='')
GOOGLE_DRIVE_CLIENT_SECRET = config('GOOGLE_DRIVE_CLIENT_SECRET', default='')
GOOGLE_SERVICE_ACCOUNT_FILE = config('GOOGLE_SERVICE_ACCOUNT_FILE', default='')

# Firebase Configuration for Mobile Push Notifications
FIREBASE_CONFIG = {
    'type': config('FIREBASE_TYPE', default='service_account'),
    'project_id': config('FIREBASE_PROJECT_ID', default=''),
    'private_key_id': config('FIREBASE_PRIVATE_KEY_ID', default=''),
    'private_key': config('FIREBASE_PRIVATE_KEY', default='').replace('\\n', '\n'),
    'client_email': config('FIREBASE_CLIENT_EMAIL', default=''),
    'client_id': config('FIREBASE_CLIENT_ID', default=''),
    'auth_uri': config('FIREBASE_AUTH_URI', default='https://accounts.google.com/o/oauth2/auth'),
    'token_uri': config('FIREBASE_TOKEN_URI', default='https://oauth2.googleapis.com/token'),
    'auth_provider_x509_cert_url': config('FIREBASE_AUTH_PROVIDER_X509_CERT_URL', default='https://www.googleapis.com/oauth2/v1/certs'),
    'client_x509_cert_url': config('FIREBASE_CLIENT_X509_CERT_URL', default=''),
}

# Mobile Push Notification Settings
FIREBASE_CREDENTIALS_FILE = config('FIREBASE_CREDENTIALS_FILE', default='')
PUSH_NOTIFICATION_BATCH_SIZE = config('PUSH_NOTIFICATION_BATCH_SIZE', default=100, cast=int)
PUSH_NOTIFICATION_RETRY_ATTEMPTS = config('PUSH_NOTIFICATION_RETRY_ATTEMPTS', default=3, cast=int)

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'Watch Party API',
    'DESCRIPTION': '''
    **Watch Party Platform API Documentation**
    
    This is a comprehensive API for the Watch Party platform that allows users to:
    - Create and join video watch parties
    - Upload and manage videos
    - Chat in real-time during parties
    - Manage user profiles and social features
    - Access analytics and billing features
    
    ## Authentication
    Most endpoints require JWT authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer <your_access_token>
    ```
    
    ## Rate Limiting
    API endpoints have rate limiting applied. Check response headers for limit information.
    
    ## Pagination
    List endpoints use cursor-based pagination with `page` and `page_size` parameters.
    ''',
    'VERSION': '2.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
    'SCHEMA_PATH_PREFIX_TRIM': True,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SERVE_AUTHENTICATION': [],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': False,
        'defaultModelsExpandDepth': 1,
        'defaultModelExpandDepth': 1,
        'defaultModelRendering': 'example',
        'displayRequestDuration': True,
        'docExpansion': 'list',
        'filter': True,
        'operationsSorter': 'alpha',
        'showExtensions': True,
        'showCommonExtensions': True,
        'tagsSorter': 'alpha',
        'tryItOutEnabled': True,
    },
    'SWAGGER_UI_DIST': 'SIDECAR',
    'SWAGGER_UI_FAVICON_HREF': 'SIDECAR',
    'REDOC_DIST': 'SIDECAR',
    'REDOC_UI_SETTINGS': {
        'hideDownloadButton': False,
        'hideHostname': False,
        'hideLoading': False,
        'hideSchemaPattern': True,
        'expandResponses': 'all',
        'pathInMiddlePanel': True,
        'nativeScrollbars': False,
        'theme': {
            'colors': {
                'primary': {
                    'main': '#3f51b5'
                }
            },
            'typography': {
                'fontSize': '14px',
                'lineHeight': '1.5em',
                'code': {
                    'fontSize': '13px'
                }
            }
        }
    },
    'SORT_OPERATIONS': True,
    'DISABLE_ERRORS_AND_WARNINGS': False,
#     'ENUM_NAME_OVERRIDES': {
#         'ValidationErrorEnum': 'shared.exceptions.ValidationError',
#         # Status field enum overrides
#         'StatusAc5Enum': 'WatchPartyStatusEnum',
#         'Status8e4Enum': 'SubscriptionStatusEnum', 
#         'Status97dEnum': 'BillingInvoiceStatusEnum',
#         'Status9f9Enum': 'EventStatusEnum',
#         # Priority field enum overrides
#         'Priority5f3Enum': 'NotificationPriorityEnum',
#         'PriorityC93Enum': 'SupportTicketPriorityEnum',
#         # Report type enum override
#         'ReportTypeBe8Enum': 'ContentReportTypeEnum',
#     },
#     '#POSTPROCESSING_HOOKS': [
#         'drf_spectacular.hooks.postprocess_schema_enums'
#     ],
    'PREPROCESSING_HOOKS': [
        'drf_spectacular.hooks.preprocess_exclude_path_format'
    ],
    'TAGS': [
        {'name': 'Authentication', 'description': 'User authentication and account management'},
        {'name': 'Users', 'description': 'User profile and social features'},
        {'name': 'Videos', 'description': 'Video upload, management, and streaming'},
        {'name': 'Parties', 'description': 'Watch party creation and management'},
        {'name': 'Chat', 'description': 'Real-time messaging during parties'},
        {'name': 'Billing', 'description': 'Subscription and payment management'},
        {'name': 'Analytics', 'description': 'Platform and user analytics'},
        {'name': 'Notifications', 'description': 'Push and email notifications'},
        {'name': 'Integrations', 'description': 'Third-party service integrations'},
        {'name': 'Search', 'description': 'Global search and discovery'},
        {'name': 'Social', 'description': 'Social groups and interactions'},
        {'name': 'Admin', 'description': 'Administrative functions'},
    ],
}

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'security': {
            'format': '[SECURITY] {levelname} {asctime} {message}',
            'style': '{',
        },
        'performance': {
            'format': '[PERFORMANCE] {levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'formatter': 'security',
        },
        'performance_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'performance.log',
            'formatter': 'performance',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'watchparty': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'security_audit': {
            'handlers': ['security_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'performance': {
            'handlers': ['performance_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=False, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=False, cast=bool)

# Enhanced Security Settings
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') if config('USE_HTTPS', default=False, cast=bool) else None
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=False, cast=bool)
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
CSRF_COOKIE_SAMESITE = 'Strict'

# File Upload Security
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
MAX_REQUEST_SIZE = 500 * 1024 * 1024  # 500MB for video uploads

# Input Validation Settings
MAX_USERNAME_LENGTH = 50
MAX_EMAIL_LENGTH = 254
MAX_TEXT_LENGTH = 5000
MAX_FILENAME_LENGTH = 255

# Rate Limiting Settings
ENABLE_RATE_LIMITING = config('ENABLE_RATE_LIMITING', default=True, cast=bool)
RATE_LIMIT_LOGIN_ATTEMPTS = 5
RATE_LIMIT_LOGIN_WINDOW = 300  # 5 minutes
RATE_LIMIT_API_REQUESTS = 1000
RATE_LIMIT_API_WINDOW = 3600  # 1 hour

# API Security Settings
API_REQUIRE_AUTHENTICATION = True
API_ALLOW_ANONYMOUS_READ = config('API_ALLOW_ANONYMOUS_READ', default=False, cast=bool)
API_VERSION_HEADER = 'HTTP_API_VERSION'
API_DEFAULT_VERSION = 'v2'
API_SUPPORTED_VERSIONS = ['v1', 'v2']

# Content Security Policy
CSP_DEFAULT_SRC = "'self'"
CSP_SCRIPT_SRC = "'self' 'unsafe-inline' 'unsafe-eval'"
CSP_STYLE_SRC = "'self' 'unsafe-inline'"
CSP_IMG_SRC = "'self' data: https:"
CSP_FONT_SRC = "'self'"
CSP_CONNECT_SRC = "'self' wss: https:"
CSP_MEDIA_SRC = "'self' https:"
CSP_OBJECT_SRC = "'none'"
CSP_BASE_URI = "'self'"
CSP_FORM_ACTION = "'self'"

# Video Processing Configuration
VIDEO_UPLOAD_PATH = 'videos/'
VIDEO_THUMBNAIL_PATH = 'thumbnails/'
MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024  # 500MB
SUPPORTED_VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']

# Two-Factor Authentication
OTP_TOTP_ISSUER = 'WatchParty'
OTP_TOTP_PERIOD = 30

# Notification Configuration
NOTIFICATION_BATCH_SIZE = 100
NOTIFICATION_RETRY_DELAY = 300  # 5 minutes

# Analytics Configuration
ANALYTICS_BATCH_SIZE = 1000
ANALYTICS_RETENTION_DAYS = 365
