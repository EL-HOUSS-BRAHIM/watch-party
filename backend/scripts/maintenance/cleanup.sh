#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - CLEANUP SCRIPT
# =============================================================================
# Enhanced cleanup operations

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

# Standard cleanup (calls the original cleanup.sh)
standard_cleanup() {
    if [[ -f "cleanup.sh" ]]; then
        log_info "Running standard cleanup..."
        ./cleanup.sh "$@"
    else
        log_warning "Standard cleanup.sh not found, running basic cleanup..."
        basic_cleanup
    fi
}

# Basic cleanup operations
basic_cleanup() {
    log_info "Running basic cleanup..."
    
    # Python cache files
    log_info "Cleaning Python cache..."
    find . -name "*.pyc" -type f -delete 2>/dev/null || true
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Log files
    log_info "Cleaning log files..."
    rm -f *.log *.out *.err 2>/dev/null || true
    if [[ -d "logs" ]]; then
        rm -f logs/*.log 2>/dev/null || true
        touch logs/django.log
    fi
    
    # Temporary files
    log_info "Cleaning temporary files..."
    find . \( -name "*.tmp" -o -name "*.temp" -o -name "*.bak" -o -name "*.backup" \
             -o -name "*.swp" -o -name "*.swo" -o -name ".DS_Store" -o -name "Thumbs.db" \
             -o -name "*.orig" -o -name "*.rej" \) -type f -delete 2>/dev/null || true
    
    log_success "Basic cleanup completed"
}

# Deep cleanup with optimization
deep_cleanup() {
    log_info "Running deep cleanup with optimization..."
    
    standard_cleanup
    
    # Additional deep cleaning
    log_info "Optimizing virtual environment..."
    if [[ -d "venv" ]]; then
        # Clean pip cache
        source venv/bin/activate
        pip cache purge 2>/dev/null || true
    fi
    
    # Clean test artifacts
    log_info "Cleaning test artifacts..."
    rm -rf .pytest_cache/ .tox/ .coverage htmlcov/ .mypy_cache/
    
    # Clean build artifacts
    log_info "Cleaning build artifacts..."
    rm -rf build/ dist/ *.egg-info/
    
    # Clean static files cache
    log_info "Cleaning static files cache..."
    rm -rf .sass-cache/ .webassets-cache/
    
    # Optimize database (SQLite only)
    if [[ -f "db.sqlite3" ]]; then
        log_info "Optimizing SQLite database..."
        sqlite3 db.sqlite3 "VACUUM;" 2>/dev/null || true
    fi
    
    # Git cleanup
    if [[ -d ".git" ]]; then
        log_info "Optimizing Git repository..."
        git gc --aggressive --prune=now 2>/dev/null || true
        git reflog expire --expire=now --all 2>/dev/null || true
    fi
    
    log_success "Deep cleanup completed"
}

# Security cleanup (remove sensitive files)
security_cleanup() {
    log_info "Running security cleanup..."
    
    # Remove sensitive files that might have been created accidentally
    local sensitive_files=(
        ".env.local" 
        ".env.production.local"
        "*.key" 
        "*.pem" 
        "*.p12" 
        "*_secret*"
        "credentials.json"
        "serviceAccount*.json"
        "firebase-adminsdk*.json"
    )
    
    for pattern in "${sensitive_files[@]}"; do
        find . -name "$pattern" -type f | while read -r file; do
            log_warning "Found potentially sensitive file: $file"
            if [[ "$FORCE" == "true" ]]; then
                rm "$file"
                log_info "Removed: $file"
            else
                read -p "Remove $file? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    rm "$file"
                    log_info "Removed: $file"
                fi
            fi
        done
    done
    
    # Check for hardcoded secrets in code
    log_info "Scanning for potential hardcoded secrets..."
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]{8,}"
        "secret\s*=\s*['\"][^'\"]{16,}"
        "key\s*=\s*['\"][^'\"]{16,}"
        "token\s*=\s*['\"][^'\"]{16,}"
        "api_key\s*=\s*['\"][^'\"]{16,}"
    )
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -r -i -E "$pattern" --include="*.py" . 2>/dev/null; then
            log_warning "Potential hardcoded secrets found. Please review the above matches."
        fi
    done
    
    log_success "Security cleanup completed"
}

# Development cleanup
dev_cleanup() {
    log_info "Running development cleanup..."
    
    # Remove development databases
    log_info "Cleaning development databases..."
    rm -f db_*.sqlite3 test_*.sqlite3
    
    # Remove migration files in development
    if [[ "$1" == "--reset-migrations" ]]; then
        log_warning "Removing migration files..."
        find apps/*/migrations/ -name "*.py" -not -name "__init__.py" -delete 2>/dev/null || true
    fi
    
    # Clean coverage reports
    log_info "Cleaning coverage reports..."
    rm -rf htmlcov/ .coverage.*
    
    # Clean debugging files
    log_info "Cleaning debugging files..."
    rm -f debug.log django_debug.log
    
    # Clean test media files
    log_info "Cleaning test media files..."
    rm -rf test_media/ media/test_*
    
    log_success "Development cleanup completed"
}

