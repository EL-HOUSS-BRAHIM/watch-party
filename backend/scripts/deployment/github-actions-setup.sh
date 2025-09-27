#!/bin/bash

# =============================================================================
# GITHUB ACTIONS SECRETS SETUP SCRIPT
# =============================================================================
# This script helps you set up the required GitHub Actions secrets for deployment
# Author: Watch Party Team
# Version: 1.0

set -e

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly ROCKET="🚀"

log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }
log_title() { echo -e "${WHITE}$1${NC}"; }

print_header() {
    echo
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🔐 GitHub Actions Secrets Setup                            ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

show_help() {
    echo -e "${WHITE}USAGE:${NC}"
    echo -e "  $0 [OPTIONS]"
    echo
    echo -e "${WHITE}OPTIONS:${NC}"
    echo -e "  ${GREEN}--generate${NC}       Generate secrets template"
    echo -e "  ${GREEN}--validate${NC}       Validate existing .env file"
    echo -e "  ${GREEN}--help${NC}           Show this help"
    echo
}

generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

generate_django_secret() {
    python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || \
    openssl rand -base64 50 | tr -d "=+/"
}

validate_env_file() {
    local env_file="${1:-.env}"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    log_info "Validating $env_file..."
    
    # Required secrets for deployment
    local required_vars=(
        "SECRET_KEY"
        "DEPLOY_HOST"
        "DEPLOY_USER"
        "SSH_PRIVATE_KEY"
        "DATABASE_URL"
        "DATABASE_NAME"
        "DATABASE_USER"
        "DATABASE_PASSWORD"
        "DATABASE_HOST"
        "REDIS_URL"
        "REDIS_HOST"
        "REDIS_PASSWORD"
        "CELERY_BROKER_URL"
        "CELERY_RESULT_BACKEND"
        "CHANNEL_LAYERS_CONFIG_HOSTS"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "All required variables are present in $env_file"
        return 0
    else
        log_error "Missing required variables: ${missing_vars[*]}"
        return 1
    fi
}

generate_secrets_template() {
    local template_file="github-secrets-template.txt"
    
    log_info "Generating GitHub Actions secrets template..."
    
    cat > "$template_file" << 'EOF'
# =============================================================================
# GITHUB ACTIONS SECRETS TEMPLATE
# =============================================================================
# Copy these values to your GitHub repository secrets
# Go to: Settings > Secrets and variables > Actions > New repository secret

# =============================================================================
# SERVER CONNECTION (REQUIRED)
# =============================================================================
DEPLOY_HOST=your-server-ip-or-domain.com
DEPLOY_USER=ubuntu
DEPLOY_PORT=22
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
(paste your SSH private key here)
-----END OPENSSH PRIVATE KEY-----

# =============================================================================
# DJANGO SETTINGS (REQUIRED)
# =============================================================================
EOF

    # Generate a Django secret key
    local django_secret=$(generate_django_secret)
    echo "SECRET_KEY=$django_secret" >> "$template_file"
    
    cat >> "$template_file" << 'EOF'
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-server-ip
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# =============================================================================
# DATABASE (REQUIRED)
# =============================================================================
DATABASE_URL=postgresql://username:password@host:5432/database_name
DATABASE_HOST=your-db-host
DATABASE_NAME=watchparty_prod
DATABASE_USER=watchparty_admin
EOF

    local db_password=$(generate_secret 24)
    echo "DATABASE_PASSWORD=$db_password" >> "$template_file"
    
    cat >> "$template_file" << 'EOF'
DATABASE_PORT=5432

# =============================================================================
# REDIS (OPTIONAL - defaults to localhost if not provided)
# =============================================================================
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379

# =============================================================================
# EMAIL CONFIGURATION (OPTIONAL)
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# =============================================================================
# SOCIAL AUTHENTICATION (OPTIONAL)
# =============================================================================
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GITHUB_OAUTH_CLIENT_ID=your-github-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-client-secret

# =============================================================================
# AWS SETTINGS (OPTIONAL - for S3 storage)
# =============================================================================
# Credentials come from the MyAppRole IAM role attached to the runner
AWS_STORAGE_BUCKET_NAME=your-s3-bucket
AWS_S3_REGION_NAME=us-east-1

# =============================================================================
# ADDITIONAL SETTINGS (OPTIONAL)
# =============================================================================
# These are handled automatically by the deployment script if not provided
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True
EOF

    log_success "Generated secrets template: $template_file"
    echo
    log_info "Next steps:"
    echo -e "  1. Edit $template_file with your actual values"
    echo -e "  2. Go to your GitHub repository > Settings > Secrets and variables > Actions"
    echo -e "  3. Add each secret with the name and value from the template"
    echo -e "  4. Run the deployment workflow"
    echo
}

check_github_cli() {
    if command -v gh &> /dev/null; then
        return 0
    else
        log_warning "GitHub CLI (gh) not found. Install it to automatically set secrets."
        log_info "Visit: https://cli.github.com/"
        return 1
    fi
}

set_secrets_with_gh() {
    local env_file="${1:-.env}"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    if ! check_github_cli; then
        return 1
    fi
    
    log_info "Setting GitHub secrets using GitHub CLI..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        return 1
    fi
    
    # Check if authenticated with GitHub
    if ! gh auth status &> /dev/null; then
        log_error "Not authenticated with GitHub CLI. Run: gh auth login"
        return 1
    fi
    
    # Read secrets from env file and set them
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes from value
        value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
        
        if [[ -n $value ]]; then
            echo "Setting secret: $key"
            echo "$value" | gh secret set "$key"
        fi
    done < <(grep -v '^#' "$env_file" | grep -v '^$')
    
    log_success "Secrets set successfully!"
}

main() {
    print_header
    
    case "${1:-}" in
        --generate)
            generate_secrets_template
            ;;
        --validate)
            validate_env_file "${2:-.env}"
            ;;
        --set-from-env)
            set_secrets_with_gh "${2:-.env}"
            ;;
        --help|-h)
            show_help
            ;;
        *)
            log_info "GitHub Actions secrets setup helper"
            echo
            echo -e "${WHITE}Available commands:${NC}"
            echo -e "  ${GREEN}$0 --generate${NC}           Generate secrets template"
            echo -e "  ${GREEN}$0 --validate [file]${NC}    Validate environment file"
            echo -e "  ${GREEN}$0 --set-from-env [file]${NC} Set secrets from env file (requires GitHub CLI)"
            echo -e "  ${GREEN}$0 --help${NC}               Show detailed help"
            echo
            
            # Check for existing files
            if [[ -f ".env" ]]; then
                log_info "Found .env file. Validating..."
                validate_env_file ".env"
            elif [[ -f ".env.production" ]]; then
                log_info "Found .env.production file. Validating..."
                validate_env_file ".env.production"
            else
                log_warning "No environment file found. Use --generate to create a template."
            fi
            ;;
    esac
}

main "$@"
