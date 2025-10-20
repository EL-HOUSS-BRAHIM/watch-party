#!/bin/bash

# Sync RDS and Valkey Passwords from AWS Secrets Manager
# This script should be run periodically to keep the backend .env file updated
# with the current RDS and Valkey passwords from AWS Secrets Manager

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
ENV_FILE="$BACKEND_DIR/.env"

# Configuration
AWS_CLI_PATH="/home/deploy/aws-cli-bin/aws"
if [[ ! -x "$AWS_CLI_PATH" ]]; then
    # Fallback to PATH
    AWS_CLI_PATH="aws"
fi
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" >&2
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

# Function to URL encode a string
url_encode() {
    python3 -c "import urllib.parse; print(urllib.parse.quote('$1', safe=''))"
}

# Function to get RDS credentials from AWS Secrets Manager
get_rds_credentials() {
    # Use the full ARN format for the RDS managed secret
    local secret_id="arn:aws:secretsmanager:eu-west-3:211125363745:secret:rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae"
    local region="eu-west-3"
    
    log "Retrieving RDS credentials from AWS Secrets Manager..."
    
    # Get the secret value
    local secret_json
    if ! secret_json=$($AWS_CLI_PATH secretsmanager get-secret-value \
        --secret-id "$secret_id" \
        --region "$region" \
        --query SecretString \
        --output text 2>/dev/null); then
        error "Failed to retrieve secret from AWS Secrets Manager"
        return 1
    fi
    
    # Parse the JSON and extract credentials using Python instead of jq
    local username password host port dbname
    username=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('username', 'watchparty_admin'))")
    password=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('password', ''))")
    host=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('host', 'all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com'))")
    port=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('port', '5432'))")
    dbname=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('dbname', 'watchparty_prod'))")
    
    if [[ -z "$password" || "$password" == "null" ]]; then
        error "Invalid password retrieved from secret"
        return 1
    fi
    
    # URL encode the password to handle special characters
    local encoded_password
    encoded_password=$(url_encode "$password")
    
    # Construct the DATABASE_URL
    DATABASE_URL="postgresql://${username}:${encoded_password}@${host}:${port}/${dbname}?sslmode=require"
    
    log "Successfully retrieved RDS credentials"
    log "Username: $username"
    log "Host: $host"
    log "Port: $port"
    log "Database: $dbname"
    log "Password length: ${#password} characters"
    
    echo "$DATABASE_URL"
}

# Function to get Valkey/Redis credentials from AWS Secrets Manager
get_valkey_credentials() {
    local secret_id="watch-party-valkey-001-auth-token"
    local region="eu-west-3"
    
    log "Retrieving Valkey credentials from AWS Secrets Manager..."
    
    # Get the secret value
    local secret_json
    if ! secret_json=$($AWS_CLI_PATH secretsmanager get-secret-value \
        --secret-id "$secret_id" \
        --region "$region" \
        --query SecretString \
        --output text 2>/dev/null); then
        error "Failed to retrieve Valkey secret from AWS Secrets Manager"
        return 1
    fi
    
    # Parse the JSON and extract token (try both 'token' and 'auth_token' keys)
    local token endpoint
    token=$(echo "$secret_json" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('token', data.get('auth_token', '')))")
    
    # Get the Valkey endpoint from environment or use default
    # This matches the production.py default configuration
    endpoint="clustercfg.watch-party-valkey-001.rnipvl.memorydb.eu-west-3.amazonaws.com"
    
    if [[ -z "$token" || "$token" == "null" ]]; then
        error "Invalid token retrieved from secret"
        return 1
    fi
    
    # URL encode the token to handle special characters
    local encoded_token
    encoded_token=$(url_encode "$token")
    
    log "Successfully retrieved Valkey credentials"
    log "Token length: ${#token} characters"
    
    # Return multiple values as JSON for easier parsing
    echo "{\"token\":\"$token\",\"encoded_token\":\"$encoded_token\",\"endpoint\":\"$endpoint\"}"
}

# Function to update environment variable in .env file
update_env_var() {
    local key="$1"
    local value="$2"
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Use sed to replace the line
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        log "Updated ${key} in .env file"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
        log "Added ${key} to .env file"
    fi
}

# Function to update the .env file with database credentials
update_env_file() {
    local new_database_url="$1"
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        return 1
    fi
    
    # Create a backup
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    log "Created backup of .env file"
    
    # Update the DATABASE_URL in the .env file
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        # Use awk to replace the line, which handles special characters better
        awk -v new_url="$new_database_url" '
            /^DATABASE_URL=/ { print "DATABASE_URL=" new_url; next }
            { print }
        ' "$ENV_FILE" > "${ENV_FILE}.tmp" && mv "${ENV_FILE}.tmp" "$ENV_FILE"
        log "Updated existing DATABASE_URL in .env file"
    else
        echo "DATABASE_URL=$new_database_url" >> "$ENV_FILE"
        log "Added DATABASE_URL to .env file"
    fi
}

