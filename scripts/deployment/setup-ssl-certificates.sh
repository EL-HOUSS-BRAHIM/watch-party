#!/bin/bash

# =============================================================================
# SSL CERTIFICATE SETUP SCRIPT
# =============================================================================
# Configures SSL certificates for HTTPS

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
CURRENT_USER=$(whoami)

log_info "Setting up SSL certificates..."

# Function to setup SSL directory with fallback
setup_ssl_directory() {
    local base_dir="$1"
    local ssl_path="$base_dir/nginx/ssl"
    
    # Create directory structure
    mkdir -p "$base_dir/nginx" 2>/dev/null || true
    mkdir -p "$ssl_path" 2>/dev/null || true
    
    # Check and fix ownership if directory exists but not writable
    if [ -d "$ssl_path" ]; then
        local dir_owner=$(stat -c '%U' "$ssl_path" 2>/dev/null || echo "unknown")
        
        if [ "$dir_owner" != "$CURRENT_USER" ] && [ "$dir_owner" != "unknown" ]; then
            log_warning "SSL directory owned by $dir_owner, attempting to fix..."
            
            # Try to fix ownership with sudo
            if sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$ssl_path" 2>/dev/null; then
                log_success "Fixed SSL directory ownership"
            else
                log_warning "Cannot change ownership with sudo"
            fi
        fi
    fi
    
    # Test write permissions
    if touch "$ssl_path/.test_write" 2>/dev/null; then
        rm -f "$ssl_path/.test_write"
        echo "$ssl_path"
        return 0
    else
        return 1
    fi
}

# Try primary location first
if SSL_DIR=$(setup_ssl_directory "$APP_DIR"); then
    log_success "Using SSL directory: $SSL_DIR"
else
    log_warning "Cannot write to $APP_DIR/nginx/ssl, trying fallback location..."
    
    # Fallback to home directory
    if SSL_DIR=$(setup_ssl_directory "$HOME/watch-party"); then
        log_success "Using fallback SSL directory: $SSL_DIR"
        APP_DIR="$HOME/watch-party"
        # Export for other scripts
        export APP_DIR
        echo "export APP_DIR=\"$APP_DIR\"" >> /tmp/deployment-vars.sh 2>/dev/null || true
    else
        log_error "Cannot write to SSL directory in either location"
        log_error "Attempted: $APP_DIR/nginx/ssl and $HOME/watch-party/nginx/ssl"
        log_error "Current user: $CURRENT_USER"
        exit_with_error "No writable SSL directory available"
    fi
fi

log_success "SSL directory is writable: $SSL_DIR"

# Check if SSL certificates already exist
if [ -f "$SSL_DIR/origin.pem" ] && [ -f "$SSL_DIR/private.key" ]; then
    log_success "SSL certificates already exist"
    
    # Verify existing certificate
    if openssl x509 -in "$SSL_DIR/origin.pem" -noout -text > /dev/null 2>&1; then
        log_success "Existing SSL certificate is valid"
    else
        log_warning "Existing SSL certificate may be invalid"
    fi
else
    log_info "Creating SSL certificates from secrets..."
    
    # Create origin certificate
    if [ -n "${SSL_ORIGIN:-}" ]; then
        if echo "$SSL_ORIGIN" > "$SSL_DIR/origin.pem" 2>/dev/null; then
            chmod 644 "$SSL_DIR/origin.pem"
            log_success "SSL origin certificate created"
        else
            exit_with_error "Failed to create SSL origin certificate"
        fi
    else
        log_warning "SSL_ORIGIN secret not provided - HTTPS will not work"
    fi
    
    # Create private key
    if [ -n "${SSL_PRIVATE:-}" ]; then
        if echo "$SSL_PRIVATE" > "$SSL_DIR/private.key" 2>/dev/null; then
            chmod 600 "$SSL_DIR/private.key"
            log_success "SSL private key created"
        else
            exit_with_error "Failed to create SSL private key"
        fi
    else
        log_warning "SSL_PRIVATE secret not provided - HTTPS will not work"
    fi
    
    # Verify certificate
    if [ -f "$SSL_DIR/origin.pem" ] && [ -f "$SSL_DIR/private.key" ]; then
        if openssl x509 -in "$SSL_DIR/origin.pem" -noout -text > /dev/null 2>&1; then
            log_success "SSL certificate is valid"
        else
            log_warning "SSL certificate validation failed"
        fi
    fi
fi

log_success "SSL certificate setup complete"
