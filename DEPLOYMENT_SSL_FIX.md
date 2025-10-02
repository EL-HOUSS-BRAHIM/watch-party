# Deployment SSL Permission Fix

## Problem
After implementing the modular deployment architecture in PR #53, deployments began failing with SSL directory permission errors.

## Error Details
```
❌ Cannot write to SSL directory: /srv/watch-party/nginx/ssl
❌ Directory owner: root:root
❌ Directory permissions: 755
```

## Root Cause
The `nginx/ssl` directory was owned by `root:root`, preventing the `deploy` user from writing SSL certificates. This occurred because:
1. Previous Docker deployments mounted volumes as root
2. Manual operations may have changed ownership
3. The nginx container runs as root and created directories

## Analysis Using GitHub MCP

Used GitHub MCP tools to analyze deployment failures:
- Examined workflow run #972 (most recent failure)
- Reviewed logs from runs #971, #970, #969, #968
- Identified pattern: SSL permission errors after modular deployment
- Compared with run #963 (last successful deployment)

## Solution

### 1. Enhanced `scripts/deployment/setup-ssl-certificates.sh`

Added ownership detection and fixing logic:
```bash
# Check ownership before attempting writes
CURRENT_OWNER=$(stat -c '%U' "$SSL_DIR" 2>/dev/null || echo "unknown")
CURRENT_USER=$(whoami)

if [ "$CURRENT_OWNER" != "$CURRENT_USER" ] && [ "$CURRENT_OWNER" != "unknown" ]; then
    log_warning "SSL directory owned by $CURRENT_OWNER, attempting to fix..."
    
    # Try to fix ownership with sudo
    if sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$SSL_DIR" 2>/dev/null; then
        log_success "Fixed SSL directory ownership"
    else
        log_warning "Cannot change ownership with sudo, trying direct access..."
    fi
fi

# Also fix nginx parent directory
NGINX_OWNER=$(stat -c '%U' "$APP_DIR/nginx" 2>/dev/null || echo "unknown")
if [ "$NGINX_OWNER" != "$CURRENT_USER" ] && [ "$NGINX_OWNER" != "unknown" ]; then
    sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$APP_DIR/nginx" 2>/dev/null
fi
```

### 2. Updated `.gitignore`
Added `nginx/ssl/` to prevent committing SSL certificates to the repository.

## Benefits

1. **Automatic Recovery**: Script detects and fixes ownership issues automatically
2. **Better Diagnostics**: Clear error messages show who owns what
3. **Graceful Degradation**: Falls back if sudo unavailable
4. **Security**: SSL certificates no longer tracked in git

## Testing

To test the fix:
```bash
# Simulate root-owned directory
sudo mkdir -p /srv/watch-party/nginx/ssl
sudo chown -R root:root /srv/watch-party/nginx/ssl

# Run the fixed script
cd /srv/watch-party
bash scripts/deployment/setup-ssl-certificates.sh

# Should see:
# ⚠️  SSL directory owned by root, attempting to fix...
# ✅ Fixed SSL directory ownership
# ✅ SSL certificate setup complete
```

## Related Files
- `scripts/deployment/setup-ssl-certificates.sh` - Main fix
- `.gitignore` - Exclude SSL certificates
- `docker-compose.yml` - Nginx volume mount configuration

## See Also
- `DEPLOYMENT_FIX_SUMMARY.md` - Original SSH timeout fix
- `scripts/deployment/README.md` - Deployment architecture documentation
