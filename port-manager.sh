#!/bin/bash

# Watch Party Port Management Script
# Manages port configuration and conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/home/ubuntu/watch-party"
CONFIG_FILE="$PROJECT_ROOT/.port-config"
DEFAULT_BACKEND_PORT=8000
DEFAULT_FRONTEND_PORT=3000

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

# Function to check if a port is available
is_port_available() {
    local port=$1
    if command -v netstat &> /dev/null; then
        ! netstat -tuln | grep -q ":$port "
    elif command -v ss &> /dev/null; then
        ! ss -tuln | grep -q ":$port "
    else
        # Fallback: try to bind to the port
        ! nc -z localhost "$port" 2>/dev/null
    fi
}

# Function to get process using a port
get_port_process() {
    local port=$1
    if command -v netstat &> /dev/null; then
        netstat -tulnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f2
    elif command -v ss &> /dev/null; then
        ss -tulnp 2>/dev/null | grep ":$port " | awk '{print $6}' | cut -d'"' -f2
    else
        echo "unknown"
    fi
}

# Load current port configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    else
        BACKEND_PORT=$DEFAULT_BACKEND_PORT
        FRONTEND_PORT=$DEFAULT_FRONTEND_PORT
    fi
}

# Save port configuration
save_config() {
    cat > "$CONFIG_FILE" << EOF
# Watch Party Port Configuration
# Generated on $(date)
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
REDIS_PORT=6380
EOF
}

# Check current port status
check_ports() {
    print_section "PORT STATUS CHECK"
    
    load_config
    
    print_info "Current configuration:"
    print_info "  Backend:  $BACKEND_PORT"
    print_info "  Frontend: $FRONTEND_PORT"
    print_info "  Redis:    6380"
    echo ""
    
    local issues=0
    
    # Check backend port
    if is_port_available "$BACKEND_PORT"; then
        print_status "Backend port $BACKEND_PORT is available"
    else
        print_error "Backend port $BACKEND_PORT is in use"
        local process=$(get_port_process "$BACKEND_PORT")
        echo "  Process: $process"
        ((issues++))
    fi
    
    # Check frontend port
    if is_port_available "$FRONTEND_PORT"; then
        print_status "Frontend port $FRONTEND_PORT is available"
    else
        print_error "Frontend port $FRONTEND_PORT is in use"
        local process=$(get_port_process "$FRONTEND_PORT")
        echo "  Process: $process"
        ((issues++))
    fi
    
    # Check Redis port (always 6380 for Watch Party)
    if is_port_available "6380"; then
        print_status "Redis port 6380 is available"
    else
        print_warning "Redis port 6380 is in use (may be Watch Party Redis)"
        local process=$(get_port_process "6380")
        echo "  Process: $process"
    fi
    
    if [ $issues -eq 0 ]; then
        print_status "All ports are available! ✅"
        return 0
    else
        print_error "$issues port conflict(s) detected! ❌"
        return 1
    fi
}

# Find alternative ports
find_alternatives() {
    print_section "FINDING ALTERNATIVE PORTS"
    
    load_config
    
    local new_backend=$BACKEND_PORT
    local new_frontend=$FRONTEND_PORT
    local changes=0
    
    # Check backend port
    if ! is_port_available "$BACKEND_PORT"; then
        print_warning "Backend port $BACKEND_PORT is in use, finding alternative..."
        for port in $(seq 8001 8100); do
            if is_port_available "$port"; then
                new_backend=$port
                print_status "Alternative backend port found: $port"
                ((changes++))
                break
            fi
        done
    fi
    
    # Check frontend port
    if ! is_port_available "$FRONTEND_PORT"; then
        print_warning "Frontend port $FRONTEND_PORT is in use, finding alternative..."
        for port in $(seq 3001 3100); do
            if is_port_available "$port"; then
                new_frontend=$port
                print_status "Alternative frontend port found: $port"
                ((changes++))
                break
            fi
        done
    fi
    
    if [ $changes -gt 0 ]; then
        echo ""
        print_info "Proposed new configuration:"
        print_info "  Backend:  $BACKEND_PORT → $new_backend"
        print_info "  Frontend: $FRONTEND_PORT → $new_frontend"
        echo ""
        echo "Apply these changes? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            BACKEND_PORT=$new_backend
            FRONTEND_PORT=$new_frontend
            save_config
            print_status "Port configuration updated!"
            print_warning "You'll need to restart services for changes to take effect:"
            print_info "  watch-party restart"
        else
            print_info "No changes made"
        fi
    else
        print_status "No port conflicts found"
    fi
}

