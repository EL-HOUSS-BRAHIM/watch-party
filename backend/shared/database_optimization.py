"""Database optimization settings and utilities."""

import logging
import os
from functools import lru_cache
from typing import Dict, Optional
from urllib.parse import urlparse, urlunparse

from shared.aws import get_optional_secret

LOGGER = logging.getLogger(__name__)

# Database connection optimization settings
DATABASE_OPTIMIZATION_SETTINGS = {
    'OPTIONS': {
        # Connection pooling for PostgreSQL
        'MAX_CONNS': 20,
        'MIN_CONNS': 5,
        
        # Connection timeout settings
        'connect_timeout': 60,
        'read_timeout': 30,
        'write_timeout': 30,
        
        # Connection health checks
        'health_check_interval': 300,
    },
    
    # Connection pooling settings
    'CONN_MAX_AGE': 3600,  # 1 hour
    'CONN_HEALTH_CHECKS': True,
    'DISABLE_SERVER_SIDE_CURSORS': True,
    
    # Query optimization
    'ATOMIC_REQUESTS': False,  # Disable for performance, handle manually
    'AUTOCOMMIT': True,
}

# Redis cache optimization
REDIS_CACHE_SETTINGS = {
    'BACKEND': 'django_redis.cache.RedisCache',
    'OPTIONS': {
        'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
        'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
        'CONNECTION_POOL_KWARGS': {
            'max_connections': 100,
            'retry_on_timeout': True,
            'socket_keepalive': True,
            'socket_keepalive_options': {},
        },
        'PARSER_CLASS': 'redis.connection.HiredisParser',
    },
    'KEY_PREFIX': 'watchparty',
    'VERSION': 1,
    'TIMEOUT': 300,  # 5 minutes default
}

# Database query optimization settings
QUERY_OPTIMIZATION = {
    'SELECT_RELATED_DEPTH': 5,
    'PREFETCH_RELATED_DEPTH': 3,
    'MAX_QUERY_TIME_MS': 1000,
    'SLOW_QUERY_THRESHOLD_MS': 500,
    'ENABLE_QUERY_LOGGING': os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'),
    'ENABLE_QUERY_ANALYSIS': True,
}

# Caching strategy configuration
CACHE_STRATEGIES = {
    'user_profiles': {
        'timeout': 3600,  # 1 hour
        'key_prefix': 'user_profile',
        'version': 1,
    },
    'video_metadata': {
        'timeout': 1800,  # 30 minutes
        'key_prefix': 'video_meta',
        'version': 1,
    },
    'party_data': {
        'timeout': 300,  # 5 minutes
        'key_prefix': 'party',
        'version': 1,
    },
    'search_results': {
        'timeout': 300,  # 5 minutes
        'key_prefix': 'search',
        'version': 1,
    },
    'notifications': {
        'timeout': 600,  # 10 minutes
        'key_prefix': 'notif',
        'version': 1,
    },
    'analytics': {
        'timeout': 7200,  # 2 hours
        'key_prefix': 'analytics',
        'version': 1,
    },
}

