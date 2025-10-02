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

# Configure firewall
log_info "Configuring firewall..."
if command_exists ufw; then
    sudo ufw allow 80/tcp 2>/dev/null && log_success "HTTP port opened" || log_warning "Could not configure UFW for port 80"
    sudo ufw allow 443/tcp 2>/dev/null && log_success "HTTPS port opened" || log_warning "Could not configure UFW for port 443"
fi

# Start backend first
log_info "Starting backend service..."
docker-compose up -d backend

# Wait for backend to be ready
if ! wait_for_service "backend" \
    "docker-compose exec -T backend python manage.py check --deploy" \
    30 3; then
    log_error "Backend container logs:"
    docker-compose logs --tail=50 backend
    exit_with_error "Backend failed to start"
fi

# Start backend workers
log_info "Starting Celery workers..."
docker-compose up -d celery-worker celery-beat
sleep 10

# Start frontend
log_info "Starting frontend service..."
docker-compose up -d frontend

# Wait for frontend
if ! wait_for_service "frontend" \
    "curl -f -s http://localhost:3000" \
    15 4; then
    log_error "Frontend container logs:"
    docker-compose logs --tail=30 frontend
    exit_with_error "Frontend failed to start"
fi

# Start nginx
log_info "Starting nginx reverse proxy..."
docker-compose up -d nginx
sleep 10

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
