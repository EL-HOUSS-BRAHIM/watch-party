#!/bin/bash

# Setup RDS Password Sync via Cron (No sudo required)
# This script sets up automatic password rotation handling for AWS RDS using cron

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

log "Setting up Watch Party RDS Password Sync via Cron..."

# Ensure we're in the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check if required files exist
if [[ ! -f "scripts/sync-rds-password.sh" ]]; then
    error "sync-rds-password.sh not found"
    exit 1
fi

# Make sure the sync script is executable
chmod +x scripts/sync-rds-password.sh

# Create a log directory
mkdir -p "$PROJECT_ROOT/logs"

# Add cron job to run every hour
CRON_JOB="0 * * * * cd $PROJECT_ROOT && ./scripts/sync-rds-password.sh >> $PROJECT_ROOT/logs/password-sync.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -F "sync-rds-password.sh" >/dev/null 2>&1; then
    log "Cron job already exists, updating it..."
    # Remove old cron job
    crontab -l 2>/dev/null | grep -v "sync-rds-password.sh" | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

log "✅ RDS Password Sync Cron Job installed successfully!"
log ""
log "The sync script will:"
log "  - Run every hour to check for password changes"
log "  - Automatically update backend .env file"
log "  - Restart backend services when needed"
log "  - Log output to: $PROJECT_ROOT/logs/password-sync.log"
log ""
log "Manual commands:"
log "  - Run sync now: cd $PROJECT_ROOT && ./scripts/sync-rds-password.sh"
log "  - View logs: tail -f $PROJECT_ROOT/logs/password-sync.log"
log "  - List cron jobs: crontab -l"
log "  - Remove cron job: crontab -e (then delete the line with sync-rds-password.sh)"
log ""
log "Testing the sync script now..."
./scripts/sync-rds-password.sh
