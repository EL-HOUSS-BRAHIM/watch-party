#!/bin/bash

# =============================================================================
# SERVICE DEPLOYMENT SCRIPT
# =============================================================================
# Starts and configures Docker services for production or staging

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
ENVIRONMENT="${ENVIRONMENT:-production}"
SERVICES="${SERVICES:-all}"

cd "$APP_DIR"

log_info "Deploying services for $ENVIRONMENT environment..."
log_info "Services to deploy: $SERVICES"

# Determine compose file and container names based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
    BACKEND_CONTAINER="backend-staging"
    FRONTEND_CONTAINER="frontend-staging"
    BACKEND_PORT="8003"
    FRONTEND_PORT="3001"
else
    COMPOSE_FILE="docker-compose.yml"
    BACKEND_CONTAINER="backend"
    FRONTEND_CONTAINER="frontend"
    BACKEND_PORT="8000"
    FRONTEND_PORT="3000"
fi

# Configure firewall (in background for speed)
if command_exists ufw; then
    log_info "Configuring firewall..."
    (sudo ufw allow 80/tcp 2>/dev/null && sudo ufw allow 443/tcp 2>/dev/null) &
    if [ "$ENVIRONMENT" = "staging" ]; then
        (sudo ufw allow 8080/tcp 2>/dev/null && sudo ufw allow 8443/tcp 2>/dev/null) &
    fi
fi

# Create network if it doesn't exist
if ! docker network ls | grep -q "watchparty-network"; then
    log_info "Creating Docker network..."
    docker network create watchparty-network
fi

# Deploy services based on selection
log_info "Starting services..."
if [ "$SERVICES" = "all" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d --force-recreate --remove-orphans
elif [ "$SERVICES" = "backend" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d --force-recreate --no-deps "$BACKEND_CONTAINER" celery-worker-${ENVIRONMENT} celery-beat-${ENVIRONMENT}
elif [ "$SERVICES" = "frontend" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d --force-recreate --no-deps "$FRONTEND_CONTAINER"
elif [ "$SERVICES" = "nginx" ]; then
    docker-compose -f "$COMPOSE_FILE" up -d --force-recreate --no-deps nginx-${ENVIRONMENT}
else
    log_error "Invalid SERVICES value: $SERVICES"
    exit 1
fi

# Quick wait for containers to initialize
sleep 5

# Wait for backend health check (if backend was deployed)
if [ "$SERVICES" = "all" ] || [ "$SERVICES" = "backend" ]; then
    log_info "Waiting for backend..."
    if ! wait_for_service "$BACKEND_CONTAINER" \
        "curl -f -s http://localhost:${BACKEND_PORT}/health/" \
        12 5; then
        log_error "Backend container logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50 "$BACKEND_CONTAINER"
        exit_with_error "Backend failed to start"
    fi
    
    # Run migrations if needed
    log_info "Checking for pending migrations..."
    if docker exec "$BACKEND_CONTAINER" python manage.py showmigrations --plan | grep -q "\[ \]"; then
        log_info "Running migrations..."
        if ! docker exec "$BACKEND_CONTAINER" python manage.py migrate; then
            log_error "Migration logs:"
            docker-compose -f "$COMPOSE_FILE" logs "$BACKEND_CONTAINER"
            exit_with_error "Migration failed"
        fi
        docker exec "$BACKEND_CONTAINER" python manage.py collectstatic --noinput
        log_success "Migrations completed"
    else
        log_success "No pending migrations"
    fi
fi

# Quick frontend check (if frontend was deployed)
if [ "$SERVICES" = "all" ] || [ "$SERVICES" = "frontend" ]; then
    log_info "Waiting for frontend..."
    if ! wait_for_service "$FRONTEND_CONTAINER" \
        "curl -f -s http://localhost:${FRONTEND_PORT}" \
        8 5; then
        log_error "Frontend container logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=30 "$FRONTEND_CONTAINER"
        exit_with_error "Frontend failed to start"
    fi
fi

# Verify services are running
log_info "Verifying services..."
if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    log_error "Container status:"
    docker-compose -f "$COMPOSE_FILE" ps
    exit_with_error "Some services failed to start"
fi

log_success "Services deployed successfully for $ENVIRONMENT environment"
