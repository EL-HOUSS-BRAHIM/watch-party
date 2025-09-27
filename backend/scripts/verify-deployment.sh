#!/bin/bash

# =============================================================================
# DEPLOYMENT VERIFICATION SCRIPT
# =============================================================================
# This script verifies a successful deployment
# Used by GitHub Actions to validate deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"

log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# Configuration
MAX_WAIT_TIME=120  # Maximum time to wait for services (seconds)
HEALTH_CHECK_URL="http://localhost:8000/health/"
ADMIN_URL="http://localhost:8000/admin/"

verify_environment() {
    log_info "Verifying environment configuration..."
    
    # Check if .env file exists
    if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
        log_error "Environment file not found"
        return 1
    fi
    
    # Load environment variables
    source "$PROJECT_ROOT/.env"
    
    # Check critical environment variables
    local required_vars=(
        "SECRET_KEY"
        "DATABASE_URL"
        "ENVIRONMENT"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    log_success "Environment configuration verified"
    return 0
}

verify_database() {
    log_info "Verifying database connection..."
    
    cd "$PROJECT_ROOT"
    
    # Check if manage.py exists
    if [[ ! -f "manage.py" ]]; then
        log_error "manage.py not found"
        return 1
    fi
    
    # Test database connection
    if python manage.py check --database default > /dev/null 2>&1; then
        log_success "Database connection verified"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

verify_static_files() {
    log_info "Verifying static files..."
    
    cd "$PROJECT_ROOT"
    
    # Check if static files were collected
    if [[ -d "staticfiles" ]] && [[ "$(ls -A staticfiles)" ]]; then
        log_success "Static files verified"
        return 0
    else
        log_warning "Static files directory is empty or missing"
        return 1
    fi
}

verify_services() {
    log_info "Verifying system services..."
    
    local services=("watchparty-gunicorn" "watchparty-celery" "watchparty-celery-beat")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_success "Service $service is running"
        else
            log_warning "Service $service is not running"
            failed_services+=("$service")
        fi
    done
    
    # Check nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_success "Nginx is running"
    else
        log_warning "Nginx is not running"
        failed_services+=("nginx")
    fi
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        return 0
    else
        log_warning "Some services are not running: ${failed_services[*]}"
        return 1
    fi
}

verify_application() {
    log_info "Verifying application endpoints..."
    
    local wait_time=0
    local success=false
    
    # Wait for application to start
    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            success=true
            break
        fi
        
        sleep 5
        wait_time=$((wait_time + 5))
        log_info "Waiting for application to start... (${wait_time}s/${MAX_WAIT_TIME}s)"
    done
    
    if [ "$success" = true ]; then
        log_success "Application health check passed"
    else
        log_error "Application health check failed (timeout after ${MAX_WAIT_TIME}s)"
        return 1
    fi
    
    # Test additional endpoints
    local endpoints=(
        "http://localhost:8000/api/"
        "http://localhost:8000/admin/"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s -o /dev/null "$endpoint"; then
            log_success "Endpoint $endpoint is accessible"
        else
            log_warning "Endpoint $endpoint is not accessible"
        fi
    done
    
    return 0
}

verify_logs() {
    log_info "Checking for critical errors in logs..."
    
    local log_files=(
        "/var/log/watchparty/gunicorn.log"
        "/var/log/watchparty/celery.log"
        "$PROJECT_ROOT/logs/django.log"
    )
    
    local errors_found=false
    
    for log_file in "${log_files[@]}"; do
        if [[ -f "$log_file" ]]; then
            # Check for recent critical errors (last 100 lines)
            if tail -n 100 "$log_file" | grep -i "error\|critical\|exception" > /dev/null 2>&1; then
                log_warning "Found errors in $log_file"
                errors_found=true
            else
                log_success "No critical errors in $log_file"
            fi
        else
            log_warning "Log file not found: $log_file"
        fi
    done
    
    if [ "$errors_found" = true ]; then
        return 1
    else
        return 0
    fi
}

verify_permissions() {
    log_info "Verifying file permissions..."
    
    # Check critical directory permissions
    local directories=(
        "$PROJECT_ROOT"
        "$PROJECT_ROOT/staticfiles"
        "$PROJECT_ROOT/media"
        "$PROJECT_ROOT/logs"
    )
    
    for dir in "${directories[@]}"; do
        if [[ -d "$dir" ]]; then
            if [[ -r "$dir" && -w "$dir" ]]; then
                log_success "Permissions OK for $dir"
            else
                log_error "Permission issues with $dir"
                return 1
            fi
        fi
    done
    
    return 0
}

generate_report() {
    local overall_status="$1"
    
    echo
    echo "=========================================="
    echo "     DEPLOYMENT VERIFICATION REPORT"
    echo "=========================================="
    echo "Timestamp: $(date)"
    echo "Project: Watch Party Backend"
    echo "Environment: ${ENVIRONMENT:-unknown}"
    echo
    
    if [ "$overall_status" = "success" ]; then
        echo "✅ OVERALL STATUS: SUCCESSFUL"
        echo
        echo "All verification checks passed!"
        echo "The application is ready for use."
    else
        echo "❌ OVERALL STATUS: FAILED"
        echo
        echo "Some verification checks failed."
        echo "Please review the logs and fix issues before proceeding."
    fi
    
    echo
    echo "=========================================="
}

main() {
    echo "🔍 Starting deployment verification..."
    echo
    
    local checks=(
        "verify_environment"
        "verify_permissions" 
        "verify_database"
        "verify_static_files"
        "verify_services"
        "verify_application"
        "verify_logs"
    )
    
    local failed_checks=()
    
    for check in "${checks[@]}"; do
        if ! $check; then
            failed_checks+=("$check")
        fi
        echo
    done
    
    if [ ${#failed_checks[@]} -eq 0 ]; then
        generate_report "success"
        exit 0
    else
        generate_report "failed"
        echo "Failed checks: ${failed_checks[*]}"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --environment)
        verify_environment
        ;;
    --database)
        verify_database
        ;;
    --services)
        verify_services
        ;;
    --application)
        verify_application
        ;;
    --logs)
        verify_logs
        ;;
    --permissions)
        verify_permissions
        ;;
    --help|-h)
        echo "Deployment Verification Script"
        echo
        echo "Usage: $0 [option]"
        echo
        echo "Options:"
        echo "  --environment    Verify environment configuration"
        echo "  --database       Verify database connection"
        echo "  --services       Verify system services"
        echo "  --application    Verify application endpoints"
        echo "  --logs           Check for critical errors in logs"
        echo "  --permissions    Verify file permissions"
        echo "  (no option)      Run all verification checks"
        ;;
    *)
        main
        ;;
esac
