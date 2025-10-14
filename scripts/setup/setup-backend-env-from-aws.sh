#!/bin/bash

# Setup Backend Environment from AWS Secrets
# This script fetches credentials from AWS Secrets Manager and configures the backend

set -e

echo "🔐 Setting up backend environment from AWS Secrets Manager..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Please run: ./configure-aws.sh first"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials verified${NC}"
echo ""

# Fetch secrets from AWS Secrets Manager
echo -e "${BLUE}📥 Fetching secrets from AWS Secrets Manager...${NC}"

# Get all-in-one-credentials secret
echo "Fetching all-in-one-credentials..."
ALL_IN_ONE_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id all-in-one-credentials \
    --region eu-west-3 \
    --query SecretString \
    --output text)

# Get Valkey auth token
echo "Fetching watch-party-valkey-001-auth-token..."
VALKEY_TOKEN=$(aws secretsmanager get-secret-value \
    --secret-id watch-party-valkey-001-auth-token \
    --region eu-west-3 \
    --query SecretString \
    --output text)

echo -e "${GREEN}✅ Secrets fetched successfully${NC}"
echo ""

# Parse the all-in-one-credentials JSON
echo -e "${BLUE}🔧 Parsing credentials...${NC}"

# Extract values using jq (more reliable than grep)
if ! command -v jq &> /dev/null; then
    echo "Installing jq for JSON parsing..."
    sudo apt-get update -qq && sudo apt-get install -qq -y jq
fi

# Extract values from all-in-one-credentials
DB_USER=$(echo "$ALL_IN_ONE_SECRET" | jq -r '.username // "admin"')
DB_PASSWORD=$(echo "$ALL_IN_ONE_SECRET" | jq -r '.password // empty')

# Extract Valkey token
VALKEY_PASSWORD=$(echo "$VALKEY_TOKEN" | jq -r '.auth_token // .token // empty')

# AWS Infrastructure Endpoints (from .env.example)
DB_NAME="watchparty_prod"
DB_HOST="watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com"
DB_PORT="5432"

VALKEY_HOST="master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"
VALKEY_PORT="6379"

# Note: SES credentials should be handled via IAM roles in production
# For dev environment, we'll use console backend
SES_REGION="eu-west-3"

echo -e "${GREEN}✅ Credentials parsed${NC}"
echo ""

# Create backend .env file
BACKEND_ENV_FILE="/workspaces/watch-party/backend/.env"

echo -e "${BLUE}📝 Creating backend .env file...${NC}"

cat > "$BACKEND_ENV_FILE" <<EOF
# Django Settings
DEBUG=True
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
ALLOWED_HOSTS=localhost,127.0.0.1,*.githubpreview.dev,*.app.github.dev

# Database Configuration (AWS RDS PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_SSL_MODE=require
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require

# Redis/Valkey Configuration (AWS ElastiCache)
REDIS_HOST=${VALKEY_HOST}
REDIS_PORT=${VALKEY_PORT}
REDIS_PASSWORD=${VALKEY_PASSWORD}
REDIS_DB=0
REDIS_USE_SSL=True
REDIS_URL=rediss://:${VALKEY_PASSWORD}@${VALKEY_HOST}:${VALKEY_PORT}/0?ssl_cert_reqs=none
CELERY_BROKER_URL=rediss://:${VALKEY_PASSWORD}@${VALKEY_HOST}:${VALKEY_PORT}/2?ssl_cert_reqs=none
CELERY_RESULT_BACKEND=rediss://:${VALKEY_PASSWORD}@${VALKEY_HOST}:${VALKEY_PORT}/3?ssl_cert_reqs=none

# AWS SES Configuration (Using console backend for dev environment)
# Note: In production, SES should use IAM roles
AWS_SES_REGION_NAME=${SES_REGION}
AWS_SES_REGION_ENDPOINT=email.${SES_REGION}.amazonaws.com
DEFAULT_FROM_EMAIL=noreply@watch-party.com

# Email Backend (Console for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=email-smtp.${SES_REGION}.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# CORS and Frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000
CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\\.app\\.github\\.dev$
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000,https://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

# WebSocket Configuration
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer
CHANNEL_LAYERS_HOST=${VALKEY_HOST}
CHANNEL_LAYERS_PORT=${VALKEY_PORT}
CHANNEL_LAYERS_PASSWORD=${VALKEY_PASSWORD}
CHANNEL_LAYERS_CONFIG_HOSTS=rediss://:${VALKEY_PASSWORD}@${VALKEY_HOST}:${VALKEY_PORT}/4?ssl_cert_reqs=none

# JWT Authentication
JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
JWT_REFRESH_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7

# Development Settings
ENVIRONMENT=development
LOG_LEVEL=DEBUG
DJANGO_SETTINGS_MODULE=config.settings.development
EOF

echo -e "${GREEN}✅ Backend .env file created at: ${BACKEND_ENV_FILE}${NC}"
echo ""

# Display summary
echo -e "${BLUE}📊 Configuration Summary:${NC}"
echo -e "  Database:     ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo -e "  Valkey/Redis: ${VALKEY_HOST}:${VALKEY_PORT}"
echo -e "  SES Region:   ${SES_REGION}"
echo ""

# Test database connection
echo -e "${BLUE}🧪 Testing database connection...${NC}"

# Install PostgreSQL client if needed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL client..."
    sudo apt-get update -qq && sudo apt-get install -qq -y postgresql-client
fi

if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT version();" &> /dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    DB_VERSION=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT version();" 2>/dev/null | head -n1 | xargs)
    echo -e "   ${DB_VERSION}"
else
    echo -e "${YELLOW}⚠️  Database connection test failed${NC}"
    echo "   This might be due to:"
    echo "   - Security group rules restricting access"
    echo "   - VPC configuration"
    echo "   - The database might still be provisioning"
fi

echo ""

# Test Valkey connection
echo -e "${BLUE}🧪 Testing Valkey/Redis connection...${NC}"

# Install Redis CLI if needed
if ! command -v redis-cli &> /dev/null; then
    echo "Installing Redis CLI..."
    sudo apt-get install -qq -y redis-tools
fi

# Test with TLS (production Valkey requires TLS)
if redis-cli -h "${VALKEY_HOST}" -p "${VALKEY_PORT}" -a "${VALKEY_PASSWORD}" --tls --insecure --no-auth-warning ping &> /dev/null; then
    echo -e "${GREEN}✅ Valkey/Redis connection successful (TLS)${NC}"
    REDIS_INFO=$(redis-cli -h "${VALKEY_HOST}" -p "${VALKEY_PORT}" -a "${VALKEY_PASSWORD}" --tls --insecure --no-auth-warning INFO server 2>/dev/null | grep "redis_version" || echo "Valkey/Redis")
    echo -e "   ${REDIS_INFO}"
else
    echo -e "${YELLOW}⚠️  Valkey/Redis connection test failed${NC}"
    echo "   This might be due to:"
    echo "   - Security group rules restricting access"
    echo "   - TLS certificate validation"
    echo "   - Network configuration"
fi

echo ""
echo -e "${GREEN}✅ Backend environment setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. cd backend"
echo "  2. pip install -r requirements.txt"
echo "  3. python manage.py migrate"
echo "  4. python manage.py runserver"
echo ""