# Database indexes to be created
CUSTOM_DATABASE_INDEXES = [
    # User-related indexes
    {
        'model': 'authentication.User',
        'fields': ['username', 'email'],
        'name': 'user_login_idx',
    },
    {
        'model': 'authentication.User',
        'fields': ['is_active', 'date_joined'],
        'name': 'user_active_joined_idx',
    },
    
    # Video-related indexes
    {
        'model': 'videos.Video',
        'fields': ['is_active', 'created_at'],
        'name': 'video_active_date_idx',
    },
    {
        'model': 'videos.Video',
        'fields': ['uploaded_by', 'is_active'],
        'name': 'video_uploader_active_idx',
    },
    {
        'model': 'videos.Video',
        'fields': ['title', 'is_active'],
        'name': 'video_title_active_idx',
    },
    
    # Party-related indexes
    {
        'model': 'parties.WatchParty',
        'fields': ['host', 'is_active'],
        'name': 'party_host_active_idx',
    },
    {
        'model': 'parties.WatchParty',
        'fields': ['is_public', 'is_active', 'created_at'],
        'name': 'party_public_active_date_idx',
    },
    
    # Notification indexes
    {
        'model': 'notifications.Notification',
        'fields': ['user', 'status', 'created_at'],
        'name': 'notification_user_status_date_idx',
    },
    {
        'model': 'notifications.Notification',
        'fields': ['user', 'is_read', 'expires_at'],
        'name': 'notification_user_read_expires_idx',
    },
    
    # Search indexes
    {
        'model': 'search.SearchQuery',
        'fields': ['query', 'created_at'],
        'name': 'search_query_date_idx',
    },
    {
        'model': 'search.SearchQuery',
        'fields': ['user', 'created_at'],
        'name': 'search_user_date_idx',
    },
    
    # Analytics indexes
    {
        'model': 'analytics.UserAnalytics',
        'fields': ['user', 'date'],
        'name': 'analytics_user_date_idx',
    },
    {
        'model': 'analytics.VideoAnalytics',
        'fields': ['video', 'date'],
        'name': 'analytics_video_date_idx',
    },
]

# Query optimization hints
QUERY_HINTS = {
    'user_list': {
        'select_related': ['profile'],
        'prefetch_related': ['groups', 'user_permissions'],
        'only': ['id', 'username', 'email', 'first_name', 'last_name', 'is_active'],
    },
    'video_list': {
        'select_related': ['uploaded_by'],
        'prefetch_related': ['tags', 'categories'],
        'only': ['id', 'title', 'description', 'duration', 'thumbnail', 'created_at', 'uploaded_by__username'],
    },
    'party_list': {
        'select_related': ['host', 'video'],
        'prefetch_related': ['participants'],
        'only': ['id', 'title', 'description', 'is_active', 'is_public', 'created_at', 'host__username'],
    },
    'notification_list': {
        'select_related': ['template', 'party', 'video', 'related_user'],
        'only': ['id', 'title', 'content', 'is_read', 'created_at', 'priority'],
    },
}

# Performance monitoring settings
PERFORMANCE_MONITORING = {
    'ENABLE_QUERY_LOGGING': os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'),
    'SLOW_QUERY_THRESHOLD_MS': 500,
    'LOG_SLOW_QUERIES': True,
    'ENABLE_PROFILING': os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'),
    'PROFILE_SQL_QUERIES': os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'),
    'ENABLE_MEMORY_TRACKING': os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'),
}

