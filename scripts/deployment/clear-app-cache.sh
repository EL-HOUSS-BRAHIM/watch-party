#!/bin/bash

# =============================================================================
# CLEAR APPLICATION CACHES
# =============================================================================
# Removes build and runtime cache directories for the frontend and backend
# applications to ensure fresh assets are generated on the next deployment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"

# Rehydrate APP_DIR/TARGET_BRANCH if setup script exported them previously
if [ -f /tmp/deployment-vars.sh ]; then
    source /tmp/deployment-vars.sh
fi

APP_NAME="${APP_NAME:-watch-party}"
APP_DIR="${APP_DIR:-/srv/$APP_NAME}"
TARGET="${1:-all}"

case "$TARGET" in
    frontend|backend|all)
        ;;
    *)
        log_error "Invalid target '$TARGET'. Use frontend, backend, or all."
        exit 1
        ;;
esac

log_step "Clearing application caches (target: $TARGET)"

clear_frontend_cache() {
    if [ ! -d "$APP_DIR/frontend" ]; then
        log_warning "Frontend directory not found at $APP_DIR/frontend"
        return
    fi

    log_info "Removing Next.js build artifacts"
    rm -rf "$APP_DIR/frontend/.next" \
           "$APP_DIR/frontend/.turbo" \
           "$APP_DIR/frontend/out"

    log_info "Removing node_modules caches"
    find "$APP_DIR/frontend" -type d -name ".cache" -prune -exec rm -rf {} + 2>/dev/null || true
    rm -rf "$APP_DIR/frontend/node_modules/.cache" 2>/dev/null || true

    log_success "Frontend caches cleared"
}

clear_backend_cache() {
    if [ ! -d "$APP_DIR/backend" ]; then
        log_warning "Backend directory not found at $APP_DIR/backend"
        return
    fi

    log_info "Removing Python bytecode and cache directories"
    find "$APP_DIR/backend" -type d \( -name "__pycache__" -o -name ".pytest_cache" -o -name ".mypy_cache" \) \
        -prune -exec rm -rf {} + 2>/dev/null || true
    find "$APP_DIR/backend" -type f -name "*.py[cod]" -delete 2>/dev/null || true

    log_info "Removing collected static assets cache"
    rm -rf "$APP_DIR/backend/staticfiles" 2>/dev/null || true

    log_success "Backend caches cleared"
}

if [ "$TARGET" = "frontend" ] || [ "$TARGET" = "all" ]; then
    clear_frontend_cache
fi

if [ "$TARGET" = "backend" ] || [ "$TARGET" = "all" ]; then
    clear_backend_cache
fi

# Clear Docker build cache to ensure fresh builds
if [ "$TARGET" = "all" ]; then
    log_info "Clearing Docker build cache"
    docker builder prune -f 2>/dev/null || true
    log_success "Docker build cache cleared"
fi

log_success "Cache cleanup complete"
