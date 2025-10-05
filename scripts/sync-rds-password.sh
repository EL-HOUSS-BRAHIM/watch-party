#!/bin/bash

# Sync RDS Password from AWS Secrets Manager
# This script should be run periodically to keep the backend .env file updated
# with the current RDS password from AWS Secrets Manager

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
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Function to URL encode a string
url_encode() {
    python3 -c "import urllib.parse; print(urllib.parse.quote('$1', safe=''))"
}

# Function to get RDS credentials from AWS Secrets Manager
get_rds_credentials() {
    local secret_id="rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae"
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
    
    # Parse the JSON and extract credentials
    local username password host port dbname
    username=$(echo "$secret_json" | jq -r '.username // "watchparty_admin"')
    password=$(echo "$secret_json" | jq -r '.password')
    host=$(echo "$secret_json" | jq -r '.host // "all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com"')
    port=$(echo "$secret_json" | jq -r '.port // "5432"')
    dbname=$(echo "$secret_json" | jq -r '.dbname // "watchparty_prod"')
    
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

# Function to update the .env file
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

# Function to restart backend services
restart_backend() {
    log "Restarting backend services to apply new database credentials..."
    
    if command -v docker-compose &> /dev/null; then
        cd "$PROJECT_ROOT"
        docker-compose restart backend celery-worker celery-beat
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
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
" 2>/dev/null; then
        log "✅ Database connection test passed"
        return 0
    else
        error "❌ Database connection test failed"
        return 1
    fi
}

# Main function
main() {
    log "Starting RDS password sync..."
    
    # Check if required tools are available
    for tool in jq python3; do
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
    if [[ "$current_database_url" == "$new_database_url" ]]; then
        log "Database credentials are already up to date"
        
        # Still test the connection to make sure it's working
        if test_database_connection; then
            log "Password sync completed - no changes needed"
            exit 0
        else
            warn "Database connection failed even though credentials appear current"
            warn "Proceeding with restart to refresh connections..."
        fi
    else
        log "Database credentials need to be updated"
    fi
    
    # Update the .env file
    if ! update_env_file "$new_database_url"; then
        error "Failed to update .env file"
        exit 1
    fi
    
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
    
    log "✅ RDS password sync completed successfully!"
}

# Run the main function
main "$@"