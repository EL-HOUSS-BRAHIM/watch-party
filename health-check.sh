#!/bin/bash

# Watch Party Health Check Script
# Verifies that all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://be-watch-party.brahim-elhouss.me"
FRONTEND_URL="https://watch-party.brahim-elhouss.me"

# Load dynamic port configuration
load_port_config() {
    local config_file="/home/ubuntu/watch-party/.port-config"
    if [ -f "$config_file" ]; then
        source "$config_file"
        LOCAL_BACKEND="http://localhost:${BACKEND_PORT:-8000}"
        LOCAL_FRONTEND="http://localhost:${FRONTEND_PORT:-3000}"
    else
        # Fallback to default ports
        LOCAL_BACKEND="http://localhost:8000"
        LOCAL_FRONTEND="http://localhost:3000"
    fi
}

# Load port configuration
load_port_config

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}==================== $1 ====================${NC}"
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" | grep -q "$expected_code"; then
        print_status "$name is responding (HTTP $expected_code)"
        return 0
    else
        print_error "$name is not responding or returned unexpected status"
        return 1
    fi
}

# Function to check service status
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet "$service"; then
        print_status "$name service is running"
        return 0
    else
        print_error "$name service is not running"
        return 1
    fi
}

# Function to check PM2 process
check_pm2_process() {
    local process_name=$1
    local display_name=$2
    
    if pm2 jlist | jq -r '.[].name' | grep -q "^$process_name$"; then
        local status=$(pm2 jlist | jq -r ".[] | select(.name==\"$process_name\") | .pm2_env.status")
        if [ "$status" = "online" ]; then
            print_status "$display_name (PM2) is running"
            return 0
        else
            print_error "$display_name (PM2) is $status"
            return 1
        fi
    else
        print_error "$display_name (PM2) process not found"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    local port=$1
    local password=$2
    local name=$3
    
    if redis-cli -p "$port" -a "$password" ping 2>/dev/null | grep -q "PONG"; then
        print_status "$name is responding"
        return 0
    else
        print_error "$name is not responding"
        return 1
    fi
}

# Function to check WebSocket connection
check_websocket() {
    local url=$1
    local name=$2
    local timeout=${3:-5}
    
    print_info "Testing WebSocket connection to $name..."
    
    # First check if wscat is available
    if command -v wscat &> /dev/null; then
        # Use wscat for proper WebSocket testing
        if timeout "$timeout" wscat -c "$url" -x 'exit' 2>/dev/null; then
            print_status "$name WebSocket connection successful"
            return 0
        fi
    fi
    
    # Fallback to HTTP upgrade test using curl
    if curl -s -I -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" "$url" | grep -q "101 Switching Protocols"; then
        print_status "$name WebSocket upgrade headers supported"
        return 0
    fi
    
    print_error "$name WebSocket connection failed"
    return 1
}

