#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - WIPEOUT SCRIPT
# =============================================================================
# Complete project removal and cleanup operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_title() { echo -e "${WHITE}$1${NC}"; }

# Change to project root
cd "$PROJECT_ROOT"

# Show scary warning banner
show_danger_banner() {
    echo -e "${RED}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                               ⚠️  DANGER ZONE ⚠️                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                         DESTRUCTIVE OPERATION AHEAD                         ║
║                                                                              ║
║  This operation will PERMANENTLY DELETE data and configurations.            ║
║  Make sure you have backups before proceeding!                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Confirm dangerous operation
confirm_operation() {
    local operation="$1"
    local extra_warning="$2"
    
    show_danger_banner
    
    echo -e "${WHITE}Operation: $operation${NC}"
    if [[ -n "$extra_warning" ]]; then
        echo -e "${RED}$extra_warning${NC}"
    fi
    echo
    
    if [[ "$FORCE" == "true" ]]; then
        log_warning "Force mode enabled - proceeding without confirmation"
        return 0
    fi
    
    echo -e "${YELLOW}Type 'YES I UNDERSTAND' to confirm this operation:${NC}"
    read -r confirmation
    
    if [[ "$confirmation" != "YES I UNDERSTAND" ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
    
    echo -e "${YELLOW}Are you absolutely sure? (type 'DELETE' to confirm):${NC}"
    read -r final_confirmation
    
    if [[ "$final_confirmation" != "DELETE" ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
    
    log_warning "Proceeding with destructive operation in 5 seconds..."
    sleep 5
}

# Project wipeout - removes project data but keeps structure
project_wipeout() {
    confirm_operation "Project Wipeout" "This will delete all project data but keep the source code structure"
    
    log_title "🧹 Starting Project Wipeout..."
    echo
    
    # Stop any running processes
    log_info "Stopping running processes..."
    pkill -f "python.*manage.py" 2>/dev/null || true
    pkill -f "daphne" 2>/dev/null || true
    pkill -f "celery" 2>/dev/null || true
    
    # Remove databases
    log_info "Removing databases..."
    rm -f db.sqlite3 db.sqlite3-journal
    rm -f *.sqlite3
    
    # Remove migration files (keep __init__.py)
    log_info "Removing migration files..."
    find apps/*/migrations/ -name "*.py" -not -name "__init__.py" -delete 2>/dev/null || true
    
    # Remove static files
    log_info "Removing static files..."
    rm -rf staticfiles/ static/ media/ uploads/
    
    # Remove log files
    log_info "Removing log files..."
    rm -rf logs/
    mkdir -p logs
    touch logs/django.log
    
    # Remove cache files
    log_info "Removing cache files..."
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove environment files
    log_info "Removing environment files..."
    rm -f .env .env.local .env.production
    
    # Remove temporary files
    log_info "Removing temporary files..."
    rm -f *.log *.tmp *.temp celerybeat-schedule
    rm -rf .pytest_cache/ .coverage htmlcov/
    
    # Remove virtual environment
    log_info "Removing virtual environment..."
    rm -rf venv/ env/ .venv/
    
    # Remove node modules if any
    log_info "Removing node modules..."
    rm -rf node_modules/ package-lock.json
    
    # Remove backup files
    log_info "Removing backup files..."
    rm -rf backups/
    
    # Reset git to clean state (optional)
    if [[ -d ".git" ]]; then
        log_info "Cleaning git repository..."
        git clean -fd 2>/dev/null || true
        git reset --hard HEAD 2>/dev/null || true
    fi
    
    log_success "Project wipeout completed!"
    echo
    echo "The project structure remains intact, but all data has been removed."
    echo "To restart the project:"
    echo "  1. Run: ./manage.sh setup"
    echo "  2. Configure your .env file"
    echo "  3. Run: ./manage.sh migrate"
    echo
}

# Nuclear wipeout - removes everything including source code
nuclear_wipeout() {
    confirm_operation "Nuclear Wipeout" "This will DELETE THE ENTIRE PROJECT DIRECTORY!"
    
    log_title "💥 Starting Nuclear Wipeout..."
    echo
    
    # Get parent directory to delete from
    local parent_dir=$(dirname "$PROJECT_ROOT")
    local project_name=$(basename "$PROJECT_ROOT")
    
    # Final warning
    echo -e "${RED}⚠️  About to delete: $PROJECT_ROOT${NC}"
    echo -e "${YELLOW}Last chance to cancel (Ctrl+C)...${NC}"
    sleep 10
    
    # Stop all processes
    log_info "Stopping all processes..."
    pkill -f "python.*manage.py" 2>/dev/null || true
    pkill -f "daphne" 2>/dev/null || true
    pkill -f "celery" 2>/dev/null || true
    
    # Remove systemd services if any
    if command -v systemctl &> /dev/null; then
        log_info "Checking for systemd services..."
        systemctl list-units --all | grep -i watchparty | while read service; do
            local service_name=$(echo "$service" | awk '{print $1}')
            log_info "Stopping service: $service_name"
            sudo systemctl stop "$service_name" 2>/dev/null || true
            sudo systemctl disable "$service_name" 2>/dev/null || true
            sudo rm -f "/etc/systemd/system/$service_name" 2>/dev/null || true
        done
        sudo systemctl daemon-reload 2>/dev/null || true
    fi
    
    # Remove nginx configuration if any
    if [[ -f "/etc/nginx/sites-available/watch-party-backend" ]]; then
        log_info "Removing nginx configuration..."
        sudo rm -f /etc/nginx/sites-available/watch-party-backend
        sudo rm -f /etc/nginx/sites-enabled/watch-party-backend
        sudo systemctl reload nginx 2>/dev/null || true
    fi
    
    # Remove SSL certificates if any
    if [[ -d "/etc/letsencrypt/live" ]]; then
        log_info "Checking for SSL certificates..."
        find /etc/letsencrypt/live -name "*watchparty*" -type d | while read cert_dir; do
            local domain=$(basename "$cert_dir")
            log_info "Found certificate for: $domain"
            log_warning "SSL certificate left intact: $cert_dir"
        done
    fi
    
    # Remove cron jobs
    log_info "Removing cron jobs..."
    crontab -l 2>/dev/null | grep -v "watchparty\|watch-party" | crontab - 2>/dev/null || true
    
    # Change to parent directory before deletion
    cd "$parent_dir"
    
    # Final nuclear deletion
    log_warning "EXECUTING NUCLEAR DELETION..."
    rm -rf "$PROJECT_ROOT"
    
    log_success "Nuclear wipeout completed!"
    echo
    echo -e "${RED}The project has been completely removed from: $PROJECT_ROOT${NC}"
    echo
    echo "Cleanup summary:"
    echo "  ✅ Project files deleted"
    echo "  ✅ Virtual environment removed"
    echo "  ✅ Processes stopped"
    echo "  ✅ Cache files cleaned"
    echo "  ⚠️  Manual cleanup may be needed for:"
    echo "     - Nginx configuration"
    echo "     - SSL certificates"
    echo "     - Database server (if external)"
    echo "     - Redis server (if external)"
    echo "     - DNS records"
    echo
}

# Server cleanup - removes server configurations
server_cleanup() {
    confirm_operation "Server Cleanup" "This will remove server configurations and services"
    
    log_title "🗄️  Starting Server Cleanup..."
    echo
    
    # Stop services
    log_info "Stopping Watch Party services..."
    if command -v systemctl &> /dev/null; then
        systemctl list-units --all | grep -i watchparty | while read service; do
            local service_name=$(echo "$service" | awk '{print $1}')
            log_info "Stopping service: $service_name"
            sudo systemctl stop "$service_name" 2>/dev/null || true
            sudo systemctl disable "$service_name" 2>/dev/null || true
        done
    fi
    
    # Remove systemd service files
    log_info "Removing systemd service files..."
    sudo find /etc/systemd/system -name "*watchparty*" -delete 2>/dev/null || true
    sudo systemctl daemon-reload 2>/dev/null || true
    
    # Remove nginx configuration
    log_info "Removing nginx configuration..."
    sudo rm -f /etc/nginx/sites-available/watch-party-backend
    sudo rm -f /etc/nginx/sites-enabled/watch-party-backend
    sudo nginx -t && sudo systemctl reload nginx 2>/dev/null || true
    
    # Remove log files from system
    log_info "Removing system log files..."
    sudo rm -f /var/log/nginx/watchparty_*.log
    sudo rm -f /var/log/watchparty*.log
    
    # Remove application directory from /var/www if exists
    if [[ -d "/var/www/watch-party-backend" ]]; then
        log_info "Removing application from /var/www..."
        sudo rm -rf /var/www/watch-party-backend
    fi
    
    # Remove user and group if created
    if id "watchparty" &>/dev/null; then
        log_info "Removing watchparty user..."
        sudo userdel -r watchparty 2>/dev/null || true
    fi
    
    # Remove cron jobs
    log_info "Removing cron jobs..."
    sudo crontab -l 2>/dev/null | grep -v "watchparty\|watch-party" | sudo crontab - 2>/dev/null || true
    
    # Remove environment files from system locations
    log_info "Removing system environment files..."
    sudo rm -f /etc/environment.d/watchparty.conf
    sudo rm -f /etc/systemd/system.conf.d/watchparty.conf
    
    log_success "Server cleanup completed!"
    echo
    echo "Server configurations removed:"
    echo "  ✅ Systemd services"
    echo "  ✅ Nginx configuration"
    echo "  ✅ System log files"
    echo "  ✅ Application user/group"
    echo "  ✅ Cron jobs"
    echo
    echo "⚠️  Note: Database and Redis servers were left running"
    echo "   Stop them manually if no longer needed:"
    echo "   sudo systemctl stop postgresql redis-server"
}

# Database wipeout
database_wipeout() {
    confirm_operation "Database Wipeout" "This will DELETE ALL DATABASE DATA"
    
    log_title "🗃️  Starting Database Wipeout..."
    echo
    
    # Remove SQLite databases
    log_info "Removing SQLite databases..."
    rm -f *.sqlite3 *.db
    
    # PostgreSQL database cleanup
    if command -v psql &> /dev/null; then
        log_info "PostgreSQL database cleanup..."
        
        # Try to drop databases that might exist
        for db_name in watchparty watchparty_dev watchparty_test watchparty_staging; do
            if psql -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
                log_info "Dropping PostgreSQL database: $db_name"
                dropdb "$db_name" 2>/dev/null || log_warning "Could not drop database: $db_name"
            fi
        done
    fi
    
    # Redis cleanup
    if command -v redis-cli &> /dev/null; then
        log_info "Flushing Redis data..."
        redis-cli FLUSHALL 2>/dev/null || log_warning "Could not flush Redis"
    fi
    
    log_success "Database wipeout completed!"
}

# Show what would be deleted (dry run)
show_dry_run() {
    local operation="$1"
    
    echo -e "${BLUE}Dry run for: $operation${NC}"
    echo
    
    case "$operation" in
        wipeout)
            echo "Would delete:"
            echo "  📁 Database files: $(find . -name "*.sqlite3" | wc -l) files"
            echo "  📁 Migration files: $(find apps/*/migrations/ -name "*.py" -not -name "__init__.py" | wc -l) files"
            echo "  📁 Static files: $(find . -name "staticfiles" -o -name "static" -o -name "media" | wc -l) directories"
            echo "  📁 Log files: $(find . -name "*.log" | wc -l) files"
            echo "  📁 Cache files: $(find . -name "*.pyc" | wc -l) files"
            echo "  📁 Virtual environment: $(find . -name "venv" -o -name "env" | wc -l) directories"
            ;;
        nuke)
            echo "Would delete:"
            echo "  💥 ENTIRE PROJECT DIRECTORY: $PROJECT_ROOT"
            echo "  🗄️  System services and configurations"
            echo "  🌐 Nginx configurations"
            echo "  📜 Cron jobs"
            ;;
        server)
            echo "Would remove:"
            echo "  🗄️  Systemd services"
            echo "  🌐 Nginx configurations"
            echo "  📂 /var/www/watch-party-backend"
            echo "  👤 watchparty user/group"
            echo "  📜 Cron jobs"
            ;;
        database)
            echo "Would delete:"
            echo "  🗃️  All SQLite databases"
            echo "  🗃️  PostgreSQL databases (watchparty*)"
            echo "  🗃️  Redis data"
            ;;
    esac
    
    echo
    echo "Use --force to execute without prompts"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    # Check for dry run
    if [[ "$DRY_RUN" == "true" ]]; then
        show_dry_run "$command"
        return 0
    fi
    
    case "$command" in
        wipeout|clean)
            project_wipeout "$@"
            ;;
        nuke|nuclear)
            nuclear_wipeout "$@"
            ;;
        server|server-cleanup)
            server_cleanup "$@"
            ;;
        database|db)
            database_wipeout "$@"
            ;;
        help|--help|-h)
            echo "Wipeout Script Commands:"
            echo "  wipeout, clean          Remove project data but keep structure"
            echo "  nuke, nuclear           COMPLETE project removal"
            echo "  server                  Remove server configurations"
            echo "  database, db            Remove all database data"
            echo
            echo "Options:"
            echo "  --force                 Skip confirmation prompts"
            echo "  --dry-run               Show what would be deleted"
            echo
            echo "⚠️  ALL OPERATIONS ARE DESTRUCTIVE AND IRREVERSIBLE!"
            ;;
        *)
            log_error "Unknown wipeout command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
