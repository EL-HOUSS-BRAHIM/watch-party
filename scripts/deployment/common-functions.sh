#!/bin/bash

# =============================================================================
# COMMON DEPLOYMENT FUNCTIONS
# =============================================================================
# Shared utility functions used across deployment scripts

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

# Logging functions
log_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

log_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Error exit function
exit_with_error() {
    log_error "$1"
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service to be ready
wait_for_service() {
    local service_name="$1"
    local health_check_cmd="$2"
    local max_attempts="${3:-30}"
    local sleep_interval="${4:-3}"
    
    log_info "Waiting for $service_name to be ready..."
    
    for i in $(seq 1 $max_attempts); do
        if eval "$health_check_cmd" > /dev/null 2>&1; then
            log_success "$service_name is ready"
            return 0
        fi
        
        if [ $i -eq $max_attempts ]; then
            log_error "$service_name failed to start after $((max_attempts * sleep_interval)) seconds"
            return 1
        fi
        
        echo "  ⏳ Waiting for $service_name... ($i/$max_attempts)"
        sleep $sleep_interval
    done
    
    return 1
}
