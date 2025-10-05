#!/bin/bash

# Install RDS Password Sync Service
# This script sets up automatic password rotation handling for AWS RDS

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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root"
    error "Run as the deploy user: ./scripts/install-password-sync.sh"
    exit 1
fi

# Check if we can sudo
if ! sudo -n true 2>/dev/null; then
    error "This script requires sudo access"
    error "Make sure the deploy user can run sudo commands"
    exit 1
fi

log "Installing Watch Party RDS Password Sync Service..."

# Ensure we're in the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check if required files exist
if [[ ! -f "scripts/sync-rds-password.sh" ]]; then
    error "sync-rds-password.sh not found"
    exit 1
fi

if [[ ! -f "scripts/watchparty-password-sync.service" ]]; then
    error "watchparty-password-sync.service not found"
    exit 1
fi

if [[ ! -f "scripts/watchparty-password-sync.timer" ]]; then
    error "watchparty-password-sync.timer not found"
    exit 1
fi

# Make sure the sync script is executable
chmod +x scripts/sync-rds-password.sh

# Copy systemd service files
log "Installing systemd service files..."
sudo cp scripts/watchparty-password-sync.service /etc/systemd/system/
sudo cp scripts/watchparty-password-sync.timer /etc/systemd/system/

# Set proper permissions
sudo chmod 644 /etc/systemd/system/watchparty-password-sync.service
sudo chmod 644 /etc/systemd/system/watchparty-password-sync.timer

# Reload systemd
log "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable and start the timer
log "Enabling password sync timer..."
sudo systemctl enable watchparty-password-sync.timer
sudo systemctl start watchparty-password-sync.timer

# Show status
log "Password sync service status:"
sudo systemctl status watchparty-password-sync.timer --no-pager

log "✅ RDS Password Sync Service installed successfully!"
log ""
log "The service will:"
log "  - Run every hour to check for password changes"
log "  - Run 5 minutes after boot"
log "  - Automatically update backend .env file"
log "  - Restart backend services when needed"
log ""
log "Manual commands:"
log "  - Run sync now: sudo systemctl start watchparty-password-sync.service"
log "  - Check status: sudo systemctl status watchparty-password-sync.timer"
log "  - View logs: sudo journalctl -u watchparty-password-sync.service -f"
log "  - Disable: sudo systemctl disable watchparty-password-sync.timer"