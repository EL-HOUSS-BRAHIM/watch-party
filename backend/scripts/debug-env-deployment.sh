#!/bin/bash
# Debug script for environment file deployment issues
# Usage: ./debug-env-deployment.sh

set -euo pipefail

echo "🔍 Environment File Deployment Debug Script"
echo "==========================================="

DEPLOY_DIR="/var/www/watch-party-backend"
SERVICE_USER="www-data"

echo
echo "📂 Checking deployment directory structure:"
if [[ -d "$DEPLOY_DIR" ]]; then
    echo "✅ Deploy directory exists: $DEPLOY_DIR"
    ls -la "$DEPLOY_DIR/" | head -10
else
    echo "❌ Deploy directory missing: $DEPLOY_DIR"
fi

echo
echo "🔐 Checking environment file:"
if [[ -f "$DEPLOY_DIR/.env" ]]; then
    echo "✅ .env file exists"
    echo "File permissions: $(ls -la "$DEPLOY_DIR/.env")"
    echo "File size: $(wc -c < "$DEPLOY_DIR/.env") bytes"
    echo "Environment variables count: $(wc -l < "$DEPLOY_DIR/.env")"
    echo "First few variables (sanitized):"
    head -5 "$DEPLOY_DIR/.env" | sed 's/=.*/=***/' || true
else
    echo "❌ .env file missing"
fi

echo
echo "🔍 Checking for temporary/backup env files:"
find "$DEPLOY_DIR" -name "*.env*" -type f 2>/dev/null || echo "No env-related files found"

echo
echo "🔍 Checking /tmp for deployment artifacts:"
if [[ -d "/tmp/watchparty-deploy" ]]; then
    echo "Found deployment temp directory:"
    ls -la /tmp/watchparty-deploy/ | grep -E "(env|ENV)" || echo "No env files in temp directory"
else
    echo "No deployment temp directory found"
fi

echo
echo "👤 Checking file ownership and permissions:"
if [[ -f "$DEPLOY_DIR/.env" ]]; then
    echo "Environment file ownership and permissions:"
    stat "$DEPLOY_DIR/.env" || true
    
    echo "Directory permissions:"
    stat "$DEPLOY_DIR" || true
    
    echo "Can service user read the file?"
    sudo -u "$SERVICE_USER" test -r "$DEPLOY_DIR/.env" && echo "✅ Readable" || echo "❌ Not readable"
fi

echo
echo "🔧 Checking systemd service configuration:"
if [[ -f "/etc/systemd/system/watchparty-gunicorn.service" ]]; then
    echo "✅ Service file exists"
    echo "Environment file reference in service:"
    grep -n "EnvironmentFile" /etc/systemd/system/watchparty-gunicorn.service || echo "No EnvironmentFile directive found"
else
    echo "❌ Service file missing"
fi

echo
echo "📊 Recent deployment logs:"
echo "From journalctl (last 10 lines):"
sudo journalctl -u watchparty-gunicorn -n 10 --no-pager || true

echo
echo "🔍 SystemD environment validation:"
echo "Environment file path from service definition:"
sudo systemctl show watchparty-gunicorn --property=EnvironmentFiles || true

echo
echo "Debug complete!"
echo "==============="
echo
echo "Common issues and solutions:"
echo "1. File missing: Check deployment script rsync exclusions"
echo "2. Permission denied: Check file ownership (should be $SERVICE_USER:www-data 600)"
echo "3. Service can't read: Check directory permissions and SELinux/AppArmor"
echo "4. Wrong path: Verify DEPLOY_DIR variable and service EnvironmentFile directive"
