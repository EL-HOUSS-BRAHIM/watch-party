#!/bin/bash

# =============================================================================
# SERVICE DEPLOYMENT SCRIPT
# =============================================================================
# Starts and configures Docker services

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
cd "$APP_DIR"

log_info "Deploying services..."

# Configure firewall (in background for speed)
if command_exists ufw; then
    log_info "Configuring firewall..."
    (sudo ufw allow 80/tcp 2>/dev/null && sudo ufw allow 443/tcp 2>/dev/null) &
fi

# Start all services in parallel (docker-compose will handle dependencies)
log_info "Starting all services..."
docker-compose up -d

# Quick wait for containers to initialize
sleep 5

# Wait for backend health check (faster check)
log_info "Waiting for backend..."
if ! wait_for_service "backend" \
    "curl -f -s http://localhost:8000/health/" \
    20 5; then
    log_error "Backend container logs:"
    docker-compose logs --tail=50 backend
    exit_with_error "Backend failed to start"
fi

# Quick frontend check (parallel)
log_info "Waiting for frontend..."
if ! wait_for_service "frontend" \
    "curl -f -s http://localhost:3000" \
    10 5; then
    log_error "Frontend container logs:"
    docker-compose logs --tail=30 frontend
    exit_with_error "Frontend failed to start"
fi

# Verify all services are running
log_info "Verifying all services..."
if ! docker-compose ps | grep -q "Up"; then
    log_error "Container status:"
    docker-compose ps
    exit_with_error "Some services failed to start"
fi

# Run migrations if needed
log_info "Checking for pending migrations..."
if docker-compose exec -T backend python manage.py showmigrations --plan | grep -q "\[ \]"; then
    log_info "Running migrations..."
    if ! docker-compose exec -T backend python manage.py migrate; then
        log_error "Migration logs:"
        docker-compose logs backend
        exit_with_error "Migration failed"
    fi
    docker-compose exec -T backend python manage.py collectstatic --noinput
    log_success "Migrations completed"
else
    log_success "No pending migrations"
fi

log_success "All services deployed successfully"
