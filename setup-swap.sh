#!/bin/bash

# Swap Setup Script for Ubuntu Server
# Creates 4GB swap file and configures it to persist across reboots
# Best practices included: error checking, logging, and safe operations

set -euo pipefail  # Exit on error, undefined vars, pipe failures

SWAP_SIZE="4G"
SWAP_FILE="/swapfile"
LOG_FILE="/var/log/swap-setup.log"

# Ensure log file exists and is writable
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/swap-setup-$(date +%s).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE" 2>/dev/null || true
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE" 2>/dev/null || true
}

# Check if running as root or with sudo
check_privileges() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Check system requirements
check_system() {
    log "Checking system requirements..."
    
    # Check available disk space (need at least 5GB free for 4GB swap + buffer)
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    REQUIRED_SPACE=$((5 * 1024 * 1024))  # 5GB in KB
    
    if [[ $AVAILABLE_SPACE -lt $REQUIRED_SPACE ]]; then
        error "Insufficient disk space. Need at least 5GB free, have $(($AVAILABLE_SPACE / 1024 / 1024))GB"
        exit 1
    fi
    
    log "System check passed. Available space: $(($AVAILABLE_SPACE / 1024 / 1024))GB"
}

# Display current memory status
show_memory_status() {
    log "Current memory status:"
    free -h
    echo ""
}

# Check if swap file already exists
check_existing_swap() {
    if [[ -f "$SWAP_FILE" ]]; then
        warning "Swap file $SWAP_FILE already exists"
        
        # Check if it's already active
        if swapon --show | grep -q "$SWAP_FILE"; then
            log "Swap file is already active. Current swap status:"
            swapon --show
            
            read -p "Do you want to recreate the swap file? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "Exiting without changes"
                exit 0
            fi
            
            log "Deactivating existing swap file..."
            swapoff "$SWAP_FILE"
        fi
        
        log "Removing existing swap file..."
        rm "$SWAP_FILE"
    fi
}

# Create swap file
create_swap_file() {
    log "Creating ${SWAP_SIZE} swap file at $SWAP_FILE..."
    
    # Use fallocate for faster allocation (more efficient than dd)
    if command -v fallocate &> /dev/null; then
        fallocate -l "$SWAP_SIZE" "$SWAP_FILE"
        log "Swap file created using fallocate"
    else
        # Fallback to dd if fallocate is not available
        warning "fallocate not available, using dd (slower)"
        dd if=/dev/zero of="$SWAP_FILE" bs=1024 count=4194304 status=progress
        log "Swap file created using dd"
    fi
    
    # Verify file was created with correct size
    ACTUAL_SIZE=$(stat -c%s "$SWAP_FILE")
    EXPECTED_SIZE=$((4 * 1024 * 1024 * 1024))  # 4GB in bytes
    
    if [[ $ACTUAL_SIZE -ne $EXPECTED_SIZE ]]; then
        error "Swap file size mismatch. Expected: $EXPECTED_SIZE, Actual: $ACTUAL_SIZE"
        rm "$SWAP_FILE"
        exit 1
    fi
    
    log "Swap file created successfully with size: $(($ACTUAL_SIZE / 1024 / 1024 / 1024))GB"
}

# Configure swap file permissions and format
setup_swap_file() {
    log "Setting up swap file permissions and format..."
    
    # Set correct permissions (readable/writable by root only)
    chmod 600 "$SWAP_FILE"
    log "Permissions set to 600 (root only)"
    
    # Format as swap
    mkswap "$SWAP_FILE"
    log "Swap file formatted successfully"
}

# Activate swap
activate_swap() {
    log "Activating swap file..."
    swapon "$SWAP_FILE"
    log "Swap file activated successfully"
}

# Configure swap to persist across reboots
configure_persistent_swap() {
    log "Configuring swap to persist across reboots..."
    
    # Backup fstab
    cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
    log "Backed up /etc/fstab"
    
    # Add swap entry to fstab if not already present
    if ! grep -q "$SWAP_FILE" /etc/fstab; then
        echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
        log "Added swap entry to /etc/fstab"
    else
        log "Swap entry already exists in /etc/fstab"
    fi
}

# Optimize swap settings
optimize_swap_settings() {
    log "Optimizing swap settings..."
    
    # Set swappiness (how aggressively to use swap)
    # 10 = use swap only when necessary (good for servers)
    # 60 = default Ubuntu value
    SWAPPINESS=10
    
    # Set current swappiness
    sysctl vm.swappiness="$SWAPPINESS"
    log "Set swappiness to $SWAPPINESS (lower = less aggressive swapping)"
    
    # Set vfs_cache_pressure (how aggressively to reclaim cache)
    # 50 = less aggressive than default (100), good for servers
    VFS_CACHE_PRESSURE=50
    sysctl vm.vfs_cache_pressure="$VFS_CACHE_PRESSURE"
    log "Set vfs_cache_pressure to $VFS_CACHE_PRESSURE"
    
    # Make settings persistent
    SYSCTL_CONF="/etc/sysctl.d/99-swap-settings.conf"
    {
        echo "# Custom swap settings"
        echo "vm.swappiness=$SWAPPINESS"
        echo "vm.vfs_cache_pressure=$VFS_CACHE_PRESSURE"
    } > "$SYSCTL_CONF"
    log "Made swap settings persistent in $SYSCTL_CONF"
}

# Final verification
verify_setup() {
    log "Verifying swap setup..."
    
    echo "=== Final Memory Status ==="
    free -h
    echo ""
    
    echo "=== Active Swap Devices ==="
    swapon --show
    echo ""
    
    echo "=== Current Swap Settings ==="
    echo "Swappiness: $(cat /proc/sys/vm/swappiness)"
    echo "VFS Cache Pressure: $(cat /proc/sys/vm/vfs_cache_pressure)"
    echo ""
    
    # Test that swap entry exists in fstab
    if grep -q "$SWAP_FILE" /etc/fstab; then
        log "✓ Swap entry found in /etc/fstab - will persist across reboots"
    else
        error "✗ Swap entry not found in /etc/fstab"
        exit 1
    fi
    
    log "✓ Swap setup completed successfully!"
    log "✓ 4GB swap is now active and will persist across reboots"
    log "✓ Swap settings optimized for server use"
}

# Main execution
main() {
    log "Starting swap setup script..."
    log "Target swap size: $SWAP_SIZE"
    log "Swap file location: $SWAP_FILE"
    log "Log file location: $LOG_FILE"
    echo ""
    
    check_privileges
    check_system
    show_memory_status
    check_existing_swap
    create_swap_file
    setup_swap_file
    activate_swap
    configure_persistent_swap
    optimize_swap_settings
    verify_setup
    
    log "All operations completed successfully!"
    log "Log file saved to: $LOG_FILE"
}

# Run main function
main "$@"

