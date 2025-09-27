#!/bin/bash

# Gunicorn Service Diagnostic Script
# This script helps diagnose issues with the Gunicorn service

set -euo pipefail

# Configuration
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/watch-party-backend}"
SERVICE_NAME="watchparty-gunicorn"
SERVICE_USER="${SERVICE_USER:-www-data}"
LOG_DIR="/var/log/watchparty"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_section() {
    echo
    echo "======================================"
    echo "$1"
    echo "======================================"
}

check_system_resources() {
    print_section "System Resources"
    
    log_info "Memory usage:"
    free -h
    
    log_info "Disk space:"
    df -h "$DEPLOY_DIR" 2>/dev/null || df -h /
    
    log_info "CPU load:"
    uptime
    
    log_info "Open file limits:"
    echo "Current ulimit: $(ulimit -n)"
    echo "System limits: $(cat /proc/sys/fs/file-max 2>/dev/null || echo 'Unable to read')"
    
    # Check for OOM kills
    if dmesg | grep -i "killed process" | tail -5 | grep -q .; then
        log_warning "Recent OOM kills detected:"
        dmesg | grep -i "killed process" | tail -5
    else
        log_success "No recent OOM kills detected"
    fi
}

check_port_conflicts() {
    print_section "Port Analysis"
    
    log_info "Checking port 8000 usage:"
    if ss -tlnp | grep :8000; then
        log_warning "Port 8000 is in use"
        lsof -i :8000 2>/dev/null || true
    else
        log_success "Port 8000 is available"
    fi
    
    log_info "All listening ports:"
    ss -tlnp | head -10
}

check_service_status() {
    print_section "Service Status"
    
    log_info "Systemd service status:"
    systemctl status "$SERVICE_NAME" --no-pager -l || true
    
    log_info "Service logs (last 50 lines):"
    journalctl -u "$SERVICE_NAME" --no-pager -n 50 || true
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "Service is active"
        
        # Get PID and process info
        PID=$(systemctl show "$SERVICE_NAME" --property=MainPID --value)
        if [[ "$PID" != "0" ]]; then
            log_info "Main process PID: $PID"
            ps -p "$PID" -o pid,ppid,user,cmd || true
            
            # Check process limits
            if [[ -f "/proc/$PID/limits" ]]; then
                log_info "Process limits:"
                grep -E "(Max open files|Max processes)" "/proc/$PID/limits" || true
            fi
        fi
    else
        log_error "Service is not active"
    fi
}

check_application_files() {
    print_section "Application Files"
    
    log_info "Checking critical files:"
    
    # Check deployment directory
    if [[ -d "$DEPLOY_DIR" ]]; then
        log_success "Deploy directory exists: $DEPLOY_DIR"
        ls -la "$DEPLOY_DIR" | head -10
    else
        log_error "Deploy directory missing: $DEPLOY_DIR"
        return 1
    fi
    
    # Check .env file
    if [[ -f "$DEPLOY_DIR/.env" ]]; then
        log_success ".env file exists"
        log_info "Environment file permissions:"
        ls -l "$DEPLOY_DIR/.env"
    else
        log_error ".env file missing"
    fi
    
    # Check virtual environment
    if [[ -d "$DEPLOY_DIR/venv" ]]; then
        log_success "Virtual environment exists"
        
        if [[ -f "$DEPLOY_DIR/venv/bin/gunicorn" ]]; then
            log_success "Gunicorn binary found"
            "$DEPLOY_DIR/venv/bin/gunicorn" --version || true
        else
            log_error "Gunicorn binary missing"
        fi
        
        # Check venv permissions
        log_info "Virtual environment permissions:"
        ls -ld "$DEPLOY_DIR/venv"
        ls -ld "$DEPLOY_DIR/venv/bin" 2>/dev/null || true
    else
        log_error "Virtual environment missing"
    fi
    
    # Check WSGI file
    if [[ -f "$DEPLOY_DIR/watchparty/wsgi.py" ]]; then
        log_success "WSGI file exists"
    else
        log_error "WSGI file missing"
    fi
}

check_permissions() {
    print_section "Permissions Analysis"
    
    log_info "Deployment directory ownership:"
    ls -ld "$DEPLOY_DIR"
    
    log_info "Key file permissions:"
    if [[ -f "$DEPLOY_DIR/.env" ]]; then
        ls -l "$DEPLOY_DIR/.env"
    fi
    
    if [[ -d "$DEPLOY_DIR/venv" ]]; then
        ls -ld "$DEPLOY_DIR/venv"
        ls -l "$DEPLOY_DIR/venv/bin/gunicorn" 2>/dev/null || true
    fi
    
    # Check if service user can access files
    log_info "Testing service user access:"
    if sudo -u "$SERVICE_USER" test -r "$DEPLOY_DIR/.env" 2>/dev/null; then
        log_success "Service user can read .env file"
    else
        log_error "Service user cannot read .env file"
    fi
    
    if sudo -u "$SERVICE_USER" test -x "$DEPLOY_DIR/venv/bin/gunicorn" 2>/dev/null; then
        log_success "Service user can execute Gunicorn"
    else
        log_error "Service user cannot execute Gunicorn"
    fi
}

