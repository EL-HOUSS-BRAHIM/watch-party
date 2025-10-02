#!/bin/bash

# =============================================================================
# DOCKER BUILD SCRIPT
# =============================================================================
# Builds Docker images with optimization

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
cd "$APP_DIR"

log_info "Building Docker images..."

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain
export SKIP_AWS_DURING_BUILD=1

# Clean up old containers
log_info "Cleaning up old containers..."
docker-compose down --remove-orphans || true

# Fix SSL directory ownership if it exists and is owned by root
if [ -d "$APP_DIR/nginx/ssl" ]; then
    SSL_OWNER=$(stat -c '%U' "$APP_DIR/nginx/ssl" 2>/dev/null || echo "unknown")
    CURRENT_USER=$(whoami)
    
    if [ "$SSL_OWNER" = "root" ]; then
        log_warning "SSL directory owned by root, attempting to fix..."
        if sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$APP_DIR/nginx/ssl" 2>/dev/null; then
            log_success "Fixed SSL directory ownership"
        else
            log_warning "Cannot change SSL directory ownership, will use fallback location"
        fi
    fi
fi

# Try parallel build first
log_info "Attempting parallel build..."
if timeout 1200 docker-compose build --parallel \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --build-arg SKIP_AWS_DURING_BUILD=1 2>&1; then
    log_success "Parallel build successful"
else
    log_warning "Parallel build failed, trying sequential build..."
    
    # Build backend
    log_info "Building backend image..."
    if ! timeout 600 docker-compose build backend \
        --build-arg SKIP_AWS_DURING_BUILD=1; then
        exit_with_error "Backend build failed"
    fi
    log_success "Backend image built"
    
    # Build frontend
    log_info "Building frontend image..."
    if ! timeout 1200 docker-compose build frontend \
        --build-arg NODE_OPTIONS="--max-old-space-size=2048" \
        --build-arg SKIP_AWS_DURING_BUILD=1; then
        exit_with_error "Frontend build failed"
    fi
    log_success "Frontend image built"
fi

log_success "All Docker images built successfully"
