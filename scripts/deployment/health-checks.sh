#!/bin/bash

# =============================================================================
# HEALTH CHECK SCRIPT
# =============================================================================
# Performs comprehensive health checks on deployed services

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
cd "$APP_DIR"

log_info "Running health checks..."

# Quick parallel check
log_info "Testing services..."

# Backend health check (reduced retries, faster timeout)
backend_healthy=false
for i in {1..5}; do
    if curl -f -s -m 3 http://localhost:8000/health/ > /dev/null 2>&1; then
        log_success "✓ Backend healthy"
        backend_healthy=true
        break
    else
        [ $i -lt 5 ] && sleep 2
    fi
done

if [ "$backend_healthy" = false ]; then
    log_error "Backend diagnostics:"
    docker-compose logs --tail=30 backend
    exit_with_error "Backend health check failed"
fi

# Frontend health check (reduced retries)
frontend_healthy=false
for i in {1..4}; do
    if curl -f -s -m 3 http://localhost:3000 > /dev/null 2>&1; then
        log_success "✓ Frontend healthy"
        frontend_healthy=true
        break
    else
        [ $i -lt 4 ] && sleep 2
    fi
done

if [ "$frontend_healthy" = false ]; then
    log_error "Frontend logs:"
    docker-compose logs --tail=20 frontend
    exit_with_error "Frontend health check failed"
fi

# Nginx quick check (non-blocking)
log_info "Testing nginx..."
if curl -f -s -m 3 http://localhost:80 > /dev/null 2>&1; then
    log_success "✓ Nginx HTTP responding"
fi

if curl -f -s -m 3 -k https://localhost:443 > /dev/null 2>&1; then
    log_success "✓ Nginx HTTPS responding"
fi

# Check container status
log_info "Container status:"
docker-compose ps

# Check listening ports
if command_exists ss; then
    log_info "Listening ports:"
    ss -tlnp | grep -E ':80|:443|:3000|:8000' || echo "  No relevant ports found"
fi

# Get public IP and test external access
PUBLIC_IP=$(curl -s -m 10 http://checkip.amazonaws.com/ 2>/dev/null || echo "unknown")
log_info "Server public IP: $PUBLIC_IP"

if [ "$PUBLIC_IP" != "unknown" ] && [ -n "$PUBLIC_IP" ]; then
    log_info "Testing external HTTP access..."
    if curl -f -s -m 10 -H "Host: be-watch-party.brahim-elhouss.me" "http://$PUBLIC_IP/health" > /dev/null 2>&1; then
        log_success "Direct HTTP access works"
    else
        log_warning "Direct HTTP access failed"
    fi
    
    log_info "Testing external HTTPS access..."
    if curl -f -s -m 10 -k -H "Host: be-watch-party.brahim-elhouss.me" "https://$PUBLIC_IP/health" > /dev/null 2>&1; then
        log_success "Direct HTTPS access works"
    else
        log_warning "Direct HTTPS access failed"
    fi
fi

# Final comprehensive test
if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
    log_success "All health checks passed!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Server Public IP: $PUBLIC_IP"
    echo "  Frontend: https://watch-party.brahim-elhouss.me/"
    echo "  Backend API: https://be-watch-party.brahim-elhouss.me/api/"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    log_info "If you see Cloudflare Error 521:"
    echo "  1. Verify Cloudflare DNS points to: $PUBLIC_IP"
    echo "  2. Check firewall allows ports 80 and 443"
    echo "  3. Wait a few minutes for DNS propagation"
else
    log_error "Container status:"
    docker-compose ps
    exit_with_error "Final health check failed"
fi

log_success "Health checks complete"
