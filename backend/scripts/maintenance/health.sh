#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - HEALTH MONITORING SCRIPT
# =============================================================================
# System health checks and monitoring

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Change to project root
cd "$PROJECT_ROOT"

# Check system dependencies
check_system_deps() {
    log_info "Checking system dependencies..."
    
    local deps=("python3" "pip" "git")
    local optional_deps=("redis-cli" "psql" "nginx")
    
    echo "Required dependencies:"
    for dep in "${deps[@]}"; do
        if command -v "$dep" &> /dev/null; then
            log_success "$dep: $(command -v "$dep")"
        else
            log_error "$dep: Not found"
        fi
    done
    
    echo
    echo "Optional dependencies:"
    for dep in "${optional_deps[@]}"; do
        if command -v "$dep" &> /dev/null; then
            log_success "$dep: $(command -v "$dep")"
        else
            log_warning "$dep: Not found"
        fi
    done
}

# Check Python environment
check_python_env() {
    log_info "Checking Python environment..."
    
    # Python version
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version)
        log_success "Python: $python_version"
    else
        log_error "Python 3 not found"
        return 1
    fi
    
    # Virtual environment
    if [[ -d "venv" ]]; then
        log_success "Virtual environment: Found"
        
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            log_success "Virtual environment: Active"
        else
            log_warning "Virtual environment: Not activated"
        fi
    else
        log_error "Virtual environment: Not found"
    fi
    
    # Django
    if [[ -f "venv/bin/activate" ]]; then
        source venv/bin/activate
        if python -c "import django" &> /dev/null; then
            local django_version=$(python -c "import django; print(django.get_version())")
            log_success "Django: $django_version"
        else
            log_error "Django: Not installed"
        fi
    fi
}

# Check database connectivity
check_database() {
    log_info "Checking database connectivity..."
    
    if [[ ! -f "venv/bin/activate" ]]; then
        log_error "Virtual environment not found"
        return 1
    fi
    
    source venv/bin/activate
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Test database connection
    if python manage.py check --database default &> /dev/null; then
        log_success "Database: Connection OK"
        
        # Check migrations
        local pending_migrations=$(python manage.py showmigrations --plan | grep -c "\[ \]" || echo "0")
        if [[ "$pending_migrations" -gt 0 ]]; then
            log_warning "Database: $pending_migrations pending migrations"
        else
            log_success "Database: All migrations applied"
        fi
    else
        log_error "Database: Connection failed"
    fi
}

# Check Redis connectivity
check_redis() {
    log_info "Checking Redis connectivity..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            log_success "Redis: Connected"
            
            # Get Redis info
            local redis_version=$(redis-cli info server | grep "redis_version:" | cut -d: -f2 | tr -d '\r')
            log_success "Redis version: $redis_version"
        else
            log_error "Redis: Connection failed"
        fi
    else
        log_warning "Redis CLI not available"
    fi
}

# Check disk space
check_disk_space() {
    log_info "Checking disk space..."
    
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    local available_space=$(df -h . | tail -1 | awk '{print $4}')
    
    if [[ "$disk_usage" -lt 80 ]]; then
        log_success "Disk usage: ${disk_usage}% (Available: $available_space)"
    elif [[ "$disk_usage" -lt 90 ]]; then
        log_warning "Disk usage: ${disk_usage}% (Available: $available_space)"
    else
        log_error "Disk usage: ${disk_usage}% (Available: $available_space)"
    fi
}

# Check memory usage
check_memory() {
    log_info "Checking memory usage..."
    
    if command -v free &> /dev/null; then
        local mem_info=$(free -h | grep "Mem:")
        local used=$(echo "$mem_info" | awk '{print $3}')
        local total=$(echo "$mem_info" | awk '{print $2}')
        local available=$(echo "$mem_info" | awk '{print $7}')
        
        log_success "Memory: $used used / $total total (Available: $available)"
    else
        log_warning "Memory check not available on this system"
    fi
}

# Check running processes
check_processes() {
    log_info "Checking running processes..."
    
    # Check for Django processes
    local django_procs=$(pgrep -f "python.*manage.py" | wc -l)
    if [[ "$django_procs" -gt 0 ]]; then
        log_success "Django processes: $django_procs running"
    else
        log_info "Django processes: None running"
    fi
    
    # Check for Daphne processes
    local daphne_procs=$(pgrep -f "daphne" | wc -l)
    if [[ "$daphne_procs" -gt 0 ]]; then
        log_success "Daphne processes: $daphne_procs running"
    else
        log_info "Daphne processes: None running"
    fi
    
    # Check for Celery processes
    local celery_procs=$(pgrep -f "celery" | wc -l)
    if [[ "$celery_procs" -gt 0 ]]; then
        log_success "Celery processes: $celery_procs running"
    else
        log_info "Celery processes: None running"
    fi
}