# Production cleanup (safe for production)
production_cleanup() {
    log_info "Running production-safe cleanup..."
    
    # Only safe operations for production
    log_info "Cleaning Python cache (production safe)..."
    find . -name "*.pyc" -type f -delete 2>/dev/null || true
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Clean old log files (keep recent ones)
    log_info "Cleaning old log files..."
    if [[ -d "logs" ]]; then
        find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true
    fi
    
    # Clean temporary files only
    log_info "Cleaning temporary files..."
    find . -name "*.tmp" -type f -mtime +1 -delete 2>/dev/null || true
    
    # Optimize static files
    log_info "Optimizing static files..."
    if [[ -d "staticfiles" ]]; then
        # Remove source maps in production
        find staticfiles/ -name "*.map" -delete 2>/dev/null || true
    fi
    
    log_success "Production cleanup completed"
}

# Disk usage analysis
analyze_disk_usage() {
    log_info "Analyzing disk usage..."
    echo
    
    echo "📊 Top directories by size:"
    du -sh */ 2>/dev/null | sort -hr | head -10 || true
    
    echo
    echo "📊 Top files by size:"
    find . -type f -exec du -h {} + 2>/dev/null | sort -hr | head -10 || true
    
    echo
    echo "📊 File type distribution:"
    find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10 || true
    
    echo
    echo "📊 Cache and temporary files:"
    echo "  Python cache: $(find . -name "*.pyc" | wc -l) files"
    echo "  Temp files: $(find . -name "*.tmp" -o -name "*.temp" | wc -l) files"
    echo "  Log files: $(find . -name "*.log" | wc -l) files"
    echo "  Backup files: $(find . -name "*.bak" -o -name "*.backup" | wc -l) files"
    
    if [[ -d "venv" ]]; then
        echo "  Virtual env size: $(du -sh venv 2>/dev/null | cut -f1)"
    fi
    
    if [[ -d ".git" ]]; then
        echo "  Git repo size: $(du -sh .git 2>/dev/null | cut -f1)"
    fi
    
    echo
    echo "📊 Total project size: $(du -sh . 2>/dev/null | cut -f1)"
}

