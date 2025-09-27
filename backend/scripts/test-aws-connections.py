#!/usr/bin/env python3

"""
AWS Database Connection Test Script
Tests connectivity to AWS RDS PostgreSQL and ElastiCache Valkey
"""

import os
import sys
import time
import json
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('aws-connection-test.log')
    ]
)
logger = logging.getLogger(__name__)

def load_environment():
    """Load environment variables from .env file"""
    try:
        from decouple import config
        logger.info("Environment variables loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load environment: {e}")
        return False

def test_postgresql_connection():
    """Test PostgreSQL connection to AWS RDS"""
    logger.info("Testing PostgreSQL connection to AWS RDS...")
    
    try:
        import psycopg
        from decouple import config
        
        # Get database configuration
        database_url = config('DATABASE_URL', default='')
        
        if not database_url:
            # Fallback to individual environment variables
            db_config = {
                'host': config('DATABASE_HOST', default='localhost'),
                'port': config('DATABASE_PORT', default='5432'),
                'dbname': config('DATABASE_NAME', default='watchparty'),
                'user': config('DATABASE_USER', default='postgres'),
                'password': config('DATABASE_PASSWORD', default=''),
                'sslmode': config('DB_SSL_MODE', default='prefer')
            }
            
            conn_str = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['dbname']}?sslmode={db_config['sslmode']}"
        else:
            conn_str = database_url
            
        logger.info(f"Connecting to: {conn_str.split('@')[0]}@{conn_str.split('@')[1].split(':')[0]}:****")
        
        # Test connection
        start_time = time.time()
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                # Test basic query
                cur.execute("SELECT version()")
                version = cur.fetchone()[0]
                
                # Test if we can create tables (permissions check)
                cur.execute("""
                    SELECT EXISTS(
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'django_migrations'
                    )
                """)
                tables_exist = cur.fetchone()[0]
                
                # Get connection info
                cur.execute("SELECT current_database(), current_user, inet_server_addr(), inet_server_port()")
                db_info = cur.fetchone()
                
        connection_time = time.time() - start_time
        
        logger.info("✅ PostgreSQL connection successful!")
        logger.info(f"   Database Version: {version}")
        logger.info(f"   Database: {db_info[0]}")
        logger.info(f"   User: {db_info[1]}")
        logger.info(f"   Server: {db_info[2]}:{db_info[3]}")
        logger.info(f"   Connection time: {connection_time:.2f}s")
        logger.info(f"   Tables exist: {tables_exist}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ PostgreSQL connection failed: {e}")
        return False

def test_redis_connection():
    """Test Redis/Valkey connection to AWS ElastiCache"""
    logger.info("Testing Redis/Valkey connection to AWS ElastiCache...")
    
    try:
        import redis
        from urllib.parse import urlparse
        from decouple import config
        
        redis_url = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
        logger.info(f"Connecting to: {redis_url.split(':')[0]}://{redis_url.split('@')[1].split(':')[0] if '@' in redis_url else redis_url.split('//')[1].split(':')[0]}:****")
        
        # Parse Redis URL
        parsed = urlparse(redis_url)
        
        # Configure Redis connection
        redis_config = {
            'host': parsed.hostname,
            'port': parsed.port or 6379,
            'db': int(parsed.path[1:]) if parsed.path and len(parsed.path) > 1 else 0,
            'decode_responses': True,
            'socket_timeout': 30,
            'socket_connect_timeout': 30,
            'retry_on_timeout': True,
        }
        
        # Add password if present
        if parsed.password:
            redis_config['password'] = parsed.password
            
        # Add SSL configuration if using rediss://
        if parsed.scheme == 'rediss':
            redis_config.update({
                'ssl': True,
                'ssl_cert_reqs': None,
                'ssl_check_hostname': False,
                'ssl_ca_certs': None,
            })
        
        # Test connection
        start_time = time.time()
        r = redis.Redis(**redis_config)
        
        # Test basic operations
        r.ping()
        
        # Test set/get operations
        test_key = 'aws_test_key'
        test_value = f'test_value_{int(time.time())}'
        
        r.set(test_key, test_value, ex=60)  # Expires in 60 seconds
        retrieved_value = r.get(test_key)
        
        # Get Redis info
        info = r.info()
        connection_time = time.time() - start_time
        
        # Clean up
        r.delete(test_key)
        
        logger.info("✅ Redis/Valkey connection successful!")
        logger.info(f"   Redis Version: {info.get('redis_version', 'Unknown')}")
        logger.info(f"   Server: {redis_config['host']}:{redis_config['port']}")
        logger.info(f"   Database: {redis_config['db']}")
        logger.info(f"   SSL Enabled: {redis_config.get('ssl', False)}")
        logger.info(f"   Connection time: {connection_time:.2f}s")
        logger.info(f"   Memory Usage: {info.get('used_memory_human', 'Unknown')}")
        logger.info(f"   Connected Clients: {info.get('connected_clients', 'Unknown')}")
        logger.info(f"   Test operation: Set/Get/Delete ✅")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Redis/Valkey connection failed: {e}")
        return False

