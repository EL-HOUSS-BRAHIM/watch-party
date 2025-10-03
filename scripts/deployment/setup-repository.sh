#!/bin/bash

# =============================================================================
# REPOSITORY SETUP SCRIPT
# =============================================================================
# Handles git repository cloning/updating and directory permissions

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common-functions.sh"

APP_NAME=watch-party
APP_DIR="${APP_DIR:-/srv/$APP_NAME}"

log_info "Setting up repository at $APP_DIR"

detect_target_branch() {
    # Honour explicit override first
    if [ -n "$DEPLOY_BRANCH" ]; then
        echo "$DEPLOY_BRANCH"
        return
    fi

    # Try to detect the remote's default branch
    local default_branch
    if default_branch=$(git remote show origin 2>/dev/null | awk '/HEAD branch/ {print $NF}'); then
        if [ -n "$default_branch" ] && git rev-parse --verify "origin/$default_branch" >/dev/null 2>&1; then
            echo "$default_branch"
            return
        fi
    fi

    # Common defaults
    for candidate in main master; do
        if git rev-parse --verify "origin/$candidate" >/dev/null 2>&1; then
            echo "$candidate"
            return
        fi
    done

    # Fallback to first remote branch if available
    default_branch=$(git branch -r | sed -n 's| *origin/||p' | head -n1)
    if [ -n "$default_branch" ]; then
        echo "$default_branch"
        return
    fi

    # Last resort
    echo main
}

# Clone or update repo
if [ ! -d "$APP_DIR" ]; then
    log_info "Cloning repository..."
    git clone https://github.com/EL-HOUSS-BRAHIM/watch-party.git $APP_DIR
    cd $APP_DIR
else
    log_info "Updating repository..."
    cd $APP_DIR
    git fetch origin
fi

TARGET_BRANCH=$(detect_target_branch)
log_info "Using branch: $TARGET_BRANCH"

if ! git checkout "$TARGET_BRANCH" 2>/dev/null; then
    log_info "Checking out tracking branch origin/$TARGET_BRANCH"
    git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH"
fi

git reset --hard "origin/$TARGET_BRANCH"

log_info "Checking directory permissions..."

# Check if deploy user owns the directory
if [ "$(stat -c '%U' $APP_DIR 2>/dev/null)" != "deploy" ]; then
    log_warning "Application directory not owned by deploy user"
    
    # Try to fix with sudo
    if sudo chown -R deploy:deploy $APP_DIR 2>/dev/null; then
        log_success "Fixed directory ownership"
    else
        log_warning "Cannot change ownership, using alternative directory..."
        
        # Use home directory as fallback
        OLD_APP_DIR="$APP_DIR"
        APP_DIR="$HOME/watch-party"
        
        log_info "Switching to: $APP_DIR"
        
        if [ -d "$OLD_APP_DIR" ]; then
            rm -rf "$APP_DIR" 2>/dev/null || true
            cp -r "$OLD_APP_DIR" "$APP_DIR"
            cd "$APP_DIR"
            git fetch origin 2>/dev/null || true
            if git rev-parse --verify "origin/$TARGET_BRANCH" >/dev/null 2>&1; then
                git checkout "$TARGET_BRANCH" 2>/dev/null || git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH" 2>/dev/null || true
                git reset --hard "origin/$TARGET_BRANCH" 2>/dev/null || true
            fi
        else
            if [ ! -d "$APP_DIR" ]; then
                git clone https://github.com/EL-HOUSS-BRAHIM/watch-party.git $APP_DIR
            else
                cd $APP_DIR
                git fetch origin
                if git rev-parse --verify "origin/$TARGET_BRANCH" >/dev/null 2>&1; then
                    git checkout "$TARGET_BRANCH" 2>/dev/null || git checkout -B "$TARGET_BRANCH" "origin/$TARGET_BRANCH" 2>/dev/null || true
                    git reset --hard "origin/$TARGET_BRANCH"
                fi
            fi
            cd $APP_DIR
        fi
        
        # Export new APP_DIR for other scripts
        export APP_DIR
        log_success "Using writable directory: $APP_DIR"
    fi
else
    log_success "Directory ownership is correct"
fi

# Save APP_DIR to a temp file for other scripts to source
echo "export APP_DIR='$APP_DIR'" > /tmp/deployment-vars.sh
echo "export TARGET_BRANCH='$TARGET_BRANCH'" >> /tmp/deployment-vars.sh

log_success "Repository setup complete"