# Function to update Valkey/Redis credentials in .env file
update_valkey_env() {
    local valkey_data="$1"
    
    # Parse the JSON data
    local token encoded_token endpoint
    token=$(echo "$valkey_data" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('token', ''))")
    encoded_token=$(echo "$valkey_data" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('encoded_token', ''))")
    endpoint=$(echo "$valkey_data" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('endpoint', ''))")
    
    log "Updating Valkey/Redis configuration in .env file..."
    
    # Update Redis configuration
    update_env_var "REDIS_HOST" "$endpoint"
    update_env_var "REDIS_PORT" "6379"
    update_env_var "REDIS_PASSWORD" "$token"
    update_env_var "REDIS_USE_SSL" "True"
    update_env_var "REDIS_URL" "rediss://:${encoded_token}@${endpoint}:6379/0?ssl_cert_reqs=none"
    
    # Update Celery configuration
    update_env_var "CELERY_BROKER_URL" "rediss://:${encoded_token}@${endpoint}:6379/2?ssl_cert_reqs=none"
    update_env_var "CELERY_RESULT_BACKEND" "rediss://:${encoded_token}@${endpoint}:6379/3?ssl_cert_reqs=none"
    
    # Update Channel Layers configuration
    update_env_var "CHANNEL_LAYERS_CONFIG_HOSTS" "rediss://:${encoded_token}@${endpoint}:6379/4?ssl_cert_reqs=none"
    
    log "Valkey/Redis configuration updated successfully"
}

# Function to restart backend services
restart_backend() {
    log "Restarting backend services to apply new database credentials..."
    
    if command -v docker-compose &> /dev/null; then
        cd "$PROJECT_ROOT"
        # Stop and recreate containers to pick up new environment variables
        docker-compose stop backend celery-worker celery-beat
        docker-compose rm -f backend celery-worker celery-beat
        docker-compose up -d backend celery-worker celery-beat
        log "Backend services restarted successfully"
    else
        warn "docker-compose not found, skipping service restart"
        warn "You may need to manually restart the backend services"
    fi
}

# Function to test database connection
test_database_connection() {
    log "Testing database connection..."
    
    # Test the connection using the backend container
    if docker exec watch-party-backend-1 python3 -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()
from django.db import connection
try:
    cursor = connection.cursor()
    cursor.execute('SELECT 1')
except Exception as e:
    import sys
    print(f'Database connection failed: {e}', file=sys.stderr)
    exit(1)
" 2>&1 > /dev/null; then
        log "✅ Database connection test passed"
        return 0
    else
        error "❌ Database connection test failed"
        return 1
    fi
}

# Main function
main() {
    log "Starting RDS and Valkey password sync..."
    
    # Check if required tools are available
    for tool in python3; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Check AWS CLI specifically
    if [[ ! -x "$AWS_CLI_PATH" ]]; then
        error "AWS CLI not found at: $AWS_CLI_PATH"
        exit 1
    fi
    
    local needs_restart=false
    
    # === RDS Password Sync ===
    log "Checking RDS credentials..."
    
    # Get current DATABASE_URL from .env file
    local current_database_url
    if [[ -f "$ENV_FILE" ]] && grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        current_database_url=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
        log "Current DATABASE_URL found in .env file"
    else
        warn "No current DATABASE_URL found in .env file"
        current_database_url=""
    fi
    
    # Get new DATABASE_URL from AWS Secrets Manager
    local new_database_url
    if ! new_database_url=$(get_rds_credentials); then
        error "Failed to get RDS credentials from AWS Secrets Manager"
        exit 1
    fi
    
    # Compare URLs to see if update is needed
    if [[ "$current_database_url" != "$new_database_url" ]]; then
        log "Database credentials need to be updated"
        
        # Update the .env file
        if ! update_env_file "$new_database_url"; then
            error "Failed to update .env file"
            exit 1
        fi
        
        needs_restart=true
    else
        log "✅ Database credentials are already up to date"
    fi
    
    # === Valkey/Redis Password Sync ===
    log "Checking Valkey credentials..."
    
    # Get current Redis password from .env file
    local current_redis_password
    if [[ -f "$ENV_FILE" ]] && grep -q "^REDIS_PASSWORD=" "$ENV_FILE"; then
        current_redis_password=$(grep "^REDIS_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)
    else
        warn "No current REDIS_PASSWORD found in .env file"
        current_redis_password=""
    fi
    
    # Get new Valkey credentials from AWS Secrets Manager
    local valkey_data
    if ! valkey_data=$(get_valkey_credentials); then
        warn "Failed to get Valkey credentials from AWS Secrets Manager"
        warn "Continuing with RDS update only..."
    else
        # Extract the token from the JSON data
        local new_redis_password
        new_redis_password=$(echo "$valkey_data" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('token', ''))")
        
        # Compare passwords to see if update is needed
        if [[ "$current_redis_password" != "$new_redis_password" ]]; then
            log "Valkey credentials need to be updated"
            
            # Update Valkey configuration in .env file
            if ! update_valkey_env "$valkey_data"; then
                warn "Failed to update Valkey configuration"
            else
                needs_restart=true
            fi
        else
            log "✅ Valkey credentials are already up to date"
        fi
    fi
    
    # Restart services if needed
    if [[ "$needs_restart" == "true" ]]; then
        log "Changes detected, restarting backend services..."
        
        # Restart backend services
        if ! restart_backend; then
            error "Failed to restart backend services"
            exit 1
        fi
        
        # Wait a moment for services to start
        sleep 10
        
        # Test the database connection
        if ! test_database_connection; then
            error "Database connection test failed after update"
            exit 1
        fi
        
        log "✅ Password sync completed with updates!"
    else
        log "✅ All credentials are up to date - no restart needed"
        
        # Still test the connection to make sure it's working
        if test_database_connection; then
            log "Password sync completed - no changes needed"
            exit 0
        else
            warn "Database connection failed even though credentials appear current"
            warn "You may need to manually check the services"
            exit 1
        fi
    fi
}

# Run the main function
main "$@"