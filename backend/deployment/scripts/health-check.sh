#!/bin/bash
set -euo pipefail

# Watch Party Backend - Health Check Script
# Monitors application health and sends alerts if needed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DOMAIN="${1:-be-watch-party.brahim-elhouss.me}"
PROJECT_DIR="/opt/watch-party-backend"
LOG_FILE="/var/log/watchparty/health-check.log"

# Create log entry
log_entry() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_info "Starting health check for Watch Party Backend..."

# Health status
OVERALL_HEALTH="HEALTHY"
ISSUES=()

# Check 1: PM2 processes
log_info "Checking PM2 processes..."
PM2_STATUS=$(pm2 jlist)
EXPECTED_PROCESSES=("watchparty-django" "watchparty-daphne" "watchparty-celery-worker" "watchparty-celery-beat")

for process in "${EXPECTED_PROCESSES[@]}"; do
    if echo "$PM2_STATUS" | jq -e ".[] | select(.name == \"$process\" and .pm2_env.status == \"online\")" > /dev/null; then
        log_success "✓ $process is running"
        log_entry "OK: $process is running"
    else
        log_error "✗ $process is not running or unhealthy"
        log_entry "ERROR: $process is not running"
        OVERALL_HEALTH="UNHEALTHY"
        ISSUES+=("$process not running")
    fi
done

# Check 2: HTTP endpoints
log_info "Checking HTTP endpoints..."

# Django backend
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 http://127.0.0.1:8000/ || echo "000")
if [ "$HTTP_STATUS" == "200" ]; then
    log_success "✓ Django backend responding (HTTP $HTTP_STATUS)"
    log_entry "OK: Django backend responding"
else
    log_error "✗ Django backend not responding (HTTP $HTTP_STATUS)"
    log_entry "ERROR: Django backend not responding (HTTP $HTTP_STATUS)"
    OVERALL_HEALTH="UNHEALTHY"
    ISSUES+=("Django backend not responding")
fi

# External HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "https://$DOMAIN/" || echo "000")
if [ "$HTTPS_STATUS" == "200" ]; then
    log_success "✓ External HTTPS responding (HTTP $HTTPS_STATUS)"
    log_entry "OK: External HTTPS responding"
else
    log_warning "⚠ External HTTPS not responding (HTTP $HTTPS_STATUS)"
    log_entry "WARNING: External HTTPS not responding (HTTP $HTTPS_STATUS)"
    # Don't mark as unhealthy since this could be temporary
fi

# Check 3: Database connectivity
log_info "Checking database connectivity..."
cd "$PROJECT_DIR"
source venv/bin/activate
set -a && source .env && set +a

DB_CHECK=$(python -c "
import os
import sys
try:
    import psycopg2
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    cursor.execute('SELECT 1')
    cursor.fetchone()
    cursor.close()
    conn.close()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
" 2>/dev/null || echo "ERROR: Database connection failed")

if [ "$DB_CHECK" == "OK" ]; then
    log_success "✓ Database connectivity OK"
    log_entry "OK: Database connectivity"
else
    log_error "✗ Database connectivity failed"
    log_entry "ERROR: Database connectivity failed"
    OVERALL_HEALTH="UNHEALTHY"
    ISSUES+=("Database connectivity failed")
fi

# Check 4: Redis/Valkey connectivity
log_info "Checking Redis/Valkey connectivity..."
REDIS_CHECK=$(python -c "
import redis
import os
try:
    r = redis.from_url(os.environ['REDIS_URL'])
    r.ping()
    print('OK')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null || echo "ERROR: Redis connection failed")

if [ "$REDIS_CHECK" == "OK" ]; then
    log_success "✓ Redis/Valkey connectivity OK"
    log_entry "OK: Redis/Valkey connectivity"
else
    log_error "✗ Redis/Valkey connectivity failed"
    log_entry "ERROR: Redis/Valkey connectivity failed"
    OVERALL_HEALTH="UNHEALTHY"
    ISSUES+=("Redis/Valkey connectivity failed")
fi

# Check 5: System resources
log_info "Checking system resources..."

# Memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3/$2*100}')
if [ "$MEM_USAGE" -lt 90 ]; then
    log_success "✓ Memory usage OK ($MEM_USAGE%)"
    log_entry "OK: Memory usage $MEM_USAGE%"
else
    log_warning "⚠ High memory usage ($MEM_USAGE%)"
    log_entry "WARNING: High memory usage $MEM_USAGE%"
fi

# Disk usage
DISK_USAGE=$(df / | awk 'NR==2{printf "%.0f", $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 85 ]; then
    log_success "✓ Disk usage OK ($DISK_USAGE%)"
    log_entry "OK: Disk usage $DISK_USAGE%"
else
    log_warning "⚠ High disk usage ($DISK_USAGE%)"
    log_entry "WARNING: High disk usage $DISK_USAGE%"
fi

# Load average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_THRESHOLD="3.0"
if (( $(echo "$LOAD_AVG < $LOAD_THRESHOLD" | bc -l) )); then
    log_success "✓ Load average OK ($LOAD_AVG)"
    log_entry "OK: Load average $LOAD_AVG"
else
    log_warning "⚠ High load average ($LOAD_AVG)"
    log_entry "WARNING: High load average $LOAD_AVG"
fi

# Final status
log_info "=== HEALTH CHECK SUMMARY ==="
if [ "$OVERALL_HEALTH" == "HEALTHY" ]; then
    log_success "🎉 Overall Status: HEALTHY"
    log_entry "SUMMARY: HEALTHY"
    exit 0
else
    log_error "🚨 Overall Status: UNHEALTHY"
    log_error "Issues found:"
    for issue in "${ISSUES[@]}"; do
        log_error "  - $issue"
    done
    log_entry "SUMMARY: UNHEALTHY - ${ISSUES[*]}"
    exit 1
fi