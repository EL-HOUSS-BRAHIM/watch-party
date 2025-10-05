#!/bin/bash

# =============================================================================
# AWS AND ENVIRONMENT SETUP SCRIPT
# =============================================================================
# Configures AWS CLI, environment files, and tests AWS connectivity

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"

log_info "Configuring AWS and environment..."

# Install AWS CLI if needed
if ! command_exists aws; then
    log_info "Installing AWS CLI..."
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -o -q awscliv2.zip
    ./aws/install --install-dir $HOME/aws-cli --bin-dir $HOME/aws-cli-bin --update
    export PATH="$HOME/aws-cli-bin:$PATH"
    echo 'export PATH="$HOME/aws-cli-bin:$PATH"' >> ~/.bashrc
    rm -rf aws awscliv2.zip
    log_success "AWS CLI installed: $(aws --version)"
else
    log_success "AWS CLI already installed: $(aws --version)"
fi

# Configure AWS
mkdir -p ~/.aws
cat > ~/.aws/config << 'AWSCONFIG'
[default]
region = eu-west-3
output = json
AWSCONFIG

# Configure credentials if provided
if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    log_info "Configuring AWS credentials..."
    cat > ~/.aws/credentials << AWSCREDS
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
AWSCREDS
    chmod 600 ~/.aws/credentials
    
    # Fix permissions for container access (container runs as UID 1000, host is UID 1001)
    log_info "Setting AWS credentials permissions for container access..."
    chmod 644 ~/.aws/credentials ~/.aws/config
    
    log_success "AWS credentials configured"
else
    log_info "Using IAM role for AWS access"
fi

# Test AWS connectivity
log_info "Testing AWS connectivity..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    exit_with_error "AWS configuration failed. Check credentials or IAM role."
fi
log_success "AWS connectivity confirmed"

# Test Secrets Manager access
log_info "Testing Secrets Manager access..."
if aws secretsmanager get-secret-value --secret-id all-in-one-credentials --region eu-west-3 > /dev/null 2>&1; then
    log_success "AWS Secrets Manager access confirmed"
else
    log_warning "Secrets Manager access test failed - check permissions"
fi

# Generate production environment files
log_info "Creating production environment files..."

# Backend .env
cat > "$APP_DIR/backend/.env" << 'BACKEND_ENV'
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-in-production
DJANGO_SETTINGS_MODULE=config.settings.production
ALLOWED_HOSTS=35.181.116.57,be-watch-party.brahim-elhouss.me,watch-party.brahim-elhouss.me,localhost,127.0.0.1

# Database configuration will be dynamically loaded from AWS Secrets Manager
# No hardcoded DATABASE_URL - using get_database_config() function
# AWS credentials will be loaded from ~/.aws/credentials mounted in container
DB_NAME=watchparty_prod
DB_SSL_MODE=require

REDIS_HOST=master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com
REDIS_PORT=6379
REDIS_USE_SSL=True

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

USE_S3=true
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=eu-west-3

CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me
ENVIRONMENT=production
MAINTENANCE_MODE=False
REGISTRATION_ENABLED=True
GOOGLE_DRIVE_INTEGRATION_ENABLED=True
YOUTUBE_INTEGRATION_ENABLED=True
TWO_FACTOR_AUTH_ENABLED=True

# Additional CORS headers for proper preflight handling
CORS_ALLOW_HEADERS=accept,authorization,content-type,user-agent,x-csrftoken,x-requested-with
CORS_ALLOW_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_PREFLIGHT_MAX_AGE=86400

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@watchparty.com

JWT_SECRET_KEY=your-jwt-secret-key-change-this
JWT_REFRESH_SECRET_KEY=your-jwt-refresh-secret-key-change-this
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7

RATE_LIMIT_LOGIN=5/min
RATE_LIMIT_API=1000/hour
RATE_LIMIT_UPLOAD=10/hour
BACKEND_ENV

# Frontend .env.local
cat > "$APP_DIR/frontend/.env.local" << 'FRONTEND_ENV'
# Backend URL for server-side API calls (should use the real domain)
BACKEND_URL=https://be-watch-party.brahim-elhouss.me

# Public API URLs for client-side calls
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_FRONTEND_API=https://be-watch-party.brahim-elhouss.me/api
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=true
NEXT_PUBLIC_ENABLE_DISCORD=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
FRONTEND_ENV

log_success "Environment files created"

# Verify Django settings module
if grep -q "DJANGO_SETTINGS_MODULE=config.settings.production" "$APP_DIR/backend/.env"; then
    log_success "DJANGO_SETTINGS_MODULE correctly configured"
else
    log_warning "Django settings configuration issue"
fi

log_success "AWS and environment setup complete"
