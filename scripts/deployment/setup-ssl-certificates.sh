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
SSL_DIR="$APP_DIR/nginx/ssl"

log_info "Setting up SSL certificates..."

# Create SSL directory
mkdir -p "$APP_DIR/nginx"
mkdir -p "$SSL_DIR"

# Check and fix directory ownership if needed
CURRENT_OWNER=$(stat -c '%U' "$SSL_DIR" 2>/dev/null || echo "unknown")
CURRENT_USER=$(whoami)

if [ "$CURRENT_OWNER" != "$CURRENT_USER" ]; then
    log_warning "SSL directory owned by $CURRENT_OWNER, attempting to fix..."
    
    # Try to fix ownership with sudo
    if sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$SSL_DIR" 2>/dev/null; then
        log_success "Fixed SSL directory ownership"
    else
        log_warning "Cannot change ownership with sudo, trying direct access..."
    fi
fi

# Test write permissions
if ! touch "$SSL_DIR/.test_write" 2>/dev/null; then
    log_error "Cannot write to SSL directory: $SSL_DIR"
    log_error "Directory owner: $(stat -c '%U:%G' $SSL_DIR 2>/dev/null || echo 'unknown')"
    log_error "Directory permissions: $(stat -c '%a' $SSL_DIR 2>/dev/null || echo 'unknown')"
    log_error "Current user: $CURRENT_USER"
    exit_with_error "SSL directory not writable"
fi

rm -f "$SSL_DIR/.test_write"
log_success "SSL directory is writable"

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
