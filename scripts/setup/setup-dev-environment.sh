#!/bin/bash

# =============================================================================
# Watch Party - Dev Container Environment Setup
# =============================================================================
# This script sets up the development environment with AWS credentials
# and creates the .env file for the backend with proper AWS service configs

set -e

echo "=== Watch Party Dev Environment Setup ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured!${NC}"
    echo "Please run: bash /tmp/setup-aws-creds.sh"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials configured${NC}"
aws sts get-caller-identity | jq -r '"  User: \(.Arn)"'
echo ""

# Fetch secrets from AWS Secrets Manager
echo "Fetching secrets from AWS Secrets Manager..."
echo ""

# Get database credentials
echo "→ Fetching database credentials..."
DB_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id all-in-one-credentials \
    --region eu-west-3 \
    --query 'SecretString' \
    --output text)

DB_USER=$(echo "$DB_SECRET" | jq -r '.username')
DB_PASSWORD=$(echo "$DB_SECRET" | jq -r '.password')

echo -e "${GREEN}  ✓ Database credentials retrieved${NC}"

# Get Valkey/Redis auth token
echo "→ Fetching Valkey auth token..."
REDIS_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id watch-party-valkey-001-auth-token \
    --region eu-west-3 \
    --query 'SecretString' \
    --output text)

REDIS_PASSWORD=$(echo "$REDIS_SECRET" | jq -r '.token')

echo -e "${GREEN}  ✓ Valkey auth token retrieved${NC}"
echo ""

# AWS service endpoints (from .env.example)
DB_HOST="watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="watchparty_prod"

REDIS_HOST="master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"
REDIS_PORT="6379"

# Create backend .env file
ENV_FILE="/workspaces/watch-party/backend/.env"

echo "Creating backend .env file..."
cat > "$ENV_FILE" << EOF
# =============================================================================
# WATCH PARTY BACKEND - DEVELOPMENT ENVIRONMENT
# =============================================================================
# Auto-generated on $(date)
# AWS Credentials: $(aws sts get-caller-identity | jq -r .Arn)

# =============================================================================
# CORE DJANGO SETTINGS
# =============================================================================
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

# =============================================================================
# DATABASE CONFIGURATION - AWS RDS PostgreSQL
# =============================================================================
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_SSL_MODE=require

# =============================================================================
# REDIS/VALKEY CONFIGURATION - AWS ElastiCache
# =============================================================================
REDIS_URL=rediss://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0?ssl_cert_reqs=none
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_USE_SSL=True

# Celery Broker (using Redis DB 2)
CELERY_BROKER_URL=rediss://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/2?ssl_cert_reqs=none
CELERY_RESULT_BACKEND=rediss://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/3?ssl_cert_reqs=none

# =============================================================================
# AWS CONFIGURATION
# =============================================================================
AWS_REGION=eu-west-3
AWS_STORAGE_BUCKET_NAME=watch-party-uploads
USE_AWS_SECRETS=True
ALL_IN_ONE_SECRET_NAME=all-in-one-credentials
REDIS_AUTH_SECRET_NAME=watch-party-valkey-001-auth-token

# =============================================================================
# EMAIL CONFIGURATION - AWS SES
# =============================================================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.eu-west-3.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=\${AWS_SES_SMTP_USER}
EMAIL_HOST_PASSWORD=\${AWS_SES_SMTP_PASSWORD}
DEFAULT_FROM_EMAIL=noreply@watch-party.brahim-elhouss.me

# =============================================================================
# FRONTEND URL
# =============================================================================
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# =============================================================================
# CORS SETTINGS
# =============================================================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=True
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# =============================================================================
# WEBSOCKET CONFIGURATION
# =============================================================================
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer
CHANNEL_LAYERS_CONFIG_HOSTS=rediss://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/1?ssl_cert_reqs=none

# =============================================================================
# JWT SETTINGS
# =============================================================================
JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
JWT_REFRESH_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_SSL_REDIRECT=False

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=INFO
DJANGO_LOG_LEVEL=INFO

# =============================================================================
# RATE LIMITING
# =============================================================================
RATELIMIT_ENABLE=True
RATELIMIT_USE_CACHE=default

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_SOCIAL_AUTH=False
ENABLE_PAYMENTS=False
ENABLE_VIDEO_PROCESSING=False
EOF

echo -e "${GREEN}✓ Backend .env file created at: ${ENV_FILE}${NC}"
echo ""

# Test database connection
echo "Testing AWS RDS PostgreSQL connection..."
if command -v psql &> /dev/null; then
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT version();" &> /dev/null; then
        echo -e "${GREEN}  ✓ PostgreSQL connection successful${NC}"
    else
        echo -e "${YELLOW}  ! PostgreSQL connection failed (may need to install psql)${NC}"
    fi
else
    echo -e "${YELLOW}  ! psql not installed, skipping DB connection test${NC}"
fi
echo ""

# Test Redis connection
echo "Testing AWS ElastiCache Valkey connection..."
if python3 -c "import redis; r = redis.from_url('rediss://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0?ssl_cert_reqs=none'); r.ping(); print('OK')" &> /dev/null; then
    echo -e "${GREEN}  ✓ Valkey/Redis connection successful${NC}"
else
    echo -e "${YELLOW}  ! Valkey/Redis connection failed (may need to install redis-py)${NC}"
fi
echo ""

# Summary
echo "=== Setup Complete ==="
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "  Database: ${DB_HOST}"
echo "  Cache: ${REDIS_HOST}"
echo "  Region: eu-west-3"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Install Python dependencies:"
echo "     cd backend && pip install -r requirements.txt"
echo ""
echo "  2. Run database migrations:"
echo "     cd backend && python manage.py migrate"
echo ""
echo "  3. Create a superuser (optional):"
echo "     cd backend && python manage.py createsuperuser"
echo ""
echo "  4. Start the development server:"
echo "     cd backend && python manage.py runserver 0.0.0.0:8000"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
