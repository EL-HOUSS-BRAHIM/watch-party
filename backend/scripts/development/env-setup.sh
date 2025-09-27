#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - ENVIRONMENT CONFIGURATION SCRIPT
# =============================================================================
# Automatically configures .env file with intelligent defaults
# Author: Watch Party Team
# Version: 1.0
# Last Updated: August 11, 2025

set -e

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Emoji for better UX
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly ROCKET="🚀"
readonly GEAR="⚙️"
readonly PENCIL="✏️"
readonly LOCK="🔒"

# Default configuration
DEFAULT_BACKEND_DOMAIN="be-watch-party.brahim-elhouss.me"
DEFAULT_FRONTEND_DOMAIN="watch-party.brahim-elhouss.me"
DEFAULT_ENVIRONMENT="development"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

log_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

log_title() {
    echo -e "${WHITE}$1${NC}"
}

log_action() {
    echo -e "${CYAN}${GEAR} $1${NC}"
}

show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                     ENVIRONMENT CONFIGURATION WIZARD                        ║
║                          Watch Party Backend                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Generate secure random string
generate_secret() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Generate Django secret key
generate_django_secret() {
    python3 -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
print(''.join(secrets.choice(alphabet) for i in range(64)))
"
}

# Prompt for user input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local secure="${4:-false}"
    
    if [[ "$secure" == "true" ]]; then
        echo -ne "${CYAN}${PENCIL} $prompt [default: $default]: ${NC}"
        read -s user_input
        echo
    else
        echo -ne "${CYAN}${PENCIL} $prompt [default: $default]: ${NC}"
        read user_input
    fi
    
    if [[ -z "$user_input" ]]; then
        eval "$var_name='$default'"
    else
        eval "$var_name='$user_input'"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate email format
