#!/bin/bash

# Watch Party Backup Script
# Creates backups of database, media files, and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/home/ubuntu/watch-party"
BACKUP_ROOT="/home/ubuntu/backups/watch-party"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$DATE"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}==================== $1 ====================${NC}"
}

# Create backup directory
create_backup_dir() {
    print_section "CREATING BACKUP DIRECTORY"
    mkdir -p "$BACKUP_DIR"
    print_status "Backup directory created: $BACKUP_DIR"
}

# Backup database
backup_database() {
    print_section "BACKING UP DATABASE"
    
    local db_file="$PROJECT_ROOT/back-end/db.sqlite3"
    if [ -f "$db_file" ]; then
        cp "$db_file" "$BACKUP_DIR/db.sqlite3"
        print_status "Database backed up"
    else
        print_warning "Database file not found: $db_file"
    fi
}

# Backup media files
backup_media() {
    print_section "BACKING UP MEDIA FILES"
    
    local media_dir="$PROJECT_ROOT/back-end/media"
    if [ -d "$media_dir" ]; then
        cp -r "$media_dir" "$BACKUP_DIR/media"
        print_status "Media files backed up"
    else
        print_warning "Media directory not found: $media_dir"
    fi
}

# Backup environment files
backup_env_files() {
    print_section "BACKING UP ENVIRONMENT FILES"
    
    mkdir -p "$BACKUP_DIR/config"
    
    # Backend .env
    if [ -f "$PROJECT_ROOT/back-end/.env" ]; then
        cp "$PROJECT_ROOT/back-end/.env" "$BACKUP_DIR/config/backend.env"
        print_status "Backend environment file backed up"
    fi
    
    # Frontend .env.local
    if [ -f "$PROJECT_ROOT/front-end/.env.local" ]; then
        cp "$PROJECT_ROOT/front-end/.env.local" "$BACKUP_DIR/config/frontend.env"
        print_status "Frontend environment file backed up"
    fi
}

# Backup PM2 configuration
backup_pm2_config() {
    print_section "BACKING UP PM2 CONFIGURATION"
    
    mkdir -p "$BACKUP_DIR/config"
    
    if [ -f "$PROJECT_ROOT/back-end/ecosystem.config.js" ]; then
        cp "$PROJECT_ROOT/back-end/ecosystem.config.js" "$BACKUP_DIR/config/backend-ecosystem.config.js"
    fi
    
    if [ -f "$PROJECT_ROOT/front-end/ecosystem.config.js" ]; then
        cp "$PROJECT_ROOT/front-end/ecosystem.config.js" "$BACKUP_DIR/config/frontend-ecosystem.config.js"
    fi
    
    # PM2 process list
    pm2 jlist > "$BACKUP_DIR/config/pm2-processes.json" 2>/dev/null || true
    
    print_status "PM2 configuration backed up"
}

# Backup nginx configuration
backup_nginx_config() {
    print_section "BACKING UP NGINX CONFIGURATION"
    
    mkdir -p "$BACKUP_DIR/config"
    
    if [ -f "/etc/nginx/sites-available/watch-party" ]; then
        sudo cp "/etc/nginx/sites-available/watch-party" "$BACKUP_DIR/config/nginx-watch-party.conf"
        print_status "Nginx configuration backed up"
    else
        print_warning "Nginx configuration not found"
    fi
}

# Backup SSL certificates
backup_ssl_certs() {
    print_section "BACKING UP SSL CERTIFICATES"
    
    mkdir -p "$BACKUP_DIR/ssl"
    
    for domain in "be-watch-party.brahim-elhouss.me" "watch-party.brahim-elhouss.me"; do
        local cert_dir="/etc/letsencrypt/live/$domain"
        if [ -d "$cert_dir" ]; then
            sudo cp -r "$cert_dir" "$BACKUP_DIR/ssl/"
            print_status "SSL certificates for $domain backed up"
        else
            print_warning "SSL certificates for $domain not found"
        fi
    done
}

# Create backup info file
create_backup_info() {
    print_section "CREATING BACKUP INFO"
    
    cat > "$BACKUP_DIR/backup-info.txt" << EOF
Watch Party Backup Information
==============================

Backup Date: $(date)
Backup Directory: $BACKUP_DIR
Project Root: $PROJECT_ROOT

Components Backed Up:
- Database (SQLite)
- Media files
- Environment configuration
- PM2 configuration
- Nginx configuration
- SSL certificates

System Information:
- Hostname: $(hostname)
- OS: $(lsb_release -d | cut -f2)
- Kernel: $(uname -r)
- Uptime: $(uptime -p)

Services Status at Backup Time:
$(systemctl is-active nginx redis-watchparty 2>/dev/null || echo "Service status check failed")

PM2 Process Status:
$(pm2 list 2>/dev/null || echo "PM2 status check failed")

Git Information:
$(cd $PROJECT_ROOT && git log -1 --oneline 2>/dev/null || echo "Git info unavailable")
EOF
    
    print_status "Backup info file created"
}

# Compress backup
compress_backup() {
    print_section "COMPRESSING BACKUP"
    
    local archive_name="watch-party-backup-$DATE.tar.gz"
    local archive_path="$BACKUP_ROOT/$archive_name"
    
    cd "$BACKUP_ROOT"
    tar -czf "$archive_name" "$DATE"
    
    # Calculate size
    local size=$(du -h "$archive_path" | cut -f1)
    print_status "Backup compressed: $archive_path ($size)"
    
    # Remove uncompressed directory
    rm -rf "$BACKUP_DIR"
    print_status "Temporary files cleaned up"
    
    echo "$archive_path"
}

