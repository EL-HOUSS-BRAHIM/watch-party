#!/bin/bash

# =============================================================================
# Watch Party Backend - Nginx Configuration Deployment Script
# =============================================================================
# This script deploys the Nginx configuration to the remote server.
# Server: 35.181.116.57
# =============================================================================

set -e

# Configuration
SERVER_HOST="35.181.116.57"
SERVER_USER="ubuntu"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
LOCAL_CONFIG_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/nginx.conf"
REMOTE_CONFIG_NAME="watch-party"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if local config exists
check_local_config() {
    if [[ ! -f "$LOCAL_CONFIG_FILE" ]]; then
        print_error "Local Nginx configuration file not found at $LOCAL_CONFIG_FILE"
        exit 1
    fi
    print_status "Local configuration found."
}

# Deploy configuration
deploy_config() {
    print_status "Uploading Nginx configuration to $SERVER_HOST..."
    
    # Upload to temp location
    scp -i "$SSH_KEY" "$LOCAL_CONFIG_FILE" "$SERVER_USER@$SERVER_HOST:/tmp/$REMOTE_CONFIG_NAME.conf"
    
    print_status "Installing configuration on server..."
    
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << EOF
        set -e
        
        # Move config to sites-available
        sudo mv /tmp/$REMOTE_CONFIG_NAME.conf /etc/nginx/sites-available/$REMOTE_CONFIG_NAME
        sudo chown root:root /etc/nginx/sites-available/$REMOTE_CONFIG_NAME
        
        # Enable site (symlink)
        if [ ! -L /etc/nginx/sites-enabled/$REMOTE_CONFIG_NAME ]; then
            echo "Enabling site $REMOTE_CONFIG_NAME..."
            sudo ln -s /etc/nginx/sites-available/$REMOTE_CONFIG_NAME /etc/nginx/sites-enabled/
        else
            echo "Site $REMOTE_CONFIG_NAME is already enabled."
        fi
        
        # Test configuration
        echo "Testing Nginx configuration..."
        if sudo nginx -t; then
            echo "Configuration is valid."
            echo "Restarting Nginx..."
            sudo systemctl restart nginx
            echo "Nginx restarted successfully."
        else
            echo "Nginx configuration test failed!"
            exit 1
        fi
EOF
    
    print_status "Nginx configuration deployed successfully!"
}

main() {
    echo -e "${BLUE}=== Watch Party Nginx Config Deployment ===${NC}"
    check_local_config
    deploy_config
    echo
    print_status "Your server should now be serving the correct configuration."
}

main