validate_email() {
    local email="$1"
    if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Validate URL format
validate_url() {
    local url="$1"
    if [[ $url =~ ^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/.*)?$ ]] || [[ $url =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Check database connection
check_database_connection() {
    local db_url="$1"
    log_action "Testing database connection..."
    
    if command_exists psql; then
        if psql "$db_url" -c "SELECT 1;" >/dev/null 2>&1; then
            log_success "Database connection successful"
            return 0
        else
            log_warning "Database connection failed"
            return 1
        fi
    else
        log_warning "psql not found, skipping database connection test"
        return 0
    fi
}

# Check Redis connection
check_redis_connection() {
    local redis_url="$1"
    log_action "Testing Redis connection..."
    
    if command_exists redis-cli; then
        local host=$(echo "$redis_url" | cut -d'/' -f3 | cut -d':' -f1)
        local port=$(echo "$redis_url" | cut -d'/' -f3 | cut -d':' -f2)
        
        if redis-cli -h "$host" -p "$port" ping >/dev/null 2>&1; then
            log_success "Redis connection successful"
            return 0
        else
            log_warning "Redis connection failed"
            return 1
        fi
    else
        log_warning "redis-cli not found, skipping Redis connection test"
        return 0
    fi
}

# =============================================================================
# ENVIRONMENT TEMPLATES
# =============================================================================

create_development_env() {
    local backend_domain="$1"
    local frontend_domain="$2"
    
    log_action "Creating development environment configuration..."
    
    cat > "$ENV_FILE" << EOF
# =============================================================================
# WATCH PARTY BACKEND ENVIRONMENT CONFIGURATION
# =============================================================================
# Generated automatically by env-setup.sh on $(date)
# Environment: Development

# =============================================================================
# CORE DJANGO SETTINGS
# =============================================================================
DEBUG=True
SECRET_KEY=$(generate_django_secret)
DJANGO_SETTINGS_MODULE=watchparty.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,$backend_domain

# =============================================================================
# DOMAIN CONFIGURATION
# =============================================================================
BACKEND_DOMAIN=$backend_domain
FRONTEND_DOMAIN=$frontend_domain
BACKEND_URL=https://$backend_domain
FRONTEND_URL=https://$frontend_domain

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/watchparty_dev
DB_NAME=watchparty_dev
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=redis123
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3
CHANNEL_LAYERS_CONFIG_HOSTS=redis://localhost:6379/4

# =============================================================================
# JWT AUTHENTICATION
# =============================================================================
JWT_SECRET_KEY=$(generate_secret 64)
JWT_REFRESH_SECRET_KEY=$(generate_secret 64)
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@$backend_domain

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://$frontend_domain

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# =============================================================================
# MONITORING
# =============================================================================
ENVIRONMENT=development
SENTRY_DSN=

# =============================================================================
# FEATURE FLAGS
# =============================================================================
MAINTENANCE_MODE=False
REGISTRATION_ENABLED=True
GOOGLE_DRIVE_INTEGRATION_ENABLED=True
YOUTUBE_INTEGRATION_ENABLED=True
TWO_FACTOR_AUTH_ENABLED=False

# =============================================================================
# VIDEO PROCESSING CONFIGURATION
# =============================================================================
FFMPEG_BINARY_PATH=/usr/bin/ffmpeg
FFPROBE_BINARY_PATH=/usr/bin/ffprobe
VIDEO_PROCESSING_QUEUE=video_processing
MAX_VIDEO_FILE_SIZE=2147483648
SUPPORTED_VIDEO_FORMATS=mp4,webm,mov,avi,mkv
SUPPORTED_AUDIO_FORMATS=mp3,wav,aac,ogg

# =============================================================================
# ANALYTICS CONFIGURATION
# =============================================================================
ANALYTICS_RETENTION_DAYS=365
ENABLE_REAL_TIME_ANALYTICS=True
ANALYTICS_BATCH_SIZE=1000

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_LOGIN=5/min
RATE_LIMIT_API=1000/hour
RATE_LIMIT_UPLOAD=10/hour

# =============================================================================
# WEBSOCKET CONFIGURATION
# =============================================================================
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer
WEBSOCKET_HEARTBEAT_INTERVAL=30
MAX_PARTY_PARTICIPANTS=100

# =============================================================================
# CHAT CONFIGURATION
# =============================================================================
MAX_CHAT_MESSAGE_LENGTH=1000
CHAT_HISTORY_LIMIT=1000

# =============================================================================
# NOTIFICATION CONFIGURATION
# =============================================================================
NOTIFICATIONS_ENABLED=True
EMAIL_NOTIFICATIONS_ENABLED=False

# =============================================================================
# CELERY CONFIGURATION
# =============================================================================
CELERY_TASK_ALWAYS_EAGER=True
CELERY_WORKER_CONCURRENCY=4

# =============================================================================
# API CONFIGURATION
# =============================================================================
API_VERSION=2.0
API_PAGINATION_MAX_SIZE=100

# =============================================================================
# PLACEHOLDER VALUES (Set when needed)
# =============================================================================
# Stripe Configuration (for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# AWS S3 Configuration (for file storage)
# Credentials are supplied by the MyAppRole IAM role in AWS
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=

# Social Authentication (OAuth)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
DISCORD_OAUTH_CLIENT_ID=
DISCORD_OAUTH_CLIENT_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=

# Google Services
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_SERVICE_ACCOUNT_FILE=
YOUTUBE_API_KEY=

# Firebase (Mobile Push Notifications)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=
FIREBASE_CREDENTIALS_FILE=
PUSH_NOTIFICATION_BATCH_SIZE=100
PUSH_NOTIFICATION_RETRY_ATTEMPTS=3
EOF
}

create_production_env() {
    local backend_domain="$1"
    local frontend_domain="$2"
    
    log_action "Creating production environment configuration..."
    
    cat > "$ENV_FILE" << EOF
# =============================================================================
# WATCH PARTY BACKEND ENVIRONMENT CONFIGURATION
# =============================================================================
# Generated automatically by env-setup.sh on $(date)
# Environment: Production

# =============================================================================
# CORE DJANGO SETTINGS
# =============================================================================
DEBUG=False
SECRET_KEY=$(generate_django_secret)
DJANGO_SETTINGS_MODULE=watchparty.settings.production
ALLOWED_HOSTS=$backend_domain,www.$backend_domain

# =============================================================================
# DOMAIN CONFIGURATION
# =============================================================================
BACKEND_DOMAIN=$backend_domain
FRONTEND_DOMAIN=$frontend_domain
BACKEND_URL=https://$backend_domain
FRONTEND_URL=https://$frontend_domain

# =============================================================================
# DATABASE CONFIGURATION (PostgreSQL)
# =============================================================================
DATABASE_URL=postgresql://username:password@host:5432/dbname?sslmode=require
DB_NAME=watchparty_prod
DB_USER=watchparty_user
DB_PASSWORD=$(generate_secret 32)
DB_HOST=localhost
DB_PORT=5432
DB_SSL_MODE=require

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_URL=redis://:$(generate_secret 32)@localhost:6379/0
REDIS_PASSWORD=$(generate_secret 32)
CELERY_BROKER_URL=redis://:$(generate_secret 32)@localhost:6379/2
CELERY_RESULT_BACKEND=redis://:$(generate_secret 32)@localhost:6379/3
CHANNEL_LAYERS_CONFIG_HOSTS=redis://:$(generate_secret 32)@localhost:6379/4

# =============================================================================
# JWT AUTHENTICATION
# =============================================================================
JWT_SECRET_KEY=$(generate_secret 64)
JWT_REFRESH_SECRET_KEY=$(generate_secret 64)
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your_sendgrid_api_key
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@$backend_domain

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ALLOWED_ORIGINS=https://$frontend_domain,https://www.$frontend_domain

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# =============================================================================
# MONITORING
# =============================================================================
ENVIRONMENT=production
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# =============================================================================
# FEATURE FLAGS
# =============================================================================
MAINTENANCE_MODE=False
REGISTRATION_ENABLED=True
GOOGLE_DRIVE_INTEGRATION_ENABLED=True
YOUTUBE_INTEGRATION_ENABLED=True
TWO_FACTOR_AUTH_ENABLED=True

# =============================================================================
# VIDEO PROCESSING CONFIGURATION
# =============================================================================
FFMPEG_BINARY_PATH=/usr/bin/ffmpeg
FFPROBE_BINARY_PATH=/usr/bin/ffprobe
VIDEO_PROCESSING_QUEUE=video_processing
MAX_VIDEO_FILE_SIZE=5368709120
SUPPORTED_VIDEO_FORMATS=mp4,webm,mov,avi,mkv
SUPPORTED_AUDIO_FORMATS=mp3,wav,aac,ogg

# =============================================================================
# ANALYTICS CONFIGURATION
# =============================================================================
ANALYTICS_RETENTION_DAYS=365
ENABLE_REAL_TIME_ANALYTICS=True
ANALYTICS_BATCH_SIZE=1000

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_LOGIN=3/min
RATE_LIMIT_API=100/hour
RATE_LIMIT_UPLOAD=5/hour

# =============================================================================
# WEBSOCKET CONFIGURATION
# =============================================================================
CHANNEL_LAYERS_BACKEND=channels_redis.core.RedisChannelLayer
WEBSOCKET_HEARTBEAT_INTERVAL=30
MAX_PARTY_PARTICIPANTS=100

# =============================================================================
# CHAT CONFIGURATION
# =============================================================================
MAX_CHAT_MESSAGE_LENGTH=1000
CHAT_HISTORY_LIMIT=1000

# =============================================================================
# NOTIFICATION CONFIGURATION
# =============================================================================
NOTIFICATIONS_ENABLED=True
EMAIL_NOTIFICATIONS_ENABLED=True

# =============================================================================
# CELERY CONFIGURATION
# =============================================================================
CELERY_TASK_ALWAYS_EAGER=False
CELERY_WORKER_CONCURRENCY=8

# =============================================================================
# API CONFIGURATION
# =============================================================================
API_VERSION=2.0
API_PAGINATION_MAX_SIZE=100

# =============================================================================
# PRODUCTION PASSWORDS & KEYS
# =============================================================================
GRAFANA_PASSWORD=$(generate_secret 32)
ELASTICSEARCH_PASSWORD=$(generate_secret 32)
BACKUP_ENCRYPTION_KEY=$(generate_secret 64)

# =============================================================================
# PLACEHOLDER VALUES (Configure as needed)
# =============================================================================
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AWS S3 Configuration
# Credentials are provided via the MyAppRole IAM role
AWS_STORAGE_BUCKET_NAME=watchparty-prod-media
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=$backend_domain

# Social Authentication
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
DISCORD_OAUTH_CLIENT_ID=your_discord_oauth_client_id
DISCORD_OAUTH_CLIENT_SECRET=your_discord_oauth_client_secret
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret

# Google Services
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
YOUTUBE_API_KEY=your_youtube_api_key

# Firebase
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40your_project.iam.gserviceaccount.com
FIREBASE_CREDENTIALS_FILE=/path/to/firebase-credentials.json
PUSH_NOTIFICATION_BATCH_SIZE=100
PUSH_NOTIFICATION_RETRY_ATTEMPTS=3
EOF
}

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================

validate_env_file() {
    local env_file="$1"
    local errors=0
    
    log_action "Validating environment configuration..."
    
    # Check if file exists
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    # Source the file to check for syntax errors
    if ! source "$env_file" >/dev/null 2>&1; then
        log_error "Syntax error in environment file"
        ((errors++))
    fi
    
    # Check required variables
    local required_vars=(
        "SECRET_KEY"
        "DJANGO_SETTINGS_MODULE"
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET_KEY"
        "BACKEND_DOMAIN"
        "FRONTEND_DOMAIN"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            log_error "Missing required variable: $var"
            ((errors++))
        elif grep -q "^${var}=$" "$env_file" || grep -q "^${var}=your_" "$env_file" || grep -q "^${var}=placeholder" "$env_file"; then
            log_warning "Variable $var has placeholder value"
        fi
    done
    
    # Check domain configuration
    if grep -q "^BACKEND_DOMAIN=" "$env_file"; then
        local backend_domain=$(grep "^BACKEND_DOMAIN=" "$env_file" | cut -d'=' -f2)
        if ! validate_url "$backend_domain"; then
            log_error "Invalid backend domain format: $backend_domain"
            ((errors++))
        fi
    fi
    
    if grep -q "^FRONTEND_DOMAIN=" "$env_file"; then
        local frontend_domain=$(grep "^FRONTEND_DOMAIN=" "$env_file" | cut -d'=' -f2)
        if ! validate_url "$frontend_domain"; then
            log_error "Invalid frontend domain format: $frontend_domain"
            ((errors++))
        fi
    fi
    
    # Check for weak secret keys
    if grep -q "SECRET_KEY=your-super-secret-key" "$env_file"; then
        log_error "Default SECRET_KEY detected - this is insecure!"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "Environment configuration is valid"
        return 0
    else
        log_error "Found $errors validation errors"
        return 1
    fi
}

# =============================================================================
# INTERACTIVE CONFIGURATION
# =============================================================================

interactive_setup() {
    local environment="$1"
    
    show_banner
    echo -e "${WHITE}Interactive Environment Setup${NC}"
    echo -e "${CYAN}This wizard will help you configure your .env file${NC}"
    echo
    
    # Basic configuration
    log_title "📡 Domain Configuration"
    local backend_domain="$DEFAULT_BACKEND_DOMAIN"
    local frontend_domain="$DEFAULT_FRONTEND_DOMAIN"
    
    prompt_with_default "Backend domain" "$DEFAULT_BACKEND_DOMAIN" "backend_domain"
    prompt_with_default "Frontend domain" "$DEFAULT_FRONTEND_DOMAIN" "frontend_domain"
    
    echo
    
    # Database configuration
    log_title "🗄️  Database Configuration"
    if [[ "$environment" == "production" ]]; then
        local db_host db_port db_name db_user db_password
        prompt_with_default "Database host" "localhost" "db_host"
        prompt_with_default "Database port" "5432" "db_port"
        prompt_with_default "Database name" "watchparty_prod" "db_name"
        prompt_with_default "Database user" "watchparty_user" "db_user"
        prompt_with_default "Database password" "$(generate_secret 32)" "db_password" "true"
    else
        log_info "Using default PostgreSQL configuration for development"
    fi
    
    echo
    
    # Email configuration
    log_title "📧 Email Configuration"
    if [[ "$environment" == "production" ]]; then
        local email_host email_user email_password
        prompt_with_default "Email host (SMTP)" "smtp.sendgrid.net" "email_host"
        prompt_with_default "Email username" "apikey" "email_user"
        prompt_with_default "Email password/API key" "" "email_password" "true"
    else
        log_info "Using console email backend for development"
    fi
    
    echo
    
    # Optional services
    log_title "🔧 Optional Services"
    echo -e "${CYAN}Configure optional services? (y/n)${NC}"
    read -n 1 -r configure_optional
    echo
    
    if [[ $configure_optional =~ ^[Yy]$ ]]; then
        # Stripe configuration
        log_info "💳 Stripe Payment Configuration"
        local stripe_pk stripe_sk stripe_webhook
        prompt_with_default "Stripe Publishable Key" "" "stripe_pk"
        prompt_with_default "Stripe Secret Key" "" "stripe_sk" "true"
        prompt_with_default "Stripe Webhook Secret" "" "stripe_webhook" "true"
        
        # AWS S3 configuration
        log_info "☁️  AWS S3 Configuration"
        local aws_key aws_secret aws_bucket aws_region
        prompt_with_default "AWS Access Key ID" "" "aws_key"
        prompt_with_default "AWS Secret Access Key" "" "aws_secret" "true"
        prompt_with_default "S3 Bucket Name" "watchparty-${environment}-media" "aws_bucket"
        prompt_with_default "AWS Region" "us-east-1" "aws_region"
    fi
    
    echo
    log_action "Generating environment configuration..."
    
    # Create the environment file
    if [[ "$environment" == "production" ]]; then
        create_production_env "$backend_domain" "$frontend_domain"
    else
        create_development_env "$backend_domain" "$frontend_domain"
    fi
    
    # Apply custom configurations if provided
    if [[ $configure_optional =~ ^[Yy]$ ]]; then
        if [[ -n "$stripe_pk" ]]; then
            sed -i "s/STRIPE_PUBLISHABLE_KEY=.*/STRIPE_PUBLISHABLE_KEY=$stripe_pk/" "$ENV_FILE"
        fi
        if [[ -n "$stripe_sk" ]]; then
            sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$stripe_sk/" "$ENV_FILE"
        fi
        if [[ -n "$aws_bucket" ]]; then
            sed -i "s/AWS_STORAGE_BUCKET_NAME=.*/AWS_STORAGE_BUCKET_NAME=$aws_bucket/" "$ENV_FILE"
        fi
        # Add more custom configurations as needed
    fi
    
    log_success "Environment file created: $ENV_FILE"
    
    # Validate the created file
    if validate_env_file "$ENV_FILE"; then
        log_success "Environment configuration is valid!"
    else
        log_warning "Environment configuration has some issues. Please review."
    fi
    
    # Show next steps
    echo
    log_title "🚀 Next Steps"
    echo "1. Review the generated .env file: $ENV_FILE"
    echo "2. Update any placeholder values as needed"
    echo "3. Run: ./manage.sh check to validate your setup"
    echo "4. Run: ./manage.sh dev to start development server"
    echo
}

# =============================================================================
# QUICK SETUP FUNCTIONS
# =============================================================================

quick_development_setup() {
    log_action "Setting up development environment with default configuration..."
    
    create_development_env "$DEFAULT_BACKEND_DOMAIN" "$DEFAULT_FRONTEND_DOMAIN"
    
    log_success "Development environment created with defaults"
    log_info "Backend: https://$DEFAULT_BACKEND_DOMAIN"
    log_info "Frontend: https://$DEFAULT_FRONTEND_DOMAIN"
    
    validate_env_file "$ENV_FILE"
}

quick_production_setup() {
    log_action "Setting up production environment with default configuration..."
    
    create_production_env "$DEFAULT_BACKEND_DOMAIN" "$DEFAULT_FRONTEND_DOMAIN"
    
    log_success "Production environment created with secure defaults"
    log_warning "Please update placeholder values before deploying!"
    log_info "Backend: https://$DEFAULT_BACKEND_DOMAIN"
    log_info "Frontend: https://$DEFAULT_FRONTEND_DOMAIN"
    
    validate_env_file "$ENV_FILE"
}

# =============================================================================
# ENV FILE MANAGEMENT
# =============================================================================

update_env_var() {
    local var_name="$1"
    local var_value="$2"
    local env_file="${3:-$ENV_FILE}"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    if grep -q "^${var_name}=" "$env_file"; then
        # Update existing variable
        sed -i "s/^${var_name}=.*/${var_name}=${var_value}/" "$env_file"
        log_success "Updated $var_name"
    else
        # Add new variable
        echo "${var_name}=${var_value}" >> "$env_file"
        log_success "Added $var_name"
    fi
}

show_env_status() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        echo "Run: ./manage.sh setup-env to create one"
        return 1
    fi
    
    log_title "📊 Environment Status"
    echo "File: $ENV_FILE"
    echo "Size: $(stat -c%s "$ENV_FILE") bytes"
    echo "Modified: $(stat -c%y "$ENV_FILE")"
    echo
    
    # Show environment type
    if grep -q "ENVIRONMENT=development" "$ENV_FILE"; then
        echo -e "Type: ${YELLOW}Development${NC}"
    elif grep -q "ENVIRONMENT=production" "$ENV_FILE"; then
        echo -e "Type: ${RED}Production${NC}"
    else
        echo -e "Type: ${GRAY}Unknown${NC}"
    fi
    
    # Show domains
    if grep -q "^BACKEND_DOMAIN=" "$ENV_FILE"; then
        local backend_domain=$(grep "^BACKEND_DOMAIN=" "$ENV_FILE" | cut -d'=' -f2)
        echo -e "Backend: ${CYAN}https://$backend_domain${NC}"
    fi
    
    if grep -q "^FRONTEND_DOMAIN=" "$ENV_FILE"; then
        local frontend_domain=$(grep "^FRONTEND_DOMAIN=" "$ENV_FILE" | cut -d'=' -f2)
        echo -e "Frontend: ${CYAN}https://$frontend_domain${NC}"
    fi
    
    echo
    
    # Run validation
    validate_env_file "$ENV_FILE"
}

backup_env_file() {
    if [[ -f "$ENV_FILE" ]]; then
        local backup_file="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$ENV_FILE" "$backup_file"
        log_success "Environment file backed up to: $backup_file"
    else
        log_warning "No environment file to backup"
    fi
}

# =============================================================================
# MAIN COMMAND HANDLER
# =============================================================================

show_help() {
    show_banner
    echo -e "${WHITE}USAGE:${NC}"
    echo "  ./scripts/env-setup.sh [COMMAND] [OPTIONS]"
    echo
    echo -e "${WHITE}COMMANDS:${NC}"
    echo -e "  ${GREEN}quick-dev${NC}              Quick development setup with defaults"
    echo -e "  ${GREEN}quick-prod${NC}             Quick production setup with defaults"
    echo -e "  ${GREEN}interactive${NC}            Interactive setup wizard"
    echo -e "  ${GREEN}interactive-dev${NC}        Interactive development setup"
    echo -e "  ${GREEN}interactive-prod${NC}       Interactive production setup"
    echo -e "  ${BLUE}validate${NC}               Validate existing .env file"
    echo -e "  ${BLUE}status${NC}                 Show environment status"
    echo -e "  ${BLUE}backup${NC}                 Backup current .env file"
    echo -e "  ${YELLOW}update VAR VALUE${NC}      Update specific environment variable"
    echo -e "  ${RED}reset${NC}                  Reset/recreate .env file"
    echo
    echo -e "${WHITE}EXAMPLES:${NC}"
    echo "  ./scripts/env-setup.sh quick-dev"
    echo "  ./scripts/env-setup.sh interactive-prod"
    echo "  ./scripts/env-setup.sh update BACKEND_DOMAIN my-backend.com"
    echo "  ./scripts/env-setup.sh validate"
    echo
}

main() {
    local command="${1:-interactive-dev}"
    
    case "$command" in
        "quick-dev")
            backup_env_file
            quick_development_setup
            ;;
        "quick-prod")
            backup_env_file
            quick_production_setup
            ;;
        "interactive")
            backup_env_file
            interactive_setup "development"
            ;;
        "interactive-dev")
            backup_env_file
            interactive_setup "development"
            ;;
        "interactive-prod")
            backup_env_file
            interactive_setup "production"
            ;;
        "validate")
            validate_env_file "$ENV_FILE"
            ;;
        "status")
            show_env_status
            ;;
        "backup")
            backup_env_file
            ;;
        "update")
            if [[ $# -lt 3 ]]; then
                log_error "Usage: update VAR_NAME VAR_VALUE"
                exit 1
            fi
            update_env_var "$2" "$3"
            ;;
        "reset")
            log_warning "This will recreate your .env file!"
            echo -ne "${YELLOW}Are you sure? (y/N): ${NC}"
            read -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                backup_env_file
                interactive_setup "development"
            else
                log_info "Operation cancelled"
            fi
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