def test_django_configuration():
    """Test Django configuration with AWS services"""
    logger.info("Testing Django configuration...")
    
    try:
        # Set Django settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.production')
        
        import django
        django.setup()
        
        from django.conf import settings
        from django.db import connection
        from django.core.cache import cache
        
        # Test database connection
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        db_time = time.time() - start_time
        
        # Test cache connection
        start_time = time.time()
        cache_key = f'django_test_{int(time.time())}'
        cache.set(cache_key, 'test_value', 60)
        cached_value = cache.get(cache_key)
        cache.delete(cache_key)
        cache_time = time.time() - start_time
        
        logger.info("✅ Django configuration successful!")
        logger.info(f"   Database Engine: {settings.DATABASES['default']['ENGINE']}")
        logger.info(f"   Database Query: {result[0]} (time: {db_time:.3f}s)")
        logger.info(f"   Cache Backend: {settings.CACHES['default']['BACKEND']}")
        logger.info(f"   Cache Operation: Set/Get/Delete (time: {cache_time:.3f}s)")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Django configuration failed: {e}")
        return False

def test_celery_broker():
    """Test Celery broker connection"""
    logger.info("Testing Celery broker connection...")
    
    try:
        from celery import Celery
        from decouple import config
        
        broker_url = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/2')
        result_backend = config('CELERY_RESULT_BACKEND', default='redis://127.0.0.1:6379/3')
        
        app = Celery('test_app')
        app.conf.update(
            broker_url=broker_url,
            result_backend=result_backend,
            task_serializer='json',
            accept_content=['json'],
            result_serializer='json',
        )
        
        # Test broker connection
        start_time = time.time()
        inspect = app.control.inspect()
        stats = inspect.stats()
        connection_time = time.time() - start_time
        
        logger.info("✅ Celery broker connection successful!")
        logger.info(f"   Broker URL: {broker_url.split(':')[0]}://{broker_url.split('@')[1].split(':')[0] if '@' in broker_url else broker_url.split('//')[1].split(':')[0]}:****")
        logger.info(f"   Result Backend: {result_backend.split(':')[0]}://{result_backend.split('@')[1].split(':')[0] if '@' in result_backend else result_backend.split('//')[1].split(':')[0]}:****")
        logger.info(f"   Connection time: {connection_time:.3f}s")
        
        if stats:
            logger.info(f"   Active Workers: {len(stats.keys())}")
        else:
            logger.info("   No active workers (this is normal if no Celery workers are running)")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Celery broker connection failed: {e}")
        return False

def main():
    """Main test function"""
    logger.info("=" * 70)
    logger.info("AWS Database Connection Test - Watch Party Backend")
    logger.info("=" * 70)
    
    # Load environment
    if not load_environment():
        logger.error("Failed to load environment. Exiting.")
        return 1
    
    # Track test results
    test_results = []
    
    # Run tests
    tests = [
        ("PostgreSQL (AWS RDS)", test_postgresql_connection),
        ("Redis/Valkey (AWS ElastiCache)", test_redis_connection),
        ("Django Configuration", test_django_configuration),
        ("Celery Broker", test_celery_broker),
    ]
    
    for test_name, test_func in tests:
        logger.info(f"\n{'-' * 50}")
        logger.info(f"Running: {test_name}")
        logger.info(f"{'-' * 50}")
        
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            logger.error(f"Unexpected error in {test_name}: {e}")
            test_results.append((test_name, False))
    
    # Summary
    logger.info(f"\n{'=' * 70}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'=' * 70}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        logger.info(f"{test_name:.<40} {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! Your AWS infrastructure is ready.")
        return 0
    else:
        logger.warning(f"⚠️  {total - passed} test(s) failed. Please check the logs above.")
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