# Check log files
check_logs() {
    log_info "Checking log files..."
    
    if [[ -d "logs" ]]; then
        log_success "Logs directory: Found"
        
        # Check log sizes
        for log_file in logs/*.log; do
            if [[ -f "$log_file" ]]; then
                local size=$(du -h "$log_file" | cut -f1)
                local name=$(basename "$log_file")
                
                if [[ "$size" == "0" ]]; then
                    log_info "Log $name: Empty"
                else
                    log_success "Log $name: $size"
                fi
            fi
        done
        
        # Check for recent errors
        if [[ -f "logs/django.log" ]]; then
            local recent_errors=$(tail -100 logs/django.log | grep -i "error\|exception" | wc -l)
            if [[ "$recent_errors" -gt 0 ]]; then
                log_warning "Recent errors in django.log: $recent_errors"
            else
                log_success "No recent errors in django.log"
            fi
        fi
    else
        log_warning "Logs directory: Not found"
    fi
}

# Check file permissions
check_permissions() {
    log_info "Checking file permissions..."
    
    # Check if manage.sh is executable
    if [[ -x "manage.sh" ]]; then
        log_success "manage.sh: Executable"
    else
        log_warning "manage.sh: Not executable"
    fi
    
    # Check scripts directory
    if [[ -d "scripts" ]]; then
        local non_executable=$(find scripts/ -name "*.sh" ! -executable | wc -l)
        if [[ "$non_executable" -eq 0 ]]; then
            log_success "Scripts: All executable"
        else
            log_warning "Scripts: $non_executable not executable"
        fi
    fi
    
    # Check log directory permissions
    if [[ -d "logs" ]]; then
        if [[ -w "logs" ]]; then
            log_success "Logs directory: Writable"
        else
            log_error "Logs directory: Not writable"
        fi
    fi
}

# Check network connectivity
check_network() {
    log_info "Checking network connectivity..."
    
    # Check if common ports are available
    local ports=("8000" "8001" "6379" "5432")
    
    for port in "${ports[@]}"; do
        if netstat -ln 2>/dev/null | grep -q ":$port "; then
            log_info "Port $port: In use"
        else
            log_success "Port $port: Available"
        fi
    done
    
    # Check external connectivity
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log_success "External connectivity: OK"
    else
        log_warning "External connectivity: Failed"
    fi
}

# Security checks
check_security() {
    log_info "Running security checks..."
    
    # Check for .env file
    if [[ -f ".env" ]]; then
        log_success ".env file: Found"
        
        # Check if DEBUG is disabled in production
        if grep -q "DEBUG=False" .env; then
            log_success "DEBUG mode: Disabled"
        elif grep -q "DEBUG=True" .env; then
            log_warning "DEBUG mode: Enabled (should be disabled in production)"
        fi
        
        # Check for default secret key
        if grep -q "django-insecure" .env; then
            log_error "SECRET_KEY: Using default insecure key"
        else
            log_success "SECRET_KEY: Custom key configured"
        fi
    else
        log_warning ".env file: Not found"
    fi
    
    # Check file permissions for sensitive files
    for file in ".env" "*.key" "*.pem"; do
        if [[ -f "$file" ]]; then
            local perms=$(stat -c %a "$file" 2>/dev/null || echo "unknown")
            if [[ "$perms" == "600" ]] || [[ "$perms" == "400" ]]; then
                log_success "$file permissions: Secure ($perms)"
            else
                log_warning "$file permissions: Insecure ($perms) - should be 600 or 400"
            fi
        fi
    done
}

# Performance checks
check_performance() {
    log_info "Checking performance metrics..."
    
    # Check project size
    local project_size=$(du -sh . 2>/dev/null | cut -f1)
    log_info "Project size: $project_size"
    
    # Check database size
    if [[ -f "db.sqlite3" ]]; then
        local db_size=$(du -sh db.sqlite3 | cut -f1)
        log_info "Database size: $db_size"
    fi
    
    # Check static files size
    if [[ -d "staticfiles" ]]; then
        local static_size=$(du -sh staticfiles 2>/dev/null | cut -f1)
        log_info "Static files size: $static_size"
    fi
    
    # Check media files size
    if [[ -d "media" ]]; then
        local media_size=$(du -sh media 2>/dev/null | cut -f1)
        log_info "Media files size: $media_size"
    fi
    
    # Check virtual environment size
    if [[ -d "venv" ]]; then
        local venv_size=$(du -sh venv 2>/dev/null | cut -f1)
        log_info "Virtual environment size: $venv_size"
    fi
}

# Comprehensive health check
full_health_check() {
    echo "🏥 Watch Party Backend Health Check"
    echo "=================================="
    echo "Started: $(date)"
    echo
    
    check_system_deps
    echo
    check_python_env
    echo
    check_database
    echo
    check_redis
    echo
    check_disk_space
    echo
    check_memory
    echo
    check_processes
    echo
    check_logs
    echo
    check_permissions
    echo
    check_network
    echo
    check_security
    echo
    check_performance
    
    echo
    echo "=================================="
    echo "Health check completed: $(date)"
}

# Quick status check
quick_status() {
    echo "⚡ Quick Status Check"
    echo "===================="
    
    # Essential checks only
    if [[ -d "venv" ]] && [[ -f "manage.py" ]]; then
        log_success "Project structure: OK"
    else
        log_error "Project structure: Invalid"
    fi
    
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        log_success "Virtual environment: Active"
    else
        log_warning "Virtual environment: Not active"
    fi
    
    # Check if server is running
    if pgrep -f "python.*manage.py\|daphne" &> /dev/null; then
        log_success "Server: Running"
    else
        log_info "Server: Not running"
    fi
    
    # Check disk space quickly
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ "$disk_usage" -lt 90 ]]; then
        log_success "Disk space: OK ($disk_usage% used)"
    else
        log_error "Disk space: Critical ($disk_usage% used)"
    fi
}

# Show project statistics
show_stats() {
    echo "📊 Project Statistics"
    echo "===================="
    
    # Code statistics
    echo "Code metrics:"
    echo "  Python files: $(find . -name "*.py" -not -path "./venv/*" | wc -l)"
    echo "  Lines of code: $(find . -name "*.py" -not -path "./venv/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")"
    echo "  Django apps: $(find apps/ -name "apps.py" | wc -l 2>/dev/null || echo "0")"
    
    echo
    echo "Dependencies:"
    if [[ -f "requirements.txt" ]]; then
        echo "  Python packages: $(wc -l < requirements.txt)"
    fi
    
    echo
    echo "Database:"
    if [[ -f "db.sqlite3" ]]; then
        echo "  SQLite size: $(du -sh db.sqlite3 | cut -f1)"
        
        # Count tables if possible
        if command -v sqlite3 &> /dev/null; then
            local table_count=$(sqlite3 db.sqlite3 ".tables" | wc -w)
            echo "  Tables: $table_count"
        fi
    fi
    
    echo
    echo "Files:"
    echo "  Total files: $(find . -type f | wc -l)"
    echo "  Cache files: $(find . -name "*.pyc" | wc -l)"
    echo "  Log files: $(find . -name "*.log" | wc -l)"
    
    if [[ -d "media" ]]; then
        echo "  Media files: $(find media/ -type f | wc -l 2>/dev/null || echo "0")"
    fi
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        check|full)
            full_health_check "$@"
            ;;
        status|quick)
            quick_status "$@"
            ;;
        stats|statistics)
            show_stats "$@"
            ;;
        system)
            check_system_deps "$@"
            ;;
        python|env)
            check_python_env "$@"
            ;;
        database|db)
            check_database "$@"
            ;;
        redis)
            check_redis "$@"
            ;;
        disk)
            check_disk_space "$@"
            ;;
        memory|mem)
            check_memory "$@"
            ;;
        processes|proc)
            check_processes "$@"
            ;;
        logs)
            check_logs "$@"
            ;;
        permissions|perms)
            check_permissions "$@"
            ;;
        network|net)
            check_network "$@"
            ;;
        security|sec)
            check_security "$@"
            ;;
        performance|perf)
            check_performance "$@"
            ;;
        help|--help|-h)
            echo "Health Monitoring Script Commands:"
            echo "  check, full             Full health check"
            echo "  status, quick           Quick status check"
            echo "  stats, statistics       Show project statistics"
            echo "  system                  Check system dependencies"
            echo "  python, env             Check Python environment"
            echo "  database, db            Check database connectivity"
            echo "  redis                   Check Redis connectivity"
            echo "  disk                    Check disk space"
            echo "  memory, mem             Check memory usage"
            echo "  processes, proc         Check running processes"
            echo "  logs                    Check log files"
            echo "  permissions, perms      Check file permissions"
            echo "  network, net            Check network connectivity"
            echo "  security, sec           Run security checks"
            echo "  performance, perf       Check performance metrics"
            ;;
        *)
            log_error "Unknown health command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
