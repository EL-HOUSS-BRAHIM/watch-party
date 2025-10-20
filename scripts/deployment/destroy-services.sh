#!/bin/bash

# =============================================================================
# DESTROY SERVICES SCRIPT
# =============================================================================
# Selectively destroys backend, frontend, or both services

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"

# Configuration
APP_DIR="${APP_DIR:-$HOME/watch-party}"
DESTROY_TARGET="${DESTROY_TARGET:-both}"

log_info "Starting destroy process for: $DESTROY_TARGET"

# Determine Docker Compose command
DOCKER_COMPOSE=""
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    if command -v docker-compose >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
        log_info "Using docker-compose command"
    elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
        log_info "Using docker compose command"
    else
        log_error "No Docker Compose command found"
        exit 1
    fi
else
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

# Stop and remove services based on target
case "$DESTROY_TARGET" in
    backend)
        log_info "Stopping backend services (backend, celery-worker, celery-beat)..."
        $DOCKER_COMPOSE stop backend celery-worker celery-beat || true
        $DOCKER_COMPOSE rm -f backend celery-worker celery-beat || true
        log_success "Backend services stopped and removed"
        ;;
    
    frontend)
        log_info "Stopping frontend service..."
        $DOCKER_COMPOSE stop frontend || true
        $DOCKER_COMPOSE rm -f frontend || true
        log_success "Frontend service stopped and removed"
        ;;
    
    both)
        log_info "Stopping all Docker services..."
        $DOCKER_COMPOSE down --volumes --remove-orphans || true
        log_success "All services stopped and removed"
        
        # Prune Docker resources
        if command -v docker >/dev/null 2>&1; then
            log_info "Pruning Docker resources..."
            docker system prune -af || true
            docker volume prune -f || true
            docker network prune -f || true
            log_success "Docker resources pruned"
        fi
        
        # Remove application directory
        if [ -d "$APP_DIR" ]; then
            log_info "Removing application directory..."
            rm -rf "$APP_DIR"
            log_success "Application directory removed"
        fi
        
        # Clean nginx configuration
        if command -v systemctl >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
            log_info "Cleaning nginx configuration..."
            sudo rm -f /etc/nginx/conf.d/watch-party.conf /etc/nginx/sites-enabled/watch-party.conf
            sudo systemctl reload nginx || sudo systemctl restart nginx || true
            log_success "Nginx configuration cleaned"
        else
            log_warning "Skipping nginx cleanup (sudo without password not available)"
        fi
        ;;
    
    *)
        log_error "Unknown target: $DESTROY_TARGET"
        log_info "Valid targets: backend, frontend, both"
        exit 1
        ;;
esac

log_success "Destroy process completed for: $DESTROY_TARGET"
