#!/bin/bash

# =============================================================================
# Watch Party Backend - Remote SSL Setup Script
# =============================================================================
# This script helps you upload Cloudflare Origin Certificates to your remote server.
# Server: 35.181.116.57
# =============================================================================

set -e

# Configuration
SERVER_HOST="35.181.208.71"
SERVER_USER="deploy"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
LOCAL_CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/secrets" && pwd)"
CERT_FILE="cloudflare-origin.pem"
KEY_FILE="cloudflare-origin.key"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if local certificates exist
check_local_certs() {
    if [[ ! -f "$LOCAL_CERT_DIR/$CERT_FILE" ]] || [[ ! -f "$LOCAL_CERT_DIR/$KEY_FILE" ]]; then
        print_warning "Cloudflare Origin Certificates not found locally!"
        echo "Please place your certificates in: $LOCAL_CERT_DIR"
        echo "  - $CERT_FILE"
        echo "  - $KEY_FILE"
        echo
        echo "To get these files:"
        echo "1. Go to Cloudflare Dashboard > SSL/TLS > Origin Server"
        echo "2. Create Certificate"
        echo "3. Copy the Certificate content to $LOCAL_CERT_DIR/$CERT_FILE"
        echo "4. Copy the Private Key content to $LOCAL_CERT_DIR/$KEY_FILE"
        exit 1
    fi
    print_status "Local certificates found."
}

# Upload certificates to server
upload_certs() {
    print_status "Uploading certificates to $SERVER_HOST..."
    
    # Create temp dir on server
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "mkdir -p /tmp/ssl_certs"
    
    # SCP files
    scp -i "$SSH_KEY" "$LOCAL_CERT_DIR/$CERT_FILE" "$SERVER_USER@$SERVER_HOST:/tmp/ssl_certs/"
    scp -i "$SSH_KEY" "$LOCAL_CERT_DIR/$KEY_FILE" "$SERVER_USER@$SERVER_HOST:/tmp/ssl_certs/"
    
    print_status "Certificates uploaded to temporary location."
}

# Install certificates on server
install_certs() {
    print_status "Installing certificates on server..."
    
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << EOF
        set -e
        
        # Move certificate
        sudo mv /tmp/ssl_certs/$CERT_FILE /etc/ssl/certs/$CERT_FILE
        sudo chown root:root /etc/ssl/certs/$CERT_FILE
        sudo chmod 644 /etc/ssl/certs/$CERT_FILE
        
        # Move private key
        sudo mv /tmp/ssl_certs/$KEY_FILE /etc/ssl/private/$KEY_FILE
        sudo chown root:root /etc/ssl/private/$KEY_FILE
        sudo chmod 600 /etc/ssl/private/$KEY_FILE
        
        # Clean up
        rm -rf /tmp/ssl_certs
        
        echo "Certificates installed successfully."
        
        # Test Nginx config
        if sudo nginx -t; then
            echo "Nginx configuration is valid."
            echo "Restarting Nginx..."
            sudo systemctl restart nginx
            echo "Nginx restarted."
        else
            echo "Nginx configuration test failed!"
            exit 1
        fi
EOF
    
    print_status "SSL setup completed successfully!"
}

main() {
    echo -e "${BLUE}=== Watch Party Remote SSL Setup ===${NC}"
    check_local_certs
    upload_certs
    install_certs
    echo
    print_status "Your server should now be serving HTTPS with the correct certificate."
    print_status "If you still see 526, ensure your Cloudflare SSL/TLS mode is set to 'Full (Strict)'."
}

main
