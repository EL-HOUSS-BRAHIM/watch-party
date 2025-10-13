#!/bin/bash

# =============================================================================
# DOCKER BUILD SCRIPT
# =============================================================================
# Builds Docker images with optimization
# 
# Options:
#   FORCE_REBUILD=1  - Build without using cache (forces fresh build)
#   REMOVE_OLD_IMAGES=1 - Remove old images before building

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
cd "$APP_DIR"

# Parse environment options
FORCE_REBUILD="${FORCE_REBUILD:-0}"
REMOVE_OLD_IMAGES="${REMOVE_OLD_IMAGES:-0}"

if [ "$FORCE_REBUILD" = "1" ]; then
    log_warning "FORCE_REBUILD enabled - building without cache"
fi

if [ "$REMOVE_OLD_IMAGES" = "1" ]; then
    log_warning "REMOVE_OLD_IMAGES enabled - removing old images before build"
fi

log_info "Building Docker images..."

# Define frontend build arguments
# Updated for direct backend communication (no frontend API routes)
NEXT_PUBLIC_API_URL="https://be-watch-party.brahim-elhouss.me"
NEXT_PUBLIC_WS_URL="wss://be-watch-party.brahim-elhouss.me/ws"

log_info "Frontend build configuration:"
log_info "  NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
log_info "  NEXT_PUBLIC_WS_URL: $NEXT_PUBLIC_WS_URL"
log_info "  NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE: true"
log_info "  NEXT_PUBLIC_ENABLE_DISCORD: true"
log_info "  NEXT_PUBLIC_ENABLE_ANALYTICS: true"

# Get current git commit hash for cache busting
GIT_COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
log_info "Building from commit: $GIT_COMMIT_HASH"

# Enable Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain
export SKIP_AWS_DURING_BUILD=1

# Clean up old containers
log_info "Cleaning up old containers..."
docker-compose down --remove-orphans || true

# Remove old images if requested (for complete fresh build)
if [ "$REMOVE_OLD_IMAGES" = "1" ]; then
    log_info "Removing old Docker images..."
    docker image rm watchparty-backend:latest 2>/dev/null && log_success "Removed old backend image" || log_info "No old backend image to remove"
    docker image rm watchparty-frontend:latest 2>/dev/null && log_success "Removed old frontend image" || log_info "No old frontend image to remove"
    # Also prune dangling images
    docker image prune -f 2>/dev/null || true
fi

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

# Prepare build flags
BUILD_FLAGS=""
if [ "$FORCE_REBUILD" = "1" ]; then
    BUILD_FLAGS="$BUILD_FLAGS --no-cache --pull"
    log_info "Build flags: --no-cache --pull (forcing fresh build)"
fi

# Optimize build process based on what changed
log_info "Checking what needs to be rebuilt..."

# Check if images exist
BACKEND_EXISTS=$(docker images -q watchparty-backend:latest 2>/dev/null)
FRONTEND_EXISTS=$(docker images -q watchparty-frontend:latest 2>/dev/null)

# If force rebuild, build everything
if [ "$FORCE_REBUILD" = "1" ]; then
    log_info "Force rebuild enabled - building all services..."
    REBUILD_BACKEND=1
    REBUILD_FRONTEND=1
else
    # Smart detection: only rebuild what changed
    REBUILD_BACKEND=0
    REBUILD_FRONTEND=0
    
    # Check if backend code changed (only if image exists)
    if [ -n "$BACKEND_EXISTS" ]; then
        if git diff HEAD~1 HEAD --quiet -- backend/ 2>/dev/null; then
            log_info "✓ Backend unchanged - using cached image"
        else
            log_info "✓ Backend changed - will rebuild"
            REBUILD_BACKEND=1
        fi
    else
        log_info "✓ Backend image not found - will build"
        REBUILD_BACKEND=1
    fi
    
    # Check if frontend code changed (only if image exists)
    if [ -n "$FRONTEND_EXISTS" ]; then
        if git diff HEAD~1 HEAD --quiet -- frontend/ 2>/dev/null; then
            log_info "✓ Frontend unchanged - using cached image"
        else
            log_info "✓ Frontend changed - will rebuild"
            REBUILD_FRONTEND=1
        fi
    else
        log_info "✓ Frontend image not found - will build"
        REBUILD_FRONTEND=1
    fi
fi

# Skip build entirely if nothing needs rebuilding
if [ "$REBUILD_BACKEND" = "0" ] && [ "$REBUILD_FRONTEND" = "0" ]; then
    log_success "⚡ No changes detected - skipping build entirely!"
    log_info "Using existing images:"
    docker images | grep watchparty | head -2
    exit 0
fi

# Build only what's needed
log_info "Building required services..."

if [ "$REBUILD_BACKEND" = "1" ]; then
    log_info "🔨 Building backend..."
    if ! timeout 600 docker-compose build $BUILD_FLAGS backend \
        --build-arg SKIP_AWS_DURING_BUILD=1 \
        --build-arg DATABASE_URL="sqlite:///tmp/build.db" \
        --build-arg GIT_COMMIT_HASH="$GIT_COMMIT_HASH"; then
        exit_with_error "Backend build failed"
    fi
    log_success "✓ Backend built"
fi

if [ "$REBUILD_FRONTEND" = "1" ]; then
    log_info "🔨 Building frontend..."
    if ! timeout 900 docker-compose build $BUILD_FLAGS frontend \
        --build-arg NODE_OPTIONS="--max-old-space-size=2048" \
        --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        --build-arg NEXT_PUBLIC_WS_URL="$NEXT_PUBLIC_WS_URL" \
        --build-arg NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE="true" \
        --build-arg NEXT_PUBLIC_ENABLE_DISCORD="true" \
        --build-arg NEXT_PUBLIC_ENABLE_ANALYTICS="true" \
        --build-arg SKIP_AWS_DURING_BUILD=1 \
        --build-arg GIT_COMMIT_HASH="$GIT_COMMIT_HASH"; then
        exit_with_error "Frontend build failed"
    fi
    log_success "✓ Frontend built"
fi

log_success "All Docker images built successfully"

# Verify that frontend has correct API URL embedded (quick check)
log_info "Verifying frontend build has correct API URL embedded..."
if docker run --rm watchparty-frontend:latest find .next -name "*.js" -exec grep -l "be-watch-party.brahim-elhouss.me" {} \; 2>/dev/null | head -1 | grep -q ".js"; then
    log_success "✅ Backend URL is properly embedded in frontend build"
else
    log_warning "⚠️  Could not verify if backend URL is embedded (container might not be running yet)"
fi