# Connection pooling configuration for production
CONNECTION_POOLING = {
    'ENABLED': not (os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')),
    'POOL_SIZE': 20,
    'MAX_OVERFLOW': 30,
    'POOL_TIMEOUT': 30,
    'POOL_RECYCLE': 3600,
    'POOL_PRE_PING': True,
}

def get_optimized_database_config():
    """
    Get optimized database configuration based on environment
    Supports AWS RDS with SSL/TLS encryption and connection pooling
    """
    import dj_database_url
    from pathlib import Path

    secret_payload = _get_all_in_one_credentials()
    secret_db = _extract_database_settings(secret_payload)

    # Check for DATABASE_URL first (used in testing/CI and AWS)
    database_url = os.environ.get('DATABASE_URL') or secret_db.get('url')
    if database_url:
        # Parse the database URL
        config = {
            'default': dj_database_url.parse(database_url, conn_max_age=DATABASE_OPTIMIZATION_SETTINGS['CONN_MAX_AGE'])
        }
        
        # Add SSL configuration for AWS RDS if using PostgreSQL
        if 'postgresql' in database_url.lower():
            config['default']['OPTIONS'] = {
                **DATABASE_OPTIMIZATION_SETTINGS.get('OPTIONS', {}),
                'sslmode': os.environ.get('DB_SSL_MODE', 'prefer'),
            }
            
            # Add specific SSL certificate files if provided (for enhanced security)
            ssl_ca = os.environ.get('DB_SSL_CA')
            ssl_cert = os.environ.get('DB_SSL_CERT')
            ssl_key = os.environ.get('DB_SSL_KEY')
            
            if ssl_ca:
                config['default']['OPTIONS']['sslrootcert'] = ssl_ca
            if ssl_cert:
                config['default']['OPTIONS']['sslcert'] = ssl_cert
            if ssl_key:
                config['default']['OPTIONS']['sslkey'] = ssl_key
        
        return config
    
    # Standard configuration for development/production
    config = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DATABASE_NAME') or secret_db.get('name', 'watchparty'),
            'USER': os.environ.get('DATABASE_USER') or secret_db.get('username', 'postgres'),
            'PASSWORD': os.environ.get('DATABASE_PASSWORD') or secret_db.get('password', ''),
            'HOST': os.environ.get('DATABASE_HOST') or secret_db.get('host', 'localhost'),
            'PORT': os.environ.get('DATABASE_PORT') or str(secret_db.get('port', '5432')),
            **DATABASE_OPTIMIZATION_SETTINGS,
        }
    }
    
    # Add SSL configuration for PostgreSQL in production
    if not os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes'):
        config['default']['OPTIONS'].update({
            'sslmode': os.environ.get('DB_SSL_MODE', 'prefer'),
        })
        
        # Add specific SSL certificate files if provided
        ssl_ca = os.environ.get('DB_SSL_CA')
        ssl_cert = os.environ.get('DB_SSL_CERT')
        ssl_key = os.environ.get('DB_SSL_KEY')
        
        if ssl_ca:
            config['default']['OPTIONS']['sslrootcert'] = ssl_ca
        if ssl_cert:
            config['default']['OPTIONS']['sslcert'] = ssl_cert
        if ssl_key:
            config['default']['OPTIONS']['sslkey'] = ssl_key
    
    # Add SQLite config for development when DEBUG is true and no DATABASE_URL
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')
    if debug and not database_url and os.environ.get('DATABASE_HOST', 'localhost') == 'localhost':
        # Get BASE_DIR equivalent
        base_dir = Path(__file__).resolve().parent.parent
        config['default'] = {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': base_dir / 'db.sqlite3',
            'OPTIONS': {
                'timeout': 60,
                'check_same_thread': False,
            },
        }
    
    return config

def get_cache_config():
    """
    Get optimized cache configuration with support for AWS ElastiCache Valkey
    """
    redis_secret = _get_redis_credentials()
    redis_url = os.environ.get('REDIS_URL') or redis_secret.get('url', 'redis://127.0.0.1:6379')
    redis_url = _inject_redis_auth(redis_url, redis_secret)
    redis_use_ssl = os.environ.get('REDIS_USE_SSL', 'False').lower() in ('true', '1', 'yes')

    if redis_secret.get('use_ssl') is True:
        redis_use_ssl = True

    # Enhanced Redis settings for AWS ElastiCache with SSL/TLS
    if redis_use_ssl or redis_url.startswith('rediss://'):
        redis_settings = {
            **REDIS_CACHE_SETTINGS,
            'OPTIONS': {
                **REDIS_CACHE_SETTINGS.get('OPTIONS', {}),
                'CONNECTION_POOL_KWARGS': {
                    **REDIS_CACHE_SETTINGS.get('OPTIONS', {}).get('CONNECTION_POOL_KWARGS', {}),
                    'ssl_cert_reqs': None,  # For AWS ElastiCache, we don't need cert verification
                    'ssl_check_hostname': False,
                    'ssl_ca_certs': None,
                },
            },
        }
    else:
        redis_settings = REDIS_CACHE_SETTINGS
    
    return {
        'default': {
            'LOCATION': f'{redis_url}/0',
            **redis_settings,
        },
        'sessions': {
            'LOCATION': f'{redis_url}/1',
            **redis_settings,
            'TIMEOUT': 1800,  # 30 minutes for sessions
        },
        'search': {
            'LOCATION': f'{redis_url}/2',
            **redis_settings,
            'TIMEOUT': 600,  # 10 minutes for search results
        },
        'analytics': {
            'LOCATION': f'{redis_url}/3',
            **redis_settings,
            'TIMEOUT': 3600,  # 1 hour for analytics
        },
        'channels': {
            'LOCATION': f'{redis_url}/4',
            **redis_settings,
            'TIMEOUT': 300,  # 5 minutes for WebSocket channels
        },
    }


