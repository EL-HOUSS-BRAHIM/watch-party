#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - MONITORING SCRIPT
# =============================================================================
# System monitoring and log viewing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Change to project root
cd "$PROJECT_ROOT"

# Show real-time logs
show_logs() {
    local log_type="${1:-all}"
    local lines="${2:-50}"
    
    case "$log_type" in
        django|app)
            if [[ -f "logs/django.log" ]]; then
                log_info "Showing Django logs (last $lines lines)..."
                tail -n "$lines" -f logs/django.log
            else
                log_error "Django log file not found"
            fi
            ;;
        error|errors)
            log_info "Showing error logs..."
            if [[ -f "logs/django.log" ]]; then
                tail -n 200 logs/django.log | grep -i "error\|exception\|critical" | tail -n "$lines"
            else
                log_error "Log file not found"
            fi
            ;;
        security)
            if [[ -f "logs/security.log" ]]; then
                log_info "Showing security logs..."
                tail -n "$lines" -f logs/security.log
            else
                log_warning "Security log not found"
            fi
            ;;
        performance|perf)
            if [[ -f "logs/performance.log" ]]; then
                log_info "Showing performance logs..."
                tail -n "$lines" -f logs/performance.log
            else
                log_warning "Performance log not found"
            fi
            ;;
        access)
            log_info "Showing access logs..."
            if [[ -f "/var/log/nginx/watchparty_access.log" ]]; then
                tail -n "$lines" -f /var/log/nginx/watchparty_access.log
            else
                log_warning "Nginx access log not found"
            fi
            ;;
        nginx)
            log_info "Showing Nginx error logs..."
            if [[ -f "/var/log/nginx/watchparty_error.log" ]]; then
                tail -n "$lines" -f /var/log/nginx/watchparty_error.log
            else
                log_warning "Nginx error log not found"
            fi
            ;;
        all|*)
            log_info "Showing all logs..."
            if [[ -d "logs" ]]; then
                for log_file in logs/*.log; do
                    if [[ -f "$log_file" ]]; then
                        echo -e "${CYAN}=== $(basename "$log_file") ===${NC}"
                        tail -n 10 "$log_file"
                        echo
                    fi
                done
            else
                log_error "Logs directory not found"
            fi
            ;;
    esac
}

# Show system monitoring dashboard
show_dashboard() {
    while true; do
        clear
        echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║                         WATCH PARTY BACKEND MONITOR                         ║${NC}"
        echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo
        echo -e "${BLUE}📅 $(date)${NC}"
        echo
        
        # System status
        echo -e "${YELLOW}🖥️  SYSTEM STATUS${NC}"
        echo "────────────────"
        
        # CPU and Memory
        if command -v top &> /dev/null; then
            local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
            echo "CPU Usage: ${cpu_usage}%"
        fi
        
        if command -v free &> /dev/null; then
            local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
            echo "Memory Usage: ${mem_usage}%"
        fi
        
        # Disk usage
        local disk_usage=$(df . | tail -1 | awk '{print $5}')
        echo "Disk Usage: $disk_usage"
        echo
        
        # Application status
        echo -e "${YELLOW}🚀 APPLICATION STATUS${NC}"
        echo "──────────────────────"
        
        # Django process
        local django_procs=$(pgrep -f "python.*manage.py" | wc -l)
        if [[ "$django_procs" -gt 0 ]]; then
            echo -e "${GREEN}✅${NC} Django: $django_procs process(es) running"
        else
            echo -e "${RED}❌${NC} Django: Not running"
        fi
        
        # Daphne process
        local daphne_procs=$(pgrep -f "daphne" | wc -l)
        if [[ "$daphne_procs" -gt 0 ]]; then
            echo -e "${GREEN}✅${NC} Daphne: $daphne_procs process(es) running"
        else
            echo -e "${YELLOW}⚠️${NC} Daphne: Not running"
        fi
        
        # Redis
        if command -v redis-cli &> /dev/null && redis-cli ping &> /dev/null; then
            echo -e "${GREEN}✅${NC} Redis: Connected"
        else
            echo -e "${RED}❌${NC} Redis: Not available"
        fi
        
        # Database
        if [[ -f "db.sqlite3" ]]; then
            local db_size=$(du -sh db.sqlite3 | cut -f1)
            echo -e "${GREEN}✅${NC} Database: SQLite ($db_size)"
        else
            echo -e "${YELLOW}⚠️${NC} Database: Not found"
        fi
        echo
        
        # Recent activity
        echo -e "${YELLOW}📝 RECENT ACTIVITY${NC}"
        echo "──────────────────"
        
        if [[ -f "logs/django.log" ]]; then
            echo "Recent log entries:"
            tail -5 logs/django.log | while read -r line; do
                echo "  $(echo "$line" | cut -c1-70)..."
            done
        else
            echo "No recent activity"
        fi
        echo
        
        # Network connections
        echo -e "${YELLOW}🌐 NETWORK${NC}"
        echo "───────────"
        
        # Check ports
        local ports=("8000" "8001" "6379")
        for port in "${ports[@]}"; do
            if netstat -ln 2>/dev/null | grep -q ":$port "; then
                echo -e "${GREEN}✅${NC} Port $port: In use"
            else
                echo -e "${YELLOW}⚠️${NC} Port $port: Available"
            fi
        done
        echo
        
        echo -e "${CYAN}Press Ctrl+C to exit, any key to refresh...${NC}"
        read -t 5 -n 1 || true
    done
}

# Show process information
show_processes() {
    log_info "Watch Party Backend Processes"
    echo
    
    # Django processes
    echo -e "${YELLOW}Django processes:${NC}"
    pgrep -f "python.*manage.py" | while read -r pid; do
        if [[ -n "$pid" ]]; then
            local cmd=$(ps -p "$pid" -o cmd --no-headers | cut -c1-60)
            local mem=$(ps -p "$pid" -o %mem --no-headers)
            local cpu=$(ps -p "$pid" -o %cpu --no-headers)
            echo "  PID $pid: CPU ${cpu}%, MEM ${mem}% - $cmd"
        fi
    done || echo "  No Django processes running"
    echo
    
    # Daphne processes
    echo -e "${YELLOW}Daphne processes:${NC}"
    pgrep -f "daphne" | while read -r pid; do
        if [[ -n "$pid" ]]; then
            local cmd=$(ps -p "$pid" -o cmd --no-headers | cut -c1-60)
            local mem=$(ps -p "$pid" -o %mem --no-headers)
            local cpu=$(ps -p "$pid" -o %cpu --no-headers)
            echo "  PID $pid: CPU ${cpu}%, MEM ${mem}% - $cmd"
        fi
    done || echo "  No Daphne processes running"
    echo
    
    # Celery processes
    echo -e "${YELLOW}Celery processes:${NC}"
    pgrep -f "celery" | while read -r pid; do
        if [[ -n "$pid" ]]; then
            local cmd=$(ps -p "$pid" -o cmd --no-headers | cut -c1-60)
            local mem=$(ps -p "$pid" -o %mem --no-headers)
            local cpu=$(ps -p "$pid" -o %cpu --no-headers)
            echo "  PID $pid: CPU ${cpu}%, MEM ${mem}% - $cmd"
        fi
    done || echo "  No Celery processes running"
}

# Show performance metrics
show_performance() {
    log_info "Performance Metrics"
    echo
    
    # Response time test
    if command -v curl &> /dev/null; then
        echo -e "${YELLOW}Response time test:${NC}"
        local start_time=$(date +%s%N)
        
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/ &> /dev/null; then
            local end_time=$(date +%s%N)
            local response_time=$(((end_time - start_time) / 1000000))
            echo "  Health endpoint: ${response_time}ms"
        else
            echo "  Health endpoint: Not responding"
        fi
        echo
    fi
    
    # Database performance
    if [[ -f "db.sqlite3" ]] && command -v sqlite3 &> /dev/null; then
        echo -e "${YELLOW}Database metrics:${NC}"
        local db_size=$(du -sh db.sqlite3 | cut -f1)
        local table_count=$(sqlite3 db.sqlite3 ".tables" | wc -w)
        echo "  Size: $db_size"
        echo "  Tables: $table_count"
        echo
    fi
    
    # Log file sizes
    echo -e "${YELLOW}Log file sizes:${NC}"
    if [[ -d "logs" ]]; then
        for log_file in logs/*.log; do
            if [[ -f "$log_file" ]]; then
                local size=$(du -sh "$log_file" | cut -f1)
                local name=$(basename "$log_file")
                echo "  $name: $size"
            fi
        done
    else
        echo "  No log files found"
    fi
}

# Show error summary
show_errors() {
    local hours="${1:-24}"
    
    log_info "Error Summary (last $hours hours)"
    echo
    
    if [[ ! -f "logs/django.log" ]]; then
        log_warning "Django log file not found"
        return 1
    fi
    
    # Find recent errors
    local since=$(date -d "$hours hours ago" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -v-"${hours}H" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "")
    
    echo -e "${YELLOW}Error breakdown:${NC}"
    
    # Count error types
    local error_count=$(grep -i "error" logs/django.log | wc -l)
    local exception_count=$(grep -i "exception" logs/django.log | wc -l)
    local critical_count=$(grep -i "critical" logs/django.log | wc -l)
    
    echo "  Errors: $error_count"
    echo "  Exceptions: $exception_count"
    echo "  Critical: $critical_count"
    echo
    
    # Show recent errors
    if [[ $((error_count + exception_count + critical_count)) -gt 0 ]]; then
        echo -e "${YELLOW}Recent errors:${NC}"
        grep -i "error\|exception\|critical" logs/django.log | tail -10 | while read -r line; do
            echo "  $(echo "$line" | cut -c1-80)..."
        done
    else
        echo -e "${GREEN}No recent errors found${NC}"
    fi
}

# Monitor in real-time
real_time_monitor() {
    log_info "Starting real-time monitoring (Ctrl+C to stop)..."
    
    # Create named pipes for different log types
    local temp_dir="/tmp/watchparty_monitor_$$"
    mkdir -p "$temp_dir"
    
    # Monitor different aspects
    while true; do
        clear
        echo -e "${CYAN}Real-time Monitor - $(date)${NC}"
        echo "================================"
        
        # Quick status
        if pgrep -f "python.*manage.py\|daphne" &> /dev/null; then
            echo -e "${GREEN}✅ Server: Running${NC}"
        else
            echo -e "${RED}❌ Server: Not running${NC}"
        fi
        
        # Recent log entries
        if [[ -f "logs/django.log" ]]; then
            echo -e "\n${YELLOW}Recent log entries:${NC}"
            tail -5 logs/django.log
        fi
        
        sleep 2
    done
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        logs|log)
            show_logs "$@"
            ;;
        dashboard|dash)
            show_dashboard "$@"
            ;;
        processes|proc|ps)
            show_processes "$@"
            ;;
        performance|perf)
            show_performance "$@"
            ;;
        errors|error)
            show_errors "$@"
            ;;
        monitor|watch)
            real_time_monitor "$@"
            ;;
        help|--help|-h)
            echo "Monitoring Script Commands:"
            echo "  logs [type] [lines]     Show logs (django|error|security|nginx|all)"
            echo "  dashboard, dash         Show monitoring dashboard"
            echo "  processes, proc, ps     Show running processes"
            echo "  performance, perf       Show performance metrics"
            echo "  errors [hours]          Show error summary"
            echo "  monitor, watch          Real-time monitoring"
            echo
            echo "Examples:"
            echo "  ./monitoring.sh logs django 100    # Show last 100 Django log lines"
            echo "  ./monitoring.sh errors 6           # Show errors from last 6 hours"
            echo "  ./monitoring.sh dashboard           # Show live dashboard"
            ;;
        *)
            log_error "Unknown monitoring command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