# Clean old backups
clean_old_backups() {
    print_section "CLEANING OLD BACKUPS"
    
    local keep_days=${1:-7}
    local deleted_count=0
    
    find "$BACKUP_ROOT" -name "watch-party-backup-*.tar.gz" -mtime +$keep_days -type f | while read -r file; do
        rm "$file"
        print_status "Deleted old backup: $(basename "$file")"
        ((deleted_count++))
    done
    
    print_status "Cleanup completed (kept backups from last $keep_days days)"
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_section "RESTORING FROM BACKUP"
    print_warning "This will overwrite existing files. Are you sure? (y/N)"
    read -r response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    local temp_dir="/tmp/watch-party-restore-$$"
    mkdir -p "$temp_dir"
    
    print_status "Extracting backup..."
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local restore_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "20*" | head -1)
    
    if [ ! -d "$restore_dir" ]; then
        print_error "Invalid backup archive"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Stop services
    print_status "Stopping services..."
    watch-party stop 2>/dev/null || true
    
    # Restore database
    if [ -f "$restore_dir/db.sqlite3" ]; then
        cp "$restore_dir/db.sqlite3" "$PROJECT_ROOT/back-end/db.sqlite3"
        print_status "Database restored"
    fi
    
    # Restore media files
    if [ -d "$restore_dir/media" ]; then
        rm -rf "$PROJECT_ROOT/back-end/media"
        cp -r "$restore_dir/media" "$PROJECT_ROOT/back-end/media"
        print_status "Media files restored"
    fi
    
    # Restore environment files
    if [ -f "$restore_dir/config/backend.env" ]; then
        cp "$restore_dir/config/backend.env" "$PROJECT_ROOT/back-end/.env"
        print_status "Backend environment restored"
    fi
    
    if [ -f "$restore_dir/config/frontend.env" ]; then
        cp "$restore_dir/config/frontend.env" "$PROJECT_ROOT/front-end/.env.local"
        print_status "Frontend environment restored"
    fi
    
    # Restore PM2 configurations
    if [ -f "$restore_dir/config/backend-ecosystem.config.js" ]; then
        cp "$restore_dir/config/backend-ecosystem.config.js" "$PROJECT_ROOT/back-end/ecosystem.config.js"
    fi
    
    if [ -f "$restore_dir/config/frontend-ecosystem.config.js" ]; then
        cp "$restore_dir/config/frontend-ecosystem.config.js" "$PROJECT_ROOT/front-end/ecosystem.config.js"
    fi
    
    # Clean up
    rm -rf "$temp_dir"
    
    print_status "Restore completed. Start services with: watch-party start"
}

# List available backups
list_backups() {
    print_section "AVAILABLE BACKUPS"
    
    if [ ! -d "$BACKUP_ROOT" ]; then
        print_warning "No backup directory found: $BACKUP_ROOT"
        return
    fi
    
    local count=0
    find "$BACKUP_ROOT" -name "watch-party-backup-*.tar.gz" -type f | sort -r | while read -r file; do
        local size=$(du -h "$file" | cut -f1)
        local date=$(basename "$file" | sed 's/watch-party-backup-\(.*\).tar.gz/\1/')
        local formatted_date=$(echo "$date" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
        echo "$formatted_date ($size) - $file"
        ((count++))
    done
    
    if [ $count -eq 0 ]; then
        print_warning "No backups found"
    else
        print_status "Found $count backup(s)"
    fi
}

# Main function
main() {
    case "${1:-backup}" in
        backup)
            create_backup_dir
            backup_database
            backup_media
            backup_env_files
            backup_pm2_config
            backup_nginx_config
            backup_ssl_certs
            create_backup_info
            local archive_path=$(compress_backup)
            clean_old_backups 7
            
            print_section "BACKUP COMPLETE"
            print_status "Backup created: $archive_path"
            print_status "$(du -h "$archive_path" | cut -f1) total size"
            ;;
        restore)
            if [ -z "$2" ]; then
                print_error "Please provide backup file path"
                echo "Usage: $0 restore /path/to/backup.tar.gz"
                exit 1
            fi
            restore_backup "$2"
            ;;
        list)
            list_backups
            ;;
        clean)
            local days=${2:-7}
            clean_old_backups "$days"
            ;;
        *)
            echo "Usage: $0 {backup|restore|list|clean} [options]"
            echo ""
            echo "Commands:"
            echo "  backup              - Create a new backup"
            echo "  restore <file>      - Restore from backup file"
            echo "  list                - List available backups"
            echo "  clean [days]        - Clean backups older than N days (default: 7)"
            echo ""
            echo "Examples:"
            echo "  $0 backup"
            echo "  $0 restore /home/ubuntu/backups/watch-party/watch-party-backup-20250107_120000.tar.gz"
            echo "  $0 list"
            echo "  $0 clean 30"
            exit 1
            ;;
    esac
}

# Check if running as correct user
if [ "$USER" != "ubuntu" ] && [ "$USER" != "root" ]; then
    print_warning "This script should be run as ubuntu user or root"
fi

# Create backup root directory
mkdir -p "$BACKUP_ROOT"

# Run main function
main "$@"
