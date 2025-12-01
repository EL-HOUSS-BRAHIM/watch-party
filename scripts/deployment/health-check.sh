#!/bin/bash
# Health check script for production and staging environments
# Usage: ./health-check.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
MAX_RETRIES=10
RETRY_DELAY=2
PROJECT_PREFIX=${PROJECT_PREFIX:-$(basename "$(pwd)")}

# Determine compose file and base service names
if [ "$ENVIRONMENT" = "staging" ]; then
    BACKEND_URL="https://staging-be-watch-party.brahim-elhouss.me"
    FRONTEND_URL="https://staging-watch-party.brahim-elhouss.me"
    BACKEND_SERVICE="backend-staging"
    FRONTEND_SERVICE="frontend-staging"
    COMPOSE_FILE="docker-compose.staging.yml"
else
    BACKEND_URL="https://be-watch-party.brahim-elhouss.me"
    FRONTEND_URL="https://watch-party.brahim-elhouss.me"
    BACKEND_SERVICE="backend"
    FRONTEND_SERVICE="frontend"
    COMPOSE_FILE="docker-compose.yml"
fi

# Resolve actual container names created by docker compose (e.g. watch-party-backend-1)
resolve_container_name() {
    local service=$1
    local resolved=""

    if [ "${DEBUG_HEALTHCHECK:-0}" = "1" ]; then
        echo "[debug] Resolving container for ${service} with prefix ${PROJECT_PREFIX}" >&2
    fi

    resolved=$(docker ps -a --filter "name=${PROJECT_PREFIX}-${service}" --format "{{.Names}}" | head -n1)

    if [ "${DEBUG_HEALTHCHECK:-0}" = "1" ]; then
        echo "[debug] Primary match: ${resolved}" >&2
    fi

    if [ -z "$resolved" ]; then
        resolved=$(docker ps -a --filter "name=${service}" --format "{{.Names}}" | head -n1)
        if [ "${DEBUG_HEALTHCHECK:-0}" = "1" ]; then
            echo "[debug] Fallback match: ${resolved}" >&2
        fi
    fi

    if [ -n "$resolved" ]; then
        echo "$resolved"
    else
        echo "${PROJECT_PREFIX}-${service}-1"
    fi
}

BACKEND_CONTAINER=$(resolve_container_name "$BACKEND_SERVICE")
FRONTEND_CONTAINER=$(resolve_container_name "$FRONTEND_SERVICE")

echo "🏥 Running health checks for $ENVIRONMENT environment..."

# Function to perform health check with exponential backoff
check_service() {
    local service_name=$1
    local url=$2
    local retries=0
    local delay=$RETRY_DELAY
    
    echo "Checking $service_name..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "⏳ Attempt $retries/$MAX_RETRIES failed. Waiting ${delay}s..."
        sleep $delay
        
        # Exponential backoff (2s → 4s → 8s, max 8s)
        delay=$((delay * 2))
        if [ $delay -gt 8 ]; then
            delay=8
        fi
    done
    
    echo "❌ $service_name health check failed after $MAX_RETRIES attempts"
    return 1
}

# Function to check container health
check_container() {
    local container_name=$1
    
    if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "unknown")
        
        if [ "$health_status" = "healthy" ] || [ "$health_status" = "unknown" ]; then
            echo "✅ Container $container_name is running"
            return 0
        else
            echo "⚠️ Container $container_name is running but health status: $health_status"
            return 1
        fi
    else
        echo "❌ Container $container_name is not running"
        return 1
    fi
}

# Check database connectivity
check_database() {
    echo "Checking database connectivity..."
    
    if docker exec "$BACKEND_CONTAINER" python -c "
import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
import django
django.setup()
from django.db import connection
try:
    connection.ensure_connection()
    print('Database connection successful')
    sys.exit(0)
except Exception as e:
    print(f'Database connection failed: {e}')
    sys.exit(1)
" 2>/dev/null; then
        echo "✅ Database is accessible"
        return 0
    else
        echo "❌ Database connection failed"
        return 1
    fi
}

# Check Redis connectivity
check_redis() {
    echo "Checking Redis connectivity..."
    
    if docker exec "$BACKEND_CONTAINER" python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
import django
django.setup()
from django.core.cache import cache
try:
    cache.set('health_check', 'ok', 10)
    result = cache.get('health_check')
    if result == 'ok':
        print('Redis connection successful')
        exit(0)
    else:
        print('Redis connection test failed')
        exit(1)
except Exception as e:
    print(f'Redis connection failed: {e}')
    exit(1)
" 2>/dev/null; then
        echo "✅ Redis is accessible"
        return 0
    else
        echo "❌ Redis connection failed"
        return 1
    fi
}

# Check Celery worker
check_celery() {
    echo "Checking Celery worker..."
    
    local celery_container="${BACKEND_CONTAINER/backend/celery-worker}"
    
    if docker ps --filter "name=$celery_container" --filter "status=running" | grep -q "$celery_container"; then
        echo "✅ Celery worker is running"
        return 0
    else
        echo "⚠️ Celery worker is not running (non-critical)"
        return 0  # Don't fail on celery issues
    fi
}

# Run all checks
FAILED=0

echo ""
echo "════════════════════════════════════════"
echo "  Container Health Checks"
echo "════════════════════════════════════════"
check_container "$BACKEND_CONTAINER" || FAILED=1
check_container "$FRONTEND_CONTAINER" || FAILED=1

echo ""
echo "════════════════════════════════════════"
echo "  HTTP Endpoint Checks"
echo "════════════════════════════════════════"
check_service "Backend" "$BACKEND_URL/health/" || FAILED=1
check_service "Frontend" "$FRONTEND_URL" || FAILED=1

echo ""
echo "════════════════════════════════════════"
echo "  Service Connectivity Checks"
echo "════════════════════════════════════════"
check_database || FAILED=1
check_redis || FAILED=1
check_celery || FAILED=1

echo ""
echo "════════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo "✅ All health checks passed for $ENVIRONMENT!"
    echo "════════════════════════════════════════"
    exit 0
else
    echo "❌ Some health checks failed for $ENVIRONMENT"
    echo "════════════════════════════════════════"
    echo ""
    echo "📋 Recent container logs:"
    echo "Backend:"
    docker logs --tail 20 "$BACKEND_CONTAINER" 2>&1 || echo "Could not fetch backend logs"
    echo ""
    echo "Frontend:"
    docker logs --tail 20 "$FRONTEND_CONTAINER" 2>&1 || echo "Could not fetch frontend logs"
    exit 1
fi