# Main health check function
main() {
    print_section "WATCH PARTY HEALTH CHECK"
    
    local errors=0
    
    print_section "SYSTEM SERVICES"
    check_service "nginx" "Nginx" || ((errors++))
    check_service "redis-watchparty" "Redis (Watch Party)" || ((errors++))
    
    print_section "PM2 PROCESSES"
    check_pm2_process "watch-party-backend" "Django Backend" || ((errors++))
    check_pm2_process "watch-party-frontend" "Next.js Frontend" || ((errors++))
    check_pm2_process "watch-party-celery-worker" "Celery Worker" || ((errors++))
    check_pm2_process "watch-party-celery-beat" "Celery Beat" || ((errors++))
    
    print_section "REDIS CONNECTIONS"
    check_redis "6380" "watchparty_redis_2025" "Redis (Watch Party)" || ((errors++))
    
    print_section "LOCAL ENDPOINTS"
    check_http "$LOCAL_BACKEND/health/" "Backend Health Check" || ((errors++))
    check_http "$LOCAL_FRONTEND/" "Frontend Homepage" || ((errors++))
    
    print_section "PUBLIC ENDPOINTS"
    check_http "$BACKEND_URL/health/" "Backend Public Health Check" || ((errors++))
    check_http "$FRONTEND_URL/" "Frontend Public Homepage" || ((errors++))
    
    print_section "API ENDPOINTS"
    check_http "$BACKEND_URL/api/" "Backend API Root" || ((errors++))
    check_http "$BACKEND_URL/admin/" "Django Admin" || ((errors++))
    
    print_section "WEBSOCKET CONNECTIONS"
    # Check backend WebSocket endpoint
    local ws_backend_url="wss://be-watch-party.brahim-elhouss.me/ws/"
    check_websocket "$ws_backend_url" "Backend WebSocket" || ((errors++))
    
    # Check if frontend supports WebSocket upgrade (for Next.js HMR)
    local ws_frontend_url="wss://watch-party.brahim-elhouss.me"
    check_websocket "$ws_frontend_url" "Frontend WebSocket" || print_warning "Frontend WebSocket support test inconclusive"
    
    print_section "SSL CERTIFICATES"
    if command -v openssl &> /dev/null; then
        for domain in "be-watch-party.brahim-elhouss.me" "watch-party.brahim-elhouss.me"; do
            if echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | grep -q "Verify return code: 0"; then
                print_status "SSL certificate for $domain is valid"
            else
                print_error "SSL certificate for $domain is invalid or not found"
                ((errors++))
            fi
        done
    else
        print_warning "OpenSSL not found, skipping SSL certificate check"
    fi
    
    print_section "DISK USAGE"
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        print_status "Disk usage: ${disk_usage}% (healthy)"
    elif [ "$disk_usage" -lt 90 ]; then
        print_warning "Disk usage: ${disk_usage}% (moderate)"
    else
        print_error "Disk usage: ${disk_usage}% (critical)"
        ((errors++))
    fi
    
    print_section "MEMORY USAGE"
    local mem_usage=$(free | awk 'FNR==2{printf "%.0f", $3/($3+$4)*100}')
    if [ "$mem_usage" -lt 80 ]; then
        print_status "Memory usage: ${mem_usage}% (healthy)"
    elif [ "$mem_usage" -lt 90 ]; then
        print_warning "Memory usage: ${mem_usage}% (moderate)"
    else
        print_error "Memory usage: ${mem_usage}% (high)"
    fi
    
    print_section "SUMMARY"
    if [ $errors -eq 0 ]; then
        print_status "All health checks passed! 🎉"
        print_info "Frontend: $FRONTEND_URL"
        print_info "Backend:  $BACKEND_URL"
        print_info "Admin:    $BACKEND_URL/admin/"
        exit 0
    else
        print_error "$errors health check(s) failed! ❌"
        print_info "Check the logs with: watch-party logs [service]"
        print_info "Check service status with: watch-party status"
        exit 1
    fi
}

# Check if required commands exist
check_requirements() {
    local missing=()
    
    for cmd in curl systemctl pm2 redis-cli jq wscat nc; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_error "Missing required commands: ${missing[*]}"
        print_info "Please install the missing commands and try again"
        print_info "To install wscat: npm install -g wscat"
        exit 1
    fi
}

# Parse command line arguments
case "${1:-check}" in
    check)
        check_requirements
        main
        ;;
    quick)
        print_section "QUICK HEALTH CHECK"
        check_http "$LOCAL_BACKEND/health/" "Backend" && \
        check_http "$LOCAL_FRONTEND/" "Frontend" && \
        print_status "Quick health check passed! ✅" || \
        print_error "Quick health check failed! ❌"
        ;;
    services)
        print_section "SERVICE STATUS"
        check_service "nginx" "Nginx"
        check_service "redis-watchparty" "Redis"
        pm2 list
        ;;
    urls)
        print_section "APPLICATION URLS"
        print_info "Frontend: $FRONTEND_URL"
        print_info "Backend:  $BACKEND_URL"
        print_info "API:      $BACKEND_URL/api/"
        print_info "Admin:    $BACKEND_URL/admin/"
        print_info "Health:   $BACKEND_URL/health/"
        print_info "WebSocket: wss://be-watch-party.brahim-elhouss.me/ws/"
        ;;
    websocket)
        print_section "WEBSOCKET TESTS"
        check_websocket "wss://be-watch-party.brahim-elhouss.me/ws/" "Backend WebSocket"
        check_websocket "wss://watch-party.brahim-elhouss.me" "Frontend WebSocket"
        ;;
    *)
        echo "Usage: $0 {check|quick|services|urls|websocket}"
        echo ""
        echo "Commands:"
        echo "  check     - Complete health check (default)"
        echo "  quick     - Quick health check of main endpoints"
        echo "  services  - Check system services status"
        echo "  urls      - Show application URLs"
        echo "  websocket - Test WebSocket connections"
        echo "  services  - Check system services status"
        echo "  urls      - Display application URLs"
        exit 1
        ;;
esac