@lru_cache(maxsize=1)
def _get_all_in_one_credentials() -> Optional[Dict[str, Dict]]:
    secret_name = os.environ.get('ALL_IN_ONE_SECRET_NAME', 'all-in-one-credentials')
    secret = get_optional_secret(secret_name)

    if secret is None:
        return None

    LOGGER.debug("Loaded credentials from Secrets Manager: %s", secret_name)
    return secret


@lru_cache(maxsize=1)
def _get_redis_credentials() -> Dict[str, str]:
    secret_name = os.environ.get('REDIS_AUTH_SECRET_NAME', 'watch-party-valkey-001-auth-token')
    redis_secret = get_optional_secret(secret_name) or {}

    if not redis_secret:
        bundled = _get_all_in_one_credentials() or {}
        if isinstance(bundled, dict):
            nested = bundled.get('redis')
            if isinstance(nested, dict):
                redis_secret = nested
            else:
                redis_secret = {
                    'url': bundled.get('redis_url'),
                    'password': bundled.get('redis_password') or bundled.get('redis_token'),
                    'token': bundled.get('redis_token'),
                    'username': bundled.get('redis_username'),
                    'use_ssl': bundled.get('redis_use_ssl'),
                }

    if isinstance(redis_secret, dict):
        return {key: value for key, value in redis_secret.items() if value is not None}

    return {}


def _extract_database_settings(secret_payload: Optional[Dict[str, Dict]]) -> Dict[str, str]:
    if not secret_payload or not isinstance(secret_payload, dict):
        return {}

    if isinstance(secret_payload.get('database'), dict):
        return secret_payload['database']

    for candidate in ('db', 'db_credentials', 'postgres', 'postgresql'):
        value = secret_payload.get(candidate)
        if isinstance(value, dict):
            return value

    return {
        'name': secret_payload.get('database_name') or secret_payload.get('name'),
        'username': secret_payload.get('database_username') or secret_payload.get('username'),
        'password': secret_payload.get('database_password') or secret_payload.get('password'),
        'host': secret_payload.get('database_host') or secret_payload.get('host'),
        'port': secret_payload.get('database_port') or secret_payload.get('port'),
        'url': secret_payload.get('database_url') or secret_payload.get('url'),
        'redis': secret_payload.get('redis') if isinstance(secret_payload.get('redis'), dict) else {},
    }


def _inject_redis_auth(redis_url: str, redis_secret: Dict[str, str]) -> str:
    if not redis_secret:
        return redis_url

    password = redis_secret.get('password') or redis_secret.get('token') or redis_secret.get('auth_token')
    username = redis_secret.get('username')

    if not password and not username:
        return redis_url

    parsed = urlparse(redis_url)
    if not parsed.hostname:
        return redis_url

    if parsed.password or parsed.username:
        return redis_url

    credentials = ''
    if username and password:
        credentials = f"{username}:{password}@"
    elif password:
        credentials = f":{password}@"
    elif username:
        credentials = f"{username}@"

    host = parsed.hostname
    if parsed.port:
        host = f"{host}:{parsed.port}"

    rebuilt = parsed._replace(netloc=f"{credentials}{host}")
    return urlunparse(rebuilt)
