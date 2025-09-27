#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - ENVIRONMENT VALIDATOR & FIXER
# =============================================================================
# Validates and fixes environment configuration issues
# Author: Watch Party Team
# Version: 1.0
# Last Updated: August 12, 2025 (added unified .env support & secrets fetch)

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors and emojis
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YIGHLIGHT='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly FIX="🔧"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YIGHLIGHT}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }
log_fix() { echo -e "${YELLOW}${FIX} $1${NC}"; }

# Environment files
DEV_ENV="$PROJECT_ROOT/.env"
PROD_ENV="$PROJECT_ROOT/.env.production"
UNIFIED_ENV="$PROJECT_ROOT/.env"  # unified file preference
LOCAL_ENV="$PROJECT_ROOT/.env.local"
EXAMPLE_ENV="$PROJECT_ROOT/.env.example"

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================

detect_environment() {
    # If unified .env exists and explicitly sets production, treat as production
    if [[ -f "$UNIFIED_ENV" ]] && grep -Eq '^DJANGO_SETTINGS_MODULE=.*production' "$UNIFIED_ENV"; then
        echo "production"
        return
    fi
    if [[ -f "$PROD_ENV" ]] && grep -Eq '^DJANGO_SETTINGS_MODULE=.*production' "$PROD_ENV"; then
        echo "production"
    elif [[ -f "$LOCAL_ENV" ]]; then
        echo "local"
    elif [[ -f "$DEV_ENV" ]]; then
        echo "development"
    else
        echo "none"
    fi
}

get_env_file() {
    local env_type="${1:-$(detect_environment)}"
    case "$env_type" in
        production)
            # Prefer unified .env if it contains production settings; otherwise fallback
            if [[ -f "$UNIFIED_ENV" ]] && grep -Eq '^DJANGO_SETTINGS_MODULE=.*production' "$UNIFIED_ENV"; then
                echo "$UNIFIED_ENV"
            elif [[ -f "$PROD_ENV" ]]; then
                echo "$PROD_ENV"
            else
                echo "$UNIFIED_ENV"
            fi
            ;;
        local)
            echo "$LOCAL_ENV" ;;
        development|dev)
            echo "$DEV_ENV" ;;
        *)
            echo "$DEV_ENV" ;;
    esac
}

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

