#!/bin/bash

# =============================================================================
# RDS PASSWORD SYNC SETUP SCRIPT
# =============================================================================
# Sets up automatic password synchronization from AWS Secrets Manager
# This ensures the backend always has the latest RDS password

set -e

# Source common functions and variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"
[ -f /tmp/deployment-vars.sh ] && source /tmp/deployment-vars.sh

APP_DIR="${APP_DIR:-$HOME/watch-party}"
cd "$APP_DIR"

log_info "Setting up RDS password sync..."

# Check if the sync script exists
if [[ ! -f "scripts/sync-rds-password.sh" ]]; then
    log_warning "sync-rds-password.sh not found, skipping password sync setup"
    exit 0
fi

# Make the sync script executable
chmod +x scripts/sync-rds-password.sh

# Check if the setup script exists
if [[ -f "scripts/setup-password-sync-cron.sh" ]]; then
    chmod +x scripts/setup-password-sync-cron.sh
    
    # Run the setup script
    log_info "Installing password sync cron job..."
    if bash scripts/setup-password-sync-cron.sh; then
        log_success "Password sync cron job installed successfully"
    else
        log_warning "Failed to install password sync cron job"
        log_info "You can manually install it later by running: cd $APP_DIR && bash scripts/setup-password-sync-cron.sh"
    fi
else
    # Fallback: add cron job manually
    log_info "Setting up password sync cron job manually..."
    
    # Create logs directory
    mkdir -p "$APP_DIR/logs"
    
    # Define the cron job
    CRON_JOB="0 * * * * cd $APP_DIR && ./scripts/sync-rds-password.sh >> $APP_DIR/logs/password-sync.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -F "sync-rds-password.sh" >/dev/null 2>&1; then
        log_info "Password sync cron job already exists"
    else
        # Add the cron job
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        log_success "Password sync cron job added successfully"
    fi
fi

# Run the sync script once to ensure the password is up to date
log_info "Running initial password sync..."
if bash scripts/sync-rds-password.sh; then
    log_success "Initial password sync completed"
else
    log_warning "Initial password sync failed (this is normal on first run)"
    log_info "The cron job will retry automatically every hour"
fi

log_success "RDS password sync setup completed"
