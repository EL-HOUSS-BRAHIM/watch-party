#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - BACKUP SCRIPT
# =============================================================================
# Handle all backup and restore operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"

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

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Generate backup filename
generate_backup_name() {
    local type="${1:-full}"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local hostname=$(hostname -s)
    echo "watchparty_${type}_backup_${hostname}_${timestamp}"
}

# Create full project backup
create_full_backup() {
    local compress="${1:-true}"
    local include_media="${2:-true}"
    local include_logs="${3:-false}"
    
    local backup_name=$(generate_backup_name "full")
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Creating full project backup: $backup_name"
    
    # Create temporary backup directory
    mkdir -p "$backup_path"
    
    # Create backup manifest
    cat > "$backup_path/backup_manifest.json" << EOF
{
    "backup_type": "full",
    "timestamp": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "project_root": "$PROJECT_ROOT",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "django_version": "$(python -c 'import django; print(django.get_version())' 2>/dev/null || echo 'unknown')",
    "python_version": "$(python --version 2>&1)",
    "include_media": $include_media,
    "include_logs": $include_logs,
    "compressed": $compress
}
EOF
    
    # Backup source code (excluding sensitive files)
    log_info "Backing up source code..."
    rsync -av \
        --exclude='.git/' \
        --exclude='venv/' \
        --exclude='__pycache__/' \
        --exclude='*.pyc' \
        --exclude='.env' \
        --exclude='.env.local' \
        --exclude='node_modules/' \
        --exclude='staticfiles/' \
        --exclude='media/' \
        --exclude='logs/' \
        --exclude='backups/' \
        "$PROJECT_ROOT/" "$backup_path/source/"
    
    # Backup database
    log_info "Backing up database..."
    mkdir -p "$backup_path/database"
    
    if [[ -f "db.sqlite3" ]]; then
        cp "db.sqlite3" "$backup_path/database/"
        log_success "SQLite database backed up"
    else
        # Try PostgreSQL backup
        if command -v pg_dump &> /dev/null; then
            if [[ -n "$DATABASE_URL" ]]; then
                pg_dump "$DATABASE_URL" > "$backup_path/database/postgresql_dump.sql"
                log_success "PostgreSQL database backed up"
            else
                log_warning "DATABASE_URL not set, skipping PostgreSQL backup"
            fi
        else
            log_warning "No database backup method available"
        fi
    fi
    
    # Backup environment configuration (sanitized)
    log_info "Backing up configuration..."
    mkdir -p "$backup_path/config"
    
    # Copy .env.example and other config files
    [[ -f ".env.example" ]] && cp ".env.example" "$backup_path/config/"
    [[ -f "requirements.txt" ]] && cp "requirements.txt" "$backup_path/config/"
    [[ -f "nginx.conf" ]] && cp "nginx.conf" "$backup_path/config/"
    [[ -f "docker-compose.yml" ]] && cp "docker-compose.yml" "$backup_path/config/"
    
    # Create sanitized environment file
    if [[ -f ".env" ]]; then
        grep -E '^[A-Z_]+=.*$' .env | \
        sed 's/=.*SECRET.*=.*/=***REDACTED***/g' | \
        sed 's/=.*PASSWORD.*=.*/=***REDACTED***/g' | \
        sed 's/=.*KEY.*=.*/=***REDACTED***/g' | \
        sed 's/=.*TOKEN.*=.*/=***REDACTED***/g' \
        > "$backup_path/config/env_sanitized.txt"
    fi
    
    # Backup media files if requested
    if [[ "$include_media" == "true" ]] && [[ -d "media" ]]; then
        log_info "Backing up media files..."
        cp -r "media" "$backup_path/"
        log_success "Media files backed up"
    fi
    
    # Backup logs if requested
    if [[ "$include_logs" == "true" ]] && [[ -d "logs" ]]; then
        log_info "Backing up log files..."
        cp -r "logs" "$backup_path/"
        log_success "Log files backed up"
    fi
    
    # Backup installed packages
    log_info "Backing up Python packages..."
    pip freeze > "$backup_path/config/requirements_frozen.txt"
    
    # Create backup notes
    cat > "$backup_path/README.md" << EOF
# Watch Party Backend Backup

Created: $(date)
Backup Type: Full Project Backup
Hostname: $(hostname)
User: $(whoami)

## Contents

- \`source/\` - Complete project source code
- \`database/\` - Database backup
- \`config/\` - Configuration files and requirements
$([ "$include_media" == "true" ] && echo "- \`media/\` - User uploaded media files")
$([ "$include_logs" == "true" ] && echo "- \`logs/\` - Application log files")

## Restoration

To restore this backup:

1. Extract the backup archive
2. Copy source files to project directory
3. Restore database from database/ folder
4. Configure environment variables
5. Install requirements: \`pip install -r config/requirements_frozen.txt\`
6. Run migrations: \`python manage.py migrate\`

## Security Note

Sensitive configuration values have been redacted for security.
You will need to reconfigure API keys, secrets, and passwords.
EOF
    
    # Compress if requested
    if [[ "$compress" == "true" ]]; then
        log_info "Compressing backup..."
        cd "$BACKUP_DIR"
        tar -czf "${backup_name}.tar.gz" "$backup_name/"
        rm -rf "$backup_name"
        backup_file="${backup_name}.tar.gz"
        log_success "Backup compressed: $backup_file"
    else
        backup_file="$backup_name"
        log_success "Backup created: $backup_file"
    fi
    
    # Show backup info
    local backup_full_path="$BACKUP_DIR/$backup_file"
    local backup_size=$(du -sh "$backup_full_path" | cut -f1)
    
    echo
    log_success "Full backup completed!"
    echo "  📁 Location: $backup_full_path"
    echo "  📏 Size: $backup_size"
    echo "  🕐 Created: $(date)"
    echo
}

# Create database-only backup
create_db_backup() {
    local backup_name=$(generate_backup_name "database")
    local backup_path="$BACKUP_DIR/${backup_name}.sql"
    
    log_info "Creating database backup: $backup_name"
    
    if [[ -f "db.sqlite3" ]]; then
        # SQLite backup
        sqlite3 db.sqlite3 ".dump" > "$backup_path"
        log_success "SQLite database backup created: $backup_path"
    elif command -v pg_dump &> /dev/null && [[ -n "$DATABASE_URL" ]]; then
        # PostgreSQL backup
        pg_dump "$DATABASE_URL" > "$backup_path"
        log_success "PostgreSQL database backup created: $backup_path"
    else
        log_error "No database backup method available"
        return 1
    fi
    
    # Compress database backup
    gzip "$backup_path"
    log_success "Database backup compressed: ${backup_path}.gz"
    
    local backup_size=$(du -sh "${backup_path}.gz" | cut -f1)
    echo "  📏 Size: $backup_size"
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    local force="${2:-false}"
    
    if [[ -z "$backup_file" ]]; then
        log_error "Please specify backup file to restore"
        list_backups
        return 1
    fi
    
    # Find backup file
    local backup_path=""
    if [[ -f "$backup_file" ]]; then
        backup_path="$backup_file"
    elif [[ -f "$BACKUP_DIR/$backup_file" ]]; then
        backup_path="$BACKUP_DIR/$backup_file"
    else
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Confirm restore
    if [[ "$force" != "true" && "$FORCE" != "true" ]]; then
        echo -e "${YELLOW}⚠️  This will replace the current project data!${NC}"
        echo "Backup file: $backup_path"
        read -p "Are you sure you want to restore? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Restore cancelled"
            return 0
        fi
    fi
    
    log_info "Restoring from backup: $(basename "$backup_path")"
    
    # Create restore working directory
    local restore_dir="/tmp/watchparty_restore_$$"
    mkdir -p "$restore_dir"
    
    # Extract backup
    if [[ "$backup_path" == *.tar.gz ]]; then
        log_info "Extracting compressed backup..."
        tar -xzf "$backup_path" -C "$restore_dir"
        local extracted_dir=$(ls "$restore_dir" | head -1)
        local backup_content="$restore_dir/$extracted_dir"
    else
        local backup_content="$backup_path"
    fi
    
    # Check backup manifest
    if [[ -f "$backup_content/backup_manifest.json" ]]; then
        log_info "Reading backup manifest..."
        cat "$backup_content/backup_manifest.json"
        echo
    fi
    
    # Restore source code
    if [[ -d "$backup_content/source" ]]; then
        log_info "Restoring source code..."
        rsync -av "$backup_content/source/" "$PROJECT_ROOT/"
        log_success "Source code restored"
    fi
    
    # Restore database
    if [[ -d "$backup_content/database" ]]; then
        log_info "Restoring database..."
        
        if [[ -f "$backup_content/database/db.sqlite3" ]]; then
            cp "$backup_content/database/db.sqlite3" "$PROJECT_ROOT/"
            log_success "SQLite database restored"
        elif [[ -f "$backup_content/database/postgresql_dump.sql" ]]; then
            if command -v psql &> /dev/null && [[ -n "$DATABASE_URL" ]]; then
                psql "$DATABASE_URL" < "$backup_content/database/postgresql_dump.sql"
                log_success "PostgreSQL database restored"
            else
                log_error "Cannot restore PostgreSQL database"
            fi
        fi
    fi
    
    # Restore media files
    if [[ -d "$backup_content/media" ]]; then
        log_info "Restoring media files..."
        cp -r "$backup_content/media" "$PROJECT_ROOT/"
        log_success "Media files restored"
    fi
    
    # Restore configuration
    if [[ -d "$backup_content/config" ]]; then
        log_info "Configuration files available in backup"
        log_warning "Please manually review and restore configuration files:"
        ls -la "$backup_content/config/"
    fi
    
    # Cleanup
    rm -rf "$restore_dir"
    
    log_success "Restore completed!"
    log_warning "Please review configuration and run migrations if needed"
    echo "  Next steps:"
    echo "  1. Review .env configuration"
    echo "  2. Install requirements: pip install -r requirements.txt"
    echo "  3. Run migrations: python manage.py migrate"
    echo "  4. Collect static files: python manage.py collectstatic"
}

# Restore database only
restore_database() {
    local backup_file="$1"
    local force="${2:-false}"
    
    if [[ -z "$backup_file" ]]; then
        log_error "Please specify database backup file"
        return 1
    fi
    
    # Find backup file
    local backup_path=""
    if [[ -f "$backup_file" ]]; then
        backup_path="$backup_file"
    elif [[ -f "$BACKUP_DIR/$backup_file" ]]; then
        backup_path="$BACKUP_DIR/$backup_file"
    else
        log_error "Database backup file not found: $backup_file"
        return 1
    fi
    
    # Confirm restore
    if [[ "$force" != "true" && "$FORCE" != "true" ]]; then
        echo -e "${YELLOW}⚠️  This will replace the current database!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Database restore cancelled"
            return 0
        fi
    fi
    
    log_info "Restoring database from: $(basename "$backup_path")"
    
    if [[ "$backup_path" == *.gz ]]; then
        # Decompress and restore
        if [[ "$backup_path" == *sqlite* ]]; then
            zcat "$backup_path" | sqlite3 db.sqlite3
            log_success "SQLite database restored"
        else
            zcat "$backup_path" | psql "$DATABASE_URL"
            log_success "PostgreSQL database restored"
        fi
    else
        # Direct restore
        if [[ "$backup_path" == *sqlite* ]]; then
            sqlite3 db.sqlite3 < "$backup_path"
            log_success "SQLite database restored"
        else
            psql "$DATABASE_URL" < "$backup_path"
            log_success "PostgreSQL database restored"
        fi
    fi
}

# List available backups
list_backups() {
    log_info "Available backups in $BACKUP_DIR:"
    echo
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        log_warning "No backups found"
        return 0
    fi
    
    # List backups with details
    echo "Date       Time     Type     Size     Filename"
    echo "---------- -------- -------- -------- ------------------------"
    
    for backup in "$BACKUP_DIR"/*; do
        if [[ -f "$backup" ]]; then
            local filename=$(basename "$backup")
            local size=$(du -sh "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1)
            local time=$(stat -c %y "$backup" | cut -d' ' -f2 | cut -d'.' -f1)
            local type="unknown"
            
            if [[ "$filename" == *_full_* ]]; then
                type="full"
            elif [[ "$filename" == *_database_* ]]; then
                type="database"
            fi
            
            printf "%-10s %-8s %-8s %-8s %s\n" "$date" "$time" "$type" "$size" "$filename"
        fi
    done
    
    echo
    echo "To restore a backup: ./manage.sh restore <filename>"
}

# Clean old backups
clean_old_backups() {
    local keep_days="${1:-30}"
    
    log_info "Cleaning backups older than $keep_days days..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_info "No backup directory found"
        return 0
    fi
    
    local deleted_count=0
    while IFS= read -r -d '' backup; do
        if [[ -f "$backup" ]]; then
            rm "$backup"
            log_info "Deleted: $(basename "$backup")"
            ((deleted_count++))
        fi
    done < <(find "$BACKUP_DIR" -type f -mtime +$keep_days -print0)
    
    if [[ $deleted_count -eq 0 ]]; then
        log_info "No old backups to delete"
    else
        log_success "Deleted $deleted_count old backup(s)"
    fi
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        backup|full)
            local compress="true"
            local include_media="true"
            local include_logs="false"
            
            # Parse options
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --no-compress)
                        compress="false"
                        shift
                        ;;
                    --no-media)
                        include_media="false"
                        shift
                        ;;
                    --include-logs)
                        include_logs="true"
                        shift
                        ;;
                    *)
                        break
                        ;;
                esac
            done
            
            create_full_backup "$compress" "$include_media" "$include_logs"
            ;;
        db-backup|database)
            create_db_backup "$@"
            ;;
        restore)
            restore_backup "$@"
            ;;
        db-restore|restore-db)
            restore_database "$@"
            ;;
        list|ls)
            list_backups "$@"
            ;;
        clean|cleanup)
            clean_old_backups "$@"
            ;;
        help|--help|-h)
            echo "Backup Script Commands:"
            echo "  backup, full            Create full project backup"
            echo "    --no-compress         Don't compress the backup"
            echo "    --no-media            Exclude media files"
            echo "    --include-logs        Include log files"
            echo "  db-backup, database     Create database-only backup"
            echo "  restore <file>          Restore from backup"
            echo "  db-restore <file>       Restore database only"
            echo "  list, ls                List available backups"
            echo "  clean [days]            Clean old backups (default: 30 days)"
            ;;
        *)
            log_error "Unknown backup command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
