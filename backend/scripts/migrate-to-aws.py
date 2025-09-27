#!/usr/bin/env python3

"""
Data Migration Script - Local to AWS
Migrates data from local PostgreSQL to AWS RDS and from local Redis to AWS ElastiCache
"""

import os
import sys
import json
import logging
import subprocess
from pathlib import Path
from datetime import datetime

# Add the project root to Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('aws-migration.log')
    ]
)
logger = logging.getLogger(__name__)

class DatabaseMigrator:
    def __init__(self):
        self.backup_dir = Path('backups')
        self.backup_dir.mkdir(exist_ok=True)
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
    def load_environment(self):
        """Load environment variables"""
        try:
            from decouple import config
            self.config = config
            logger.info("Environment variables loaded")
            return True
        except Exception as e:
            logger.error(f"Failed to load environment: {e}")
            return False
    
    def backup_local_database(self):
        """Create backup of local PostgreSQL database"""
        logger.info("Creating backup of local database...")
        
        try:
            # Local database configuration
            local_db_config = {
                'host': 'localhost',
                'port': '5432',
                'database': self.config('DATABASE_NAME', default='watchparty_dev'),
                'username': self.config('DATABASE_USER', default='postgres'),
                'password': self.config('DATABASE_PASSWORD', default=''),
            }
            
            backup_file = self.backup_dir / f'local_db_backup_{self.timestamp}.sql'
            
            # Create pg_dump command
            cmd = [
                'pg_dump',
                f"--host={local_db_config['host']}",
                f"--port={local_db_config['port']}",
                f"--username={local_db_config['username']}",
                f"--dbname={local_db_config['database']}",
                '--no-password',
                '--verbose',
                '--clean',
                '--no-acl',
                '--no-owner',
                f'--file={backup_file}',
            ]
            
            # Set PGPASSWORD environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = local_db_config['password']
            
            logger.info(f"Running: {' '.join(cmd[:6])} [PASSWORD HIDDEN] {' '.join(cmd[7:])}")
            
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"✅ Local database backup created: {backup_file}")
                return str(backup_file)
            else:
                logger.error(f"❌ Database backup failed: {result.stderr}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Database backup error: {e}")
            return None
    
    def restore_to_aws_rds(self, backup_file):
        """Restore backup to AWS RDS"""
        logger.info("Restoring database to AWS RDS...")
        
        try:
            # Parse DATABASE_URL for AWS RDS
            database_url = self.config('DATABASE_URL', default='')
            if not database_url:
                logger.error("DATABASE_URL not found. Please ensure AWS RDS is configured.")
                return False
            
            # Extract connection details from DATABASE_URL
            from urllib.parse import urlparse
            parsed = urlparse(database_url)
            
            aws_db_config = {
                'host': parsed.hostname,
                'port': parsed.port or 5432,
                'database': parsed.path[1:],  # Remove leading '/'
                'username': parsed.username,
                'password': parsed.password,
            }
            
            # Create psql command for restore
            cmd = [
                'psql',
                f"--host={aws_db_config['host']}",
                f"--port={aws_db_config['port']}",
                f"--username={aws_db_config['username']}",
                f"--dbname={aws_db_config['database']}",
                '--no-password',
                '--quiet',
                f'--file={backup_file}',
            ]
            
            # Set PGPASSWORD environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = aws_db_config['password']
            
            logger.info(f"Running: {' '.join(cmd[:6])} [PASSWORD HIDDEN] {' '.join(cmd[7:])}")
            
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("✅ Database restored to AWS RDS successfully")
                return True
            else:
                logger.error(f"❌ Database restore failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Database restore error: {e}")
            return False
    
    def migrate_redis_data(self):
        """Migrate Redis data from local to AWS ElastiCache"""
        logger.info("Migrating Redis data to AWS ElastiCache...")
        
        try:
            import redis
            from urllib.parse import urlparse
            
            # Local Redis connection
            local_redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            
            # AWS ElastiCache connection
            redis_url = self.config('REDIS_URL', default='')
            if not redis_url:
                logger.warning("REDIS_URL not found. Skipping Redis migration.")
                return True
            
            parsed = urlparse(redis_url)
            redis_config = {
                'host': parsed.hostname,
                'port': parsed.port or 6379,
                'db': int(parsed.path[1:]) if parsed.path and len(parsed.path) > 1 else 0,
                'decode_responses': True,
            }
            
            if parsed.password:
                redis_config['password'] = parsed.password
                
            if parsed.scheme == 'rediss':
                redis_config.update({
                    'ssl': True,
                    'ssl_cert_reqs': None,
                    'ssl_check_hostname': False,
                })
            
            aws_redis = redis.Redis(**redis_config)
            
            # Test connections
            local_redis.ping()
            aws_redis.ping()
            
            # Get all keys from local Redis
            local_keys = local_redis.keys('*')
            
            if not local_keys:
                logger.info("No Redis keys found in local instance")
                return True
            
            logger.info(f"Found {len(local_keys)} keys in local Redis")
            
            # Migrate keys
            migrated = 0
            failed = 0
            
            for key in local_keys:
                try:
                    # Get key type and data
                    key_type = local_redis.type(key)
                    
                    if key_type == 'string':
                        value = local_redis.get(key)
                        ttl = local_redis.ttl(key)
                        if ttl > 0:
                            aws_redis.setex(key, ttl, value)
                        else:
                            aws_redis.set(key, value)
                    elif key_type == 'hash':
                        hash_data = local_redis.hgetall(key)
                        aws_redis.hmset(key, hash_data)
                        ttl = local_redis.ttl(key)
                        if ttl > 0:
                            aws_redis.expire(key, ttl)
                    elif key_type == 'list':
                        list_data = local_redis.lrange(key, 0, -1)
                        for item in list_data:
                            aws_redis.lpush(key, item)
                        ttl = local_redis.ttl(key)
                        if ttl > 0:
                            aws_redis.expire(key, ttl)
                    elif key_type == 'set':
                        set_data = local_redis.smembers(key)
                        for item in set_data:
                            aws_redis.sadd(key, item)
                        ttl = local_redis.ttl(key)
                        if ttl > 0:
                            aws_redis.expire(key, ttl)
                    elif key_type == 'zset':
                        zset_data = local_redis.zrange(key, 0, -1, withscores=True)
                        for member, score in zset_data:
                            aws_redis.zadd(key, {member: score})
                        ttl = local_redis.ttl(key)
                        if ttl > 0:
                            aws_redis.expire(key, ttl)
                    
                    migrated += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to migrate key '{key}': {e}")
                    failed += 1
            
            logger.info(f"✅ Redis migration completed: {migrated} keys migrated, {failed} failed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis migration error: {e}")
            return False
    
    def run_django_migrations(self):
        """Run Django migrations on AWS RDS"""
        logger.info("Running Django migrations on AWS RDS...")
        
        try:
            # Set environment to use production settings (AWS)
            env = os.environ.copy()
            env['DJANGO_SETTINGS_MODULE'] = 'watchparty.settings.production'
            
            # Run migrations
            cmd = [sys.executable, 'manage.py', 'migrate', '--run-syncdb']
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("✅ Django migrations completed successfully")
                logger.info(result.stdout)
                return True
            else:
                logger.error(f"❌ Django migrations failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Django migrations error: {e}")
            return False
    
    def create_superuser(self):
        """Create superuser in AWS RDS"""
        logger.info("Creating superuser in AWS RDS...")
        
        try:
            env = os.environ.copy()
            env['DJANGO_SETTINGS_MODULE'] = 'watchparty.settings.production'
            
            # Check if superuser already exists
            cmd = [
                sys.executable, 'manage.py', 'shell', '-c',
                "from apps.authentication.models import User; print(User.objects.filter(is_superuser=True).exists())"
            ]
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if 'True' in result.stdout:
                logger.info("Superuser already exists. Skipping creation.")
                return True
            
            # Create superuser
            logger.info("No superuser found. You'll need to create one manually.")
            logger.info("Run: python manage.py createsuperuser")
            return True
            
        except Exception as e:
            logger.error(f"❌ Superuser check error: {e}")
            return False
    
    def validate_migration(self):
        """Validate the migration by checking data in AWS"""
        logger.info("Validating migration...")
        
        try:
            env = os.environ.copy()
            env['DJANGO_SETTINGS_MODULE'] = 'watchparty.settings.production'
            
            validation_script = """
import django
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

# Check database connection
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
    table_count = cursor.fetchone()[0]
    print(f"Tables in database: {table_count}")

# Check user count
user_count = User.objects.count()
print(f"Users in database: {user_count}")

print("Migration validation completed.")
"""
            
            cmd = [sys.executable, 'manage.py', 'shell']
            result = subprocess.run(cmd, env=env, input=validation_script, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("✅ Migration validation successful")
                logger.info(result.stdout)
                return True
            else:
                logger.error(f"❌ Migration validation failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Migration validation error: {e}")
            return False

def main():
    """Main migration function"""
    logger.info("=" * 70)
    logger.info("Data Migration - Local to AWS")
    logger.info("=" * 70)
    
    migrator = DatabaseMigrator()
    
    # Load environment
    if not migrator.load_environment():
        return 1
    
    # Confirmation
    print("\n⚠️  WARNING: This will migrate your local data to AWS.")
    print("Make sure you have:")
    print("1. Created AWS RDS and ElastiCache instances")
    print("2. Updated your .env file with AWS credentials")
    print("3. Tested AWS connections")
    print()
    
    confirm = input("Continue with migration? (yes/no): ").lower().strip()
    if confirm != 'yes':
        logger.info("Migration cancelled by user.")
        return 0
    
    # Migration steps
    steps = [
        ("Backup local database", migrator.backup_local_database),
        ("Run Django migrations on AWS", migrator.run_django_migrations),
        ("Migrate Redis data", migrator.migrate_redis_data),
        ("Create superuser check", migrator.create_superuser),
        ("Validate migration", migrator.validate_migration),
    ]
    
    backup_file = None
    
    for step_name, step_func in steps:
        logger.info(f"\n{'-' * 50}")
        logger.info(f"Step: {step_name}")
        logger.info(f"{'-' * 50}")
        
        try:
            if step_name == "Backup local database":
                result = step_func()
                if result:
                    backup_file = result
                    success = True
                else:
                    success = False
            else:
                success = step_func()
            
            if not success:
                logger.error(f"Step '{step_name}' failed. Stopping migration.")
                return 1
                
        except Exception as e:
            logger.error(f"Unexpected error in step '{step_name}': {e}")
            return 1
    
    # Restore database if backup exists
    if backup_file:
        logger.info(f"\n{'-' * 50}")
        logger.info("Step: Restore database to AWS RDS")
        logger.info(f"{'-' * 50}")
        
        if not migrator.restore_to_aws_rds(backup_file):
            logger.error("Database restore failed. Migration incomplete.")
            return 1
    
    logger.info(f"\n{'=' * 70}")
    logger.info("MIGRATION COMPLETED SUCCESSFULLY")
    logger.info(f"{'=' * 70}")
    
    logger.info("🎉 Your data has been migrated to AWS!")
    logger.info("Next steps:")
    logger.info("1. Test your application with AWS services")
    logger.info("2. Update your deployment configuration")
    logger.info("3. Consider removing local database instances")
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