check_logs() {
    print_section "Application Logs"
    
    log_info "Log directory structure:"
    ls -la "$LOG_DIR" 2>/dev/null || log_warning "Log directory $LOG_DIR does not exist"
    
    # Check recent logs
    for logfile in "django.log" "django_errors.log" "access.log" "error.log"; do
        logpath="$LOG_DIR/$logfile"
        if [[ -f "$logpath" ]]; then
            log_info "Recent entries from $logfile:"
            tail -10 "$logpath" 2>/dev/null || log_warning "Cannot read $logpath"
        else
            log_warning "Log file missing: $logpath"
        fi
        echo
    done
    
    # Check project-level logs
    if [[ -d "$DEPLOY_DIR/logs" ]]; then
        log_info "Project-level logs:"
        ls -la "$DEPLOY_DIR/logs"
        
        if [[ -f "$DEPLOY_DIR/logs/django.log" ]]; then
            log_info "Recent project Django log entries:"
            tail -5 "$DEPLOY_DIR/logs/django.log" 2>/dev/null || true
        fi
    fi
}

test_python_environment() {
    print_section "Python Environment Test"
    
    log_info "Testing Python environment as service user:"
    
    if sudo -u "$SERVICE_USER" bash -c "cd '$DEPLOY_DIR' && source venv/bin/activate && python -c 'print(\"Python test successful\")'" 2>/dev/null; then
        log_success "Python environment works"
    else
        log_error "Python environment test failed"
        return 1
    fi
    
    log_info "Testing Django import:"
    if sudo -u "$SERVICE_USER" bash -c "cd '$DEPLOY_DIR' && source venv/bin/activate && python -c 'import django; print(f\"Django {django.get_version()}\")'" 2>/dev/null; then
        log_success "Django import works"
    else
        log_error "Django import failed"
    fi
    
    log_info "Testing Django settings:"
    if sudo -u "$SERVICE_USER" bash -c "cd '$DEPLOY_DIR' && source venv/bin/activate && python manage.py check --deploy" 2>/dev/null; then
        log_success "Django configuration is valid"
    else
        log_warning "Django configuration check failed (may not be critical)"
    fi
    
    log_info "Testing Gunicorn import:"
    if sudo -u "$SERVICE_USER" bash -c "cd '$DEPLOY_DIR' && source venv/bin/activate && python -c 'import gunicorn; print(f\"Gunicorn {gunicorn.__version__}\")'" 2>/dev/null; then
        log_success "Gunicorn import works"
    else
        log_error "Gunicorn import failed"
    fi
}

run_manual_test() {
    print_section "Manual Service Test"
    
    log_info "Attempting to run Gunicorn manually..."
    
    # Stop the service if running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "Stopping systemd service for manual test..."
        sudo systemctl stop "$SERVICE_NAME"
        sleep 2
    fi
    
    log_info "Running Gunicorn manually (will timeout after 30 seconds)..."
    
    timeout 30 sudo -u "$SERVICE_USER" bash -c "
        cd '$DEPLOY_DIR'
        source venv/bin/activate
        exec gunicorn \
            --bind 127.0.0.1:8001 \
            --workers 1 \
            --worker-class gevent \
            --timeout 30 \
            --access-logfile /dev/stdout \
            --error-logfile /dev/stderr \
            --log-level debug \
            watchparty.wsgi:application
    " || log_info "Manual test completed (timeout or error expected)"
    
    log_info "Manual test finished. Check output above for errors."
}

show_recommendations() {
    print_section "Recommendations"
    
    echo "Based on the diagnosis, try these solutions:"
    echo
    echo "1. 🔧 Fix permissions:"
    echo "   sudo chown -R $SERVICE_USER:www-data $DEPLOY_DIR"
    echo "   sudo chmod -R u+rwX $DEPLOY_DIR/venv"
    echo
    echo "2. 📁 Recreate logs:"
    echo "   sudo mkdir -p $LOG_DIR"
    echo "   sudo touch $LOG_DIR/{django.log,access.log,error.log}"
    echo "   sudo chown -R $SERVICE_USER:www-data $LOG_DIR"
    echo "   sudo chmod 664 $LOG_DIR/*.log"
    echo
    echo "3. 🔄 Restart service:"
    echo "   sudo systemctl daemon-reload"
    echo "   sudo systemctl restart $SERVICE_NAME"
    echo
    echo "4. 🐍 Recreate virtual environment:"
    echo "   cd $DEPLOY_DIR"
    echo "   sudo rm -rf venv"
    echo "   sudo -u $SERVICE_USER python3 -m venv venv"
    echo "   sudo -u $SERVICE_USER venv/bin/pip install -r requirements.txt"
    echo "   sudo -u $SERVICE_USER venv/bin/pip install gunicorn gevent"
    echo
    echo "5. 📋 Check logs in real-time:"
    echo "   sudo journalctl -u $SERVICE_NAME -f"
    echo
    echo "6. 🌐 Test connectivity:"
    echo "   curl -v http://127.0.0.1:8000/health/"
}

# Main execution
main() {
    echo "Gunicorn Service Diagnostic Tool"
    echo "================================"
    echo "Service: $SERVICE_NAME"
    echo "Deploy Dir: $DEPLOY_DIR"
    echo "Service User: $SERVICE_USER"
    echo "Log Dir: $LOG_DIR"
    echo
    
    check_system_resources
    check_port_conflicts
    check_service_status
    check_application_files
    check_permissions
    check_logs
    test_python_environment
    
    # Ask if user wants to run manual test
    if [[ "${1:-}" == "--manual-test" ]]; then
        run_manual_test
    fi
    
    show_recommendations
    
    echo
    log_info "Diagnosis complete. Review the output above for issues."
    echo "Run with --manual-test to attempt a manual Gunicorn start."
}

# Check if running as root (required for systemctl and log access)
if [[ $EUID -ne 0 ]]; then
    echo "This script requires root privileges. Please run with sudo."
    exit 1
fi

main "$@"