# Set specific ports
set_ports() {
    local backend_port=$1
    local frontend_port=$2
    
    if [ -z "$backend_port" ] || [ -z "$frontend_port" ]; then
        print_error "Please provide both backend and frontend ports"
        echo "Usage: $0 set <backend_port> <frontend_port>"
        exit 1
    fi
    
    print_section "SETTING CUSTOM PORTS"
    
    # Validate ports
    if ! [[ "$backend_port" =~ ^[0-9]+$ ]] || [ "$backend_port" -lt 1024 ] || [ "$backend_port" -gt 65535 ]; then
        print_error "Invalid backend port: $backend_port (must be 1024-65535)"
        exit 1
    fi
    
    if ! [[ "$frontend_port" =~ ^[0-9]+$ ]] || [ "$frontend_port" -lt 1024 ] || [ "$frontend_port" -gt 65535 ]; then
        print_error "Invalid frontend port: $frontend_port (must be 1024-65535)"
        exit 1
    fi
    
    # Check availability
    local issues=0
    if ! is_port_available "$backend_port"; then
        print_error "Backend port $backend_port is already in use"
        local process=$(get_port_process "$backend_port")
        echo "  Process: $process"
        ((issues++))
    fi
    
    if ! is_port_available "$frontend_port"; then
        print_error "Frontend port $frontend_port is already in use"
        local process=$(get_port_process "$frontend_port")
        echo "  Process: $process"
        ((issues++))
    fi
    
    if [ $issues -gt 0 ]; then
        print_error "Cannot set ports due to conflicts"
        exit 1
    fi
    
    # Save configuration
    BACKEND_PORT=$backend_port
    FRONTEND_PORT=$frontend_port
    save_config
    
    print_status "Port configuration updated!"
    print_info "  Backend:  $BACKEND_PORT"
    print_info "  Frontend: $FRONTEND_PORT"
    print_warning "Restart services for changes to take effect: watch-party restart"
}

# Show port usage
show_usage() {
    print_section "SYSTEM PORT USAGE"
    
    print_info "Watch Party services:"
    load_config
    echo "  Backend:  $BACKEND_PORT"
    echo "  Frontend: $FRONTEND_PORT"
    echo "  Redis:    6380"
    echo ""
    
    print_info "All listening ports:"
    if command -v netstat &> /dev/null; then
        netstat -tuln | grep LISTEN | sort -k4 -V
    elif command -v ss &> /dev/null; then
        ss -tuln | grep LISTEN | sort
    else
        print_warning "netstat/ss not available"
    fi
}

# Reset to defaults
reset_ports() {
    print_section "RESETTING TO DEFAULT PORTS"
    
    print_info "Current ports will be reset to:"
    print_info "  Backend:  $DEFAULT_BACKEND_PORT"
    print_info "  Frontend: $DEFAULT_FRONTEND_PORT"
    echo ""
    echo "Continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        BACKEND_PORT=$DEFAULT_BACKEND_PORT
        FRONTEND_PORT=$DEFAULT_FRONTEND_PORT
        save_config
        print_status "Ports reset to defaults"
        print_warning "Restart services: watch-party restart"
    else
        print_info "Reset cancelled"
    fi
}

# Main function
main() {
    case "${1:-status}" in
        status|check)
            check_ports
            ;;
        find|alternatives)
            find_alternatives
            ;;
        set)
            set_ports "$2" "$3"
            ;;
        usage|list)
            show_usage
            ;;
        reset)
            reset_ports
            ;;
        *)
            echo "Watch Party Port Management"
            echo ""
            echo "Usage: $0 {status|find|set|usage|reset}"
            echo ""
            echo "Commands:"
            echo "  status              - Check current port status (default)"
            echo "  find                - Find alternative ports for conflicts"
            echo "  set <back> <front>  - Set specific backend and frontend ports"
            echo "  usage               - Show system port usage"
            echo "  reset               - Reset to default ports (8000, 3000)"
            echo ""
            echo "Environment variables:"
            echo "  WATCH_PARTY_BACKEND_PORT  - Override default backend port"
            echo "  WATCH_PARTY_FRONTEND_PORT - Override default frontend port"
            echo ""
            echo "Examples:"
            echo "  $0 status           # Check current port status"
            echo "  $0 find             # Find alternatives for conflicts"
            echo "  $0 set 8080 3001    # Set custom ports"
            echo "  $0 usage            # Show all listening ports"
            exit 1
            ;;
    esac
}

# Ensure we're in the right directory
if [ ! -d "/home/ubuntu/watch-party" ] && [ "$(pwd)" != "/home/bross/Desktop/watch-party" ]; then
    # Try to find project root
    if [ -d "/home/bross/Desktop/watch-party" ]; then
        PROJECT_ROOT="/home/bross/Desktop/watch-party"
        CONFIG_FILE="$PROJECT_ROOT/.port-config"
    else
        print_warning "Project directory not found, using current directory"
        PROJECT_ROOT="$(pwd)"
        CONFIG_FILE="$PROJECT_ROOT/.port-config"
    fi
fi

# Run main function
main "$@"