validate_required_vars() {
    local env_file="$1"
    local env_type="$2"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    log_info "Validating required environment variables for $env_type..."
    
    # Load environment file
    set -a
    source "$env_file"
    set +a
    
    local missing_vars=()
    local weak_vars=()
    local issues=0
    
    # Define required variables based on environment
    local required_vars
    if [[ "$env_type" == "production" ]]; then
        required_vars=(
            "SECRET_KEY"
            "DATABASE_URL"
            "REDIS_URL"
            "ALLOWED_HOSTS"
            "DJANGO_SETTINGS_MODULE"
            "EMAIL_HOST"
            "EMAIL_HOST_USER"
            "EMAIL_HOST_PASSWORD"
        )
    else
        required_vars=(
            "SECRET_KEY"
            "DATABASE_URL"
            "REDIS_URL"
            "DJANGO_SETTINGS_MODULE"
        )
    fi
    
    # Check required variables
    for var in "${required_vars[@]}"; do
        local value="${!var:-}"
        
        if [[ -z "$value" ]]; then
            missing_vars+=("$var")
            ((issues++))
        elif [[ "$var" == "SECRET_KEY" ]] && { [[ "$value" == *"your-secret-key"* ]] || [[ "${#value}" -lt 32 ]]; }; then
            weak_vars+=("$var (insecure or default value)")
            ((issues++))
        elif [[ "$var" == "DATABASE_URL" ]] && [[ "$value" == "sqlite"* ]] && [[ "$env_type" == "production" ]]; then
            weak_vars+=("$var (SQLite not recommended for production)")
            ((issues++))
        fi
    done
    
    # Check optional but important variables
    local optional_vars=(
        "SENTRY_DSN"
        "GOOGLE_OAUTH_CLIENT_ID"
        "YOUTUBE_API_KEY"
    )
    
    local missing_optional=()
    for var in "${optional_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_optional+=("$var")
        fi
    done
    
    # Report results
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
    fi
    
    if [[ ${#weak_vars[@]} -gt 0 ]]; then
        log_warning "Variables with issues:"
        for var in "${weak_vars[@]}"; do
            echo "  - $var"
        done
    fi
    
    if [[ ${#missing_optional[@]} -gt 0 ]]; then
        log_info "Missing optional variables (may limit functionality):"
        for var in "${missing_optional[@]}"; do
            echo "  - $var"
        done
    fi
    
    if [[ $issues -eq 0 ]]; then
        log_success "All required environment variables are properly configured"
        return 0
    else
        log_error "Found $issues configuration issues"
        return 1
    fi
}

validate_env_syntax() {
    local env_file="$1"
    
    log_info "Validating environment file syntax..."
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    local line_num=0
    local issues=0
    
    while IFS= read -r line; do
        ((line_num++))
        
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Check for valid variable assignment
        if ! [[ "$line" =~ ^[A-Z_][A-Z0-9_]*= ]]; then
            log_warning "Line $line_num: Invalid variable format: $line"
            ((issues++))
        fi
        
        # Check for unquoted values with spaces
        if [[ "$line" =~ =.*[[:space:]].*$ ]] && ! [[ "$line" =~ =\".*\"|=\'.*\' ]]; then
            log_warning "Line $line_num: Unquoted value with spaces: $line"
            ((issues++))
        fi
        
        # Check for potential secrets in plain text
        if [[ "$line" =~ (PASSWORD|SECRET|KEY|TOKEN)= ]] && [[ "$line" =~ =.*[[:space:]] ]]; then
            log_warning "Line $line_num: Potential exposed secret (contains spaces)"
            ((issues++))
        fi
        
    done < "$env_file"
    
    if [[ $issues -eq 0 ]]; then
        log_success "Environment file syntax is valid"
        return 0
    else
        log_warning "Found $issues syntax issues in environment file"
        return 1
    fi
}

check_env_security() {
    local env_file="$1"
    
    log_info "Checking environment file security..."
    
    local issues=0
    
    # Check file permissions
    local file_perms
    file_perms=$(stat -c "%a" "$env_file" 2>/dev/null || echo "000")
    
    if [[ "$file_perms" != "600" ]]; then
        log_warning "Environment file has insecure permissions: $file_perms (should be 600)"
        ((issues++))
    fi
    
    # Check if file is in git
    if git check-ignore "$env_file" >/dev/null 2>&1; then
        log_success "Environment file is properly ignored by git"
    else
        if git ls-files --error-unmatch "$env_file" >/dev/null 2>&1; then
            log_error "Environment file is tracked by git (security risk!)"
            ((issues++))
        fi
    fi
    
    # Check for common weak patterns
    if grep -q "password.*123\|secret.*test\|key.*abc" "$env_file" 2>/dev/null; then
        log_warning "Found potentially weak credentials"
        ((issues++))
    fi
    
    if [[ $issues -eq 0 ]]; then
        log_success "Environment file security check passed"
        return 0
    else
        log_warning "Found $issues security issues"
        return 1
    fi
}

# =============================================================================
# AUTO-FIX FUNCTIONS
# =============================================================================

generate_secure_secret() {
    python3 -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
print(''.join(secrets.choice(alphabet) for _ in range(50)))
"
}

fix_env_permissions() {
    local env_file="$1"
    
    log_fix "Fixing environment file permissions..."
    chmod 600 "$env_file"
    log_success "Environment file permissions set to 600"
}

fix_weak_secret_key() {
    local env_file="$1"
    
    log_fix "Generating secure SECRET_KEY..."
    
    local new_secret
    new_secret=$(generate_secure_secret)
    
    # Backup original file
    cp "$env_file" "$env_file.backup.$(date +%s)"
    
    # Replace SECRET_KEY
    if grep -q "^SECRET_KEY=" "$env_file"; then
        sed -i "s/^SECRET_KEY=.*/SECRET_KEY=$new_secret/" "$env_file"
    else
        echo "SECRET_KEY=$new_secret" >> "$env_file"
    fi
    
    log_success "Generated new secure SECRET_KEY"
}

fix_missing_vars() {
    local env_file="$1"
    local env_type="$2"
    
    log_fix "Adding missing environment variables..."
    
    # Backup original file
    cp "$env_file" "$env_file.backup.$(date +%s)"
    
    # Add missing variables with default values
    cat >> "$env_file" << EOF

# Auto-generated missing variables ($(date))
# Please update these values with your actual configuration

EOF
    
    # Check and add missing variables
    source "$env_file" 2>/dev/null || true
    
    [[ -z "${DATABASE_URL:-}" ]] && echo "DATABASE_URL=sqlite:///db.sqlite3" >> "$env_file"
    [[ -z "${REDIS_URL:-}" ]] && echo "REDIS_URL=redis://localhost:6379/0" >> "$env_file"
    [[ -z "${ALLOWED_HOSTS:-}" ]] && echo "ALLOWED_HOSTS=localhost,127.0.0.1" >> "$env_file"
    [[ -z "${DJANGO_SETTINGS_MODULE:-}" ]] && echo "DJANGO_SETTINGS_MODULE=watchparty.settings.${env_type}" >> "$env_file"
    
    if [[ "$env_type" == "production" ]]; then
        [[ -z "${EMAIL_HOST:-}" ]] && echo "EMAIL_HOST=smtp.gmail.com" >> "$env_file"
        [[ -z "${EMAIL_PORT:-}" ]] && echo "EMAIL_PORT=587" >> "$env_file"
        [[ -z "${EMAIL_USE_TLS:-}" ]] && echo "EMAIL_USE_TLS=True" >> "$env_file"
        [[ -z "${EMAIL_HOST_USER:-}" ]] && echo "EMAIL_HOST_USER=your-email@gmail.com" >> "$env_file"
        [[ -z "${EMAIL_HOST_PASSWORD:-}" ]] && echo "EMAIL_HOST_PASSWORD=your-app-password" >> "$env_file"
    fi
    
    log_success "Added missing environment variables with default values"
    log_warning "Please review and update the new variables with your actual values"
}

create_env_from_example() {
    local env_file="$1"
    local env_type="$2"
    
    log_fix "Creating environment file from example..."
    
    if [[ -f "$EXAMPLE_ENV" ]]; then
        cp "$EXAMPLE_ENV" "$env_file"
        log_success "Created $env_file from example"
    else
        create_default_env "$env_file" "$env_type"
    fi
    
    # Set appropriate permissions
    chmod 600 "$env_file"
}

create_default_env() {
    local env_file="$1"
    local env_type="$2"
    
    log_fix "Creating default environment file..."
    
    local secret_key
    secret_key=$(generate_secure_secret)
    
    cat > "$env_file" << EOF
# =============================================================================
# WATCH PARTY BACKEND - ${env_type^^} ENVIRONMENT CONFIGURATION
# =============================================================================
# Generated on: $(date)
# Environment: $env_type

# Django Settings
DEBUG=$([ "$env_type" == "production" ] && echo "False" || echo "True")
SECRET_KEY=$secret_key
DJANGO_SETTINGS_MODULE=watchparty.settings.$env_type

# Database Configuration
DATABASE_URL=$([ "$env_type" == "production" ] && echo "postgresql://user:password@localhost:5432/watchparty" || echo "sqlite:///db.sqlite3")

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Security Settings
ALLOWED_HOSTS=$([ "$env_type" == "production" ] && echo "yourdomain.com,www.yourdomain.com" || echo "localhost,127.0.0.1")
$([ "$env_type" == "production" ] && cat << EOL
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
EOL
)

# Email Configuration
EMAIL_BACKEND=$([ "$env_type" == "production" ] && echo "django.core.mail.backends.smtp.EmailBackend" || echo "django.core.mail.backends.console.EmailBackend")
$([ "$env_type" == "production" ] && cat << EOL
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EOL
)

# Static and Media Files
STATIC_URL=/static/
MEDIA_URL=/media/

# Optional: Third-party Services
# SENTRY_DSN=
# GOOGLE_OAUTH_CLIENT_ID=
# GOOGLE_OAUTH_CLIENT_SECRET=
# YOUTUBE_API_KEY=
EOF
    
    chmod 600 "$env_file"
    log_success "Created default environment file: $env_file"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

validate_environment() {
    local env_type="${1:-$(detect_environment)}"
    local env_file
    env_file=$(get_env_file "$env_type")
    
    log_info "Validating $env_type environment..."
    
    local total_issues=0
    
    # Check if environment file exists
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    # Run all validations
    validate_env_syntax "$env_file" || ((total_issues++))
    check_env_security "$env_file" || ((total_issues++))
    validate_required_vars "$env_file" "$env_type" || ((total_issues++))
    
    if [[ $total_issues -eq 0 ]]; then
        log_success "Environment validation passed"
        return 0
    else
        log_warning "Environment validation found $total_issues issue(s)"
        return 1
    fi
}

fix_environment() {
    local env_type="${1:-$(detect_environment)}"
    local env_file
    env_file=$(get_env_file "$env_type")
    
    log_info "Fixing $env_type environment issues..."
    
    # Create environment file if it doesn't exist
    if [[ ! -f "$env_file" ]]; then
        if [[ "${FORCE:-false}" == "true" ]]; then
            create_default_env "$env_file" "$env_type"
        else
            echo -n "Environment file not found. Create it? (y/N): "
            read -r create_env
            if [[ "$create_env" == "y" || "$create_env" == "Y" ]]; then
                create_default_env "$env_file" "$env_type"
            else
                log_info "Environment creation skipped"
                return 0
            fi
        fi
    fi
    
    # Fix permissions
    fix_env_permissions "$env_file"
    
    # Check and fix weak SECRET_KEY
    source "$env_file" 2>/dev/null || true
    if [[ -z "${SECRET_KEY:-}" ]] || [[ "$SECRET_KEY" == *"your-secret-key"* ]] || [[ "${#SECRET_KEY}" -lt 32 ]]; then
        fix_weak_secret_key "$env_file"
    fi
    
    # Fix missing variables
    if ! validate_required_vars "$env_file" "$env_type" >/dev/null 2>&1; then
        fix_missing_vars "$env_file" "$env_type"
    fi
    
    log_success "Environment fixes completed"
}

interactive_env_setup() {
    local env_type="${1:-development}"
    local env_file
    env_file=$(get_env_file "$env_type")
    
    log_info "Interactive environment setup for $env_type..."
    
    echo "This will help you configure your environment variables."
    echo "Current environment file: $env_file"
    echo
    
    # Check if file exists
    if [[ -f "$env_file" ]]; then
        echo -n "Environment file already exists. Overwrite? (y/N): "
        read -r overwrite
        if [[ "$overwrite" != "y" && "$overwrite" != "Y" ]]; then
            log_info "Environment setup cancelled"
            return 0
        fi
    fi
    
    # Collect configuration
    echo "Please provide the following configuration:"
    
    echo -n "Database URL (press Enter for SQLite): "
    read -r db_url
    db_url=${db_url:-"sqlite:///db.sqlite3"}
    
    echo -n "Redis URL (press Enter for default): "
    read -r redis_url
    redis_url=${redis_url:-"redis://localhost:6379/0"}
    
    if [[ "$env_type" == "production" ]]; then
        echo -n "Allowed hosts (comma-separated): "
        read -r allowed_hosts
        allowed_hosts=${allowed_hosts:-"localhost,127.0.0.1"}
        
        echo -n "Email host: "
        read -r email_host
        email_host=${email_host:-"smtp.gmail.com"}
        
        echo -n "Email user: "
        read -r email_user
        
        echo -n "Email password: "
        read -rs email_password
        echo
    fi
    
    # Generate environment file
    local secret_key
    secret_key=$(generate_secure_secret)
    
    cat > "$env_file" << EOF
# Generated by interactive setup on $(date)
DEBUG=$([ "$env_type" == "production" ] && echo "False" || echo "True")
SECRET_KEY=$secret_key
DJANGO_SETTINGS_MODULE=watchparty.settings.$env_type
DATABASE_URL=$db_url
REDIS_URL=$redis_url
CELERY_BROKER_URL=$redis_url
CELERY_RESULT_BACKEND=$redis_url
EOF
    
    if [[ "$env_type" == "production" ]]; then
        cat >> "$env_file" << EOF
ALLOWED_HOSTS=$allowed_hosts
EMAIL_HOST=$email_host
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$email_user
EMAIL_HOST_PASSWORD=$email_password
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
EOF
    else
        cat >> "$env_file" << EOF
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EOF
    fi
    
    # Set permissions
    chmod 600 "$env_file"
    
    log_success "Environment file created successfully"
}

show_env_status() {
    local env_type="${1:-$(detect_environment)}"
    local env_file
    env_file=$(get_env_file "$env_type")
    
    echo -e "${BLUE}Environment Status Report${NC}"
    echo "=========================="
    echo
    echo "Environment Type: $env_type"
    echo "Environment File: $env_file"
    echo "File Exists: $([ -f "$env_file" ] && echo "Yes" || echo "No")"
    
    if [[ -f "$env_file" ]]; then
        echo "File Size: $(du -h "$env_file" | cut -f1)"
        echo "Permissions: $(stat -c "%a" "$env_file")"
        echo "Last Modified: $(stat -c "%y" "$env_file")"
        echo
        
        # Variable count
        local var_count
        var_count=$(grep -c "^[A-Z_].*=" "$env_file" 2>/dev/null || echo "0")
        echo "Variables Defined: $var_count"
        
        # Quick validation
        echo
        if validate_environment "$env_type" >/dev/null 2>&1; then
            echo -e "Validation Status: ${GREEN}PASSED${NC}"
        else
            echo -e "Validation Status: ${RED}FAILED${NC}"
        fi
    fi
}

# ========================= AWS SECRETS INTEGRATION ==========================

aws_cli_available() { command -v aws >/dev/null 2>&1; }

update_env_file_kv() {
    local env_file="$1"; local key="$2"; local val="$3"
    grep -q "^${key}=" "$env_file" 2>/dev/null && \
        sed -i "s|^${key}=.*|${key}=${val}|" "$env_file" || \
        echo "${key}=${val}" >> "$env_file"
}

fetch_secrets_manager() {
    local secret_id="$1"; local env_file="$2"
    log_info "Fetching AWS Secrets Manager secret: $secret_id"
    if ! aws_cli_available; then
        log_error "aws CLI not installed"
        return 1
    fi
    local secret_json
    if ! secret_json=$(aws secretsmanager get-secret-value --secret-id "$secret_id" --query SecretString --output text 2>/dev/null); then
        log_error "Failed to retrieve secret $secret_id"
        return 1
    fi
    # Parse JSON and update env file (ignore nested objects)
    local tmp_keys
    tmp_keys=$(python3 - <<PY
import json, os
raw = os.environ.get('SECRET_JSON','{}')
try:
    data = json.loads(raw)
except Exception:
    exit(1)
for k,v in data.items():
    if isinstance(v,(str,int,float)):
        print(f"{k}={v}")
PY
    SECRET_JSON="$secret_json" python3 -c "import json,os;d=json.loads(os.environ['SECRET_JSON']);[print(f'{k}={v}') for k,v in d.items() if isinstance(v,(str,int,float))]")
    # Fallback if tmp_keys empty
    if [[ -z "$tmp_keys" ]]; then
        log_warning "No simple key/value pairs found in secret JSON"
        return 0
    fi
    while IFS='=' read -r k v; do
        [[ -z "$k" ]] && continue
        update_env_file_kv "$env_file" "$k" "$v"
        echo "  • Updated $k"
    done <<< "$tmp_keys"
    log_success "Secrets applied to $(basename "$env_file")"
}

fetch_ssm_parameters() {
    local param_path="$1"; local env_file="$2"
    log_info "Fetching SSM parameters under: $param_path"
    if ! aws_cli_available; then
        log_error "aws CLI not installed"
        return 1
    fi
    local params
    if ! params=$(aws ssm get-parameters-by-path --with-decryption --path "$param_path" --query 'Parameters[].{Name:Name,Value:Value}' --output json 2>/dev/null); then
        log_error "Failed to retrieve SSM parameters"
        return 1
    fi
    python3 - <<PY | while IFS='=' read -r k v; do [[ -z "$k" ]] && continue; update_env_file_kv "$env_file" "$k" "$v"; echo "  • Updated $k"; done
import json, os
j=json.loads('''$params''')
for p in j:
    name=p['Name'].split('/')[-1]
    if name:
        print(f"{name}={p['Value']}")
PY
    log_success "SSM parameters applied to $(basename "$env_file")"
}

cmd_fetch_secrets() {
    local env_type="${1:-production}"; shift || true
    local env_file; env_file=$(get_env_file "$env_type")
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    local secret_id="${AWS_SECRETS_MANAGER_SECRET_ID:-$1}"
    local ssm_path="${AWS_SSM_PARAM_PATH:-}"  # optional
    if [[ -n "$secret_id" ]]; then
        fetch_secrets_manager "$secret_id" "$env_file"
    fi
    if [[ -n "$ssm_path" ]]; then
        fetch_ssm_parameters "$ssm_path" "$env_file"
    fi
    if [[ -z "$secret_id$ssm_path" ]]; then
        log_warning "No secret ID or SSM path provided. Set AWS_SECRETS_MANAGER_SECRET_ID or AWS_SSM_PARAM_PATH."
    fi
    fix_env_permissions "$env_file" || true
}

# =============================================================================
# HELP & USAGE
# =============================================================================

show_help() {
    echo "Watch Party Environment Validator & Fixer"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [ENVIRONMENT]"
    echo
    echo "COMMANDS:"
    echo "  validate [env]         Validate environment configuration"
    echo "  fix [env]              Fix environment issues automatically"
    echo "  interactive [env]      Interactive environment setup"
    echo "  status [env]           Show environment status"
    echo "  create [env]           Create new environment file"
    echo "  fetch-secrets [env]    Fetch & apply AWS Secrets Manager / SSM params"  
    echo
    echo "ENVIRONMENTS:"
    echo "  development            Development environment (.env)"
    echo "  production             Production environment (.env.production)"
    echo "  local                  Local environment (.env.local)"
    echo
    echo "OPTIONS:"
    echo "  --force                Force operations without confirmation"
    echo
    echo "EXAMPLES:"
    echo "  $0 validate production # Validate production environment"
    echo "  $0 fix development     # Fix development environment"
    echo "  $0 interactive prod    # Interactive production setup"
    echo "  $0 status              # Show current environment status"
}

main() {
    local command="${1:-help}"; local env_type="${2:-$(detect_environment)}"
    # Handle short environment names
    case "$env_type" in
        prod) env_type="production" ;;
        dev) env_type="development" ;;
    esac
    
    case "$command" in
        validate|check)
            validate_environment "$env_type"
            ;;
        fix|repair)
            fix_environment "$env_type"
            ;;
        interactive|setup)
            interactive_env_setup "$env_type"
            ;;
        status|info)
            show_env_status "$env_type"
            ;;
        create)
            local env_file
            env_file=$(get_env_file "$env_type")
            create_default_env "$env_file" "$env_type"
            ;;
        fetch-secrets|secrets)
            shift || true
            cmd_fetch_secrets "$env_type" "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
