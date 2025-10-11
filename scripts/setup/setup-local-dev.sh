#!/bin/bash

# Quick Setup for Local Development
# This sets up local PostgreSQL and Redis instead of AWS services

set -e

echo "🚀 Setting up local development environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Starting local PostgreSQL and Redis...${NC}"

# Start local services
docker-compose -f docker-compose.dev.yml up -d db redis

echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 3

# Update backend .env for local development
BACKEND_ENV="/workspaces/watch-party/backend/.env"

if [ -f "$BACKEND_ENV" ]; then
    echo -e "${BLUE}📝 Updating backend .env for local development...${NC}"
    
    # Backup original
    cp "$BACKEND_ENV" "${BACKEND_ENV}.aws.backup"
    
    # Update for local development
    cat > "$BACKEND_ENV" <<'EOF'
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-dev-local-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,*.githubpreview.dev,*.app.github.dev

# Database Configuration (Local PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=watchparty
DB_USER=watchparty
DB_PASSWORD=watchparty123
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://watchparty:watchparty123@localhost:5432/watchparty

# Redis Configuration (Local Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_USE_SSL=False
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3

# Email Backend (Console for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@watchparty.com

# CORS and Frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

# WebSocket Configuration
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer
CHANNEL_LAYERS_HOST=localhost
CHANNEL_LAYERS_PORT=6379
CHANNEL_LAYERS_CONFIG_HOSTS=redis://localhost:6379/4

# JWT Authentication
JWT_SECRET_KEY=local-dev-jwt-secret-key
JWT_REFRESH_SECRET_KEY=local-dev-jwt-refresh-secret-key
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7

# Development Settings
ENVIRONMENT=development
LOG_LEVEL=DEBUG
DJANGO_SETTINGS_MODULE=config.settings.development
EOF
    
    echo -e "${GREEN}✅ Backend .env updated for local development${NC}"
    echo -e "${YELLOW}   AWS configuration backed up to: ${BACKEND_ENV}.aws.backup${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env not found. Skipping update.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Local development environment ready!${NC}"
echo ""
echo -e "${BLUE}📊 Services Status:${NC}"
docker-compose -f docker-compose.dev.yml ps
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "  1. cd backend"
echo "  2. pip install -r requirements.txt"
echo "  3. python manage.py migrate"
echo "  4. python manage.py createsuperuser"
echo "  5. python manage.py runserver"
echo ""
echo -e "${YELLOW}To restore AWS configuration:${NC}"
echo "  cp backend/.env.aws.backup backend/.env"
echo ""