# Cleanup with metrics
cleanup_with_metrics() {
    local cleanup_type="${1:-standard}"
    
    log_info "Starting cleanup with metrics..."
    
    # Before metrics
    local before_size=$(du -s . 2>/dev/null | cut -f1)
    local before_files=$(find . -type f | wc -l)
    
    echo "📊 Before cleanup:"
    echo "  Size: $(du -sh . 2>/dev/null | cut -f1)"
    echo "  Files: $before_files"
    echo
    
    # Run cleanup
    case "$cleanup_type" in
        standard) standard_cleanup ;;
        deep) deep_cleanup ;;
        security) security_cleanup ;;
        dev) dev_cleanup ;;
        production) production_cleanup ;;
        *) standard_cleanup ;;
    esac
    
    # After metrics
    local after_size=$(du -s . 2>/dev/null | cut -f1)
    local after_files=$(find . -type f | wc -l)
    local saved_space=$((before_size - after_size))
    local removed_files=$((before_files - after_files))
    
    echo
    echo "📊 After cleanup:"
    echo "  Size: $(du -sh . 2>/dev/null | cut -f1)"
    echo "  Files: $after_files"
    echo "  Space saved: $(echo $saved_space | awk '{print $1/1024 "MB"}')"
    echo "  Files removed: $removed_files"
}

# Interactive cleanup
interactive_cleanup() {
    log_info "Interactive cleanup mode..."
    echo
    
    echo "Select cleanup operations:"
    echo "1. Python cache files"
    echo "2. Log files"
    echo "3. Temporary files"
    echo "4. Test artifacts"
    echo "5. Build artifacts"
    echo "6. Git optimization"
    echo "7. Database optimization"
    echo "8. Security scan"
    echo "9. All of the above"
    echo
    
    read -p "Enter your choices (1-9, comma separated): " choices
    
    IFS=',' read -ra ADDR <<< "$choices"
    for choice in "${ADDR[@]}"; do
        case "$choice" in
            1)
                log_info "Cleaning Python cache..."
                find . -name "*.pyc" -type f -delete 2>/dev/null || true
                find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
                ;;
            2)
                log_info "Cleaning log files..."
                rm -f *.log *.out *.err 2>/dev/null || true
                ;;
            3)
                log_info "Cleaning temporary files..."
                find . -name "*.tmp" -o -name "*.temp" -o -name "*.bak" -type f -delete 2>/dev/null || true
                ;;
            4)
                log_info "Cleaning test artifacts..."
                rm -rf .pytest_cache/ .tox/ .coverage htmlcov/
                ;;
            5)
                log_info "Cleaning build artifacts..."
                rm -rf build/ dist/ *.egg-info/
                ;;
            6)
                log_info "Optimizing Git repository..."
                git gc --prune=now 2>/dev/null || true
                ;;
            7)
                log_info "Optimizing database..."
                if [[ -f "db.sqlite3" ]]; then
                    sqlite3 db.sqlite3 "VACUUM;" 2>/dev/null || true
                fi
                ;;
            8)
                security_cleanup
                ;;
            9)
                deep_cleanup
                break
                ;;
            *)
                log_warning "Invalid choice: $choice"
                ;;
        esac
    done
    
    log_success "Interactive cleanup completed"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        clean|standard)
            cleanup_with_metrics "standard" "$@"
            ;;
        deep|aggressive)
            cleanup_with_metrics "deep" "$@"
            ;;
        security|secure)
            cleanup_with_metrics "security" "$@"
            ;;
        dev|development)
            cleanup_with_metrics "dev" "$@"
            ;;
        production|prod)
            cleanup_with_metrics "production" "$@"
            ;;
        analyze|analysis)
            analyze_disk_usage "$@"
            ;;
        interactive|menu)
            interactive_cleanup "$@"
            ;;
        help|--help|-h)
            echo "Cleanup Script Commands:"
            echo "  clean, standard         Standard cleanup operations"
            echo "  deep, aggressive        Deep cleanup with optimization"
            echo "  security, secure        Security-focused cleanup"
            echo "  dev, development        Development cleanup"
            echo "  production, prod        Production-safe cleanup"
            echo "  analyze, analysis       Analyze disk usage"
            echo "  interactive, menu       Interactive cleanup"
            echo
            echo "Options:"
            echo "  --reset-migrations      Remove migration files (dev only)"
            ;;
        *)
            log_error "Unknown cleanup command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
