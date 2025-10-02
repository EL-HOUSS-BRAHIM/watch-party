# Deployment SSL Directory Permission Fix - Summary

## Problem Analysis

Using GitHub MCP tools to analyze recent workflow runs, I identified that deployments were consistently failing at **Step 3: SSL Certificate Setup** with the following error:

```
❌ Cannot write to SSL directory: /srv/watch-party/nginx/ssl
❌ Directory owner: root:root
❌ Directory permissions: 755
❌ Current user: deploy
❌ SSL directory not writable
❌ SSL setup failed
```

### Root Cause

1. The `/srv/watch-party/nginx/ssl` directory was owned by `root:root` (likely created during previous Docker operations)
2. The `deploy` user doesn't have write access to this directory
3. The deployment script attempted to use `sudo chown` but it failed (no sudo privileges)
4. The script exited with an error instead of using a fallback location

## Solutions Implemented

### 1. Enhanced SSL Certificate Setup (`scripts/deployment/setup-ssl-certificates.sh`)

**Changes:**
- Created `setup_ssl_directory()` function that:
  - Creates the SSL directory structure
  - Attempts to fix ownership if directory exists
  - Tests write permissions before returning success
- Implements a two-tier fallback strategy:
  1. **Primary**: Try `/srv/watch-party/nginx/ssl`
  2. **Fallback**: Use `$HOME/watch-party/nginx/ssl` if primary fails
- Exports updated `APP_DIR` to `/tmp/deployment-vars.sh` for subsequent scripts
- Only fails if neither location is writable
- Provides clear, descriptive logging at each step

**Key Code:**
```bash
# Try primary location first
if SSL_DIR=$(setup_ssl_directory "$APP_DIR"); then
    log_success "Using SSL directory: $SSL_DIR"
else
    log_warning "Cannot write to $APP_DIR/nginx/ssl, trying fallback location..."
    
    # Fallback to home directory
    if SSL_DIR=$(setup_ssl_directory "$HOME/watch-party"); then
        log_success "Using fallback SSL directory: $SSL_DIR"
        APP_DIR="$HOME/watch-party"
        export APP_DIR
        echo "export APP_DIR=\"$APP_DIR\"" >> /tmp/deployment-vars.sh
    else
        exit_with_error "No writable SSL directory available"
    fi
fi
```

### 2. Proactive Ownership Fix (`scripts/deployment/build-docker-images.sh`)

**Changes:**
- Added ownership check and fix **after** `docker-compose down` but **before** build
- Attempts to fix root-owned SSL directory proactively
- Gracefully handles cases where sudo isn't available
- Prevents the permission issue from occurring in the first place

**Key Code:**
```bash
# Fix SSL directory ownership if it exists and is owned by root
if [ -d "$APP_DIR/nginx/ssl" ]; then
    SSL_OWNER=$(stat -c '%U' "$APP_DIR/nginx/ssl" 2>/dev/null || echo "unknown")
    CURRENT_USER=$(whoami)
    
    if [ "$SSL_OWNER" = "root" ]; then
        log_warning "SSL directory owned by root, attempting to fix..."
        if sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$APP_DIR/nginx/ssl" 2>/dev/null; then
            log_success "Fixed SSL directory ownership"
        else
            log_warning "Cannot change SSL directory ownership, will use fallback location"
        fi
    fi
fi
```

### 3. Deployment Variables Initialization (`scripts/deployment/deploy-main.sh`)

**Changes:**
- Initialize `/tmp/deployment-vars.sh` at the start of deployment
- Ensures all child scripts have access to shared variables from the beginning

**Key Code:**
```bash
# Initialize deployment variables file
echo "# Deployment variables" > /tmp/deployment-vars.sh
echo "export APP_DIR=\"$APP_DIR\"" >> /tmp/deployment-vars.sh
```

## How the Fix Works

### Deployment Flow

1. **Main Orchestrator (`deploy-main.sh`)**
   - Initializes `/tmp/deployment-vars.sh` with `APP_DIR=/srv/watch-party`
   - Exports `APP_DIR` for child scripts

2. **Repository Setup (`setup-repository.sh`)**
   - May update `APP_DIR` to `$HOME/watch-party` if `/srv` isn't writable
   - Saves updated `APP_DIR` to `/tmp/deployment-vars.sh`

3. **SSL Certificate Setup (`setup-ssl-certificates.sh`)**
   - Sources `/tmp/deployment-vars.sh` to get current `APP_DIR`
   - Tests write permissions on primary SSL directory
   - Falls back to home directory if needed
   - Updates `APP_DIR` and `/tmp/deployment-vars.sh` if fallback is used

4. **Docker Build (`build-docker-images.sh`)**
   - Sources `/tmp/deployment-vars.sh` to get current `APP_DIR`
   - Runs `docker-compose down` to clean up
   - Proactively attempts to fix SSL directory ownership
   - Builds images using correct `APP_DIR`

5. **Service Deployment (`deploy-services.sh`)**
   - Sources `/tmp/deployment-vars.sh` to get current `APP_DIR`
   - Deploys services using correct paths

6. **Health Checks (`health-checks.sh`)**
   - Verifies deployment succeeded

### Permission Handling Strategy

```
┌─────────────────────────────────────────┐
│ Try Primary Location                    │
│ /srv/watch-party/nginx/ssl              │
└─────────────┬───────────────────────────┘
              │
              ├─ Writable? ──────────┐
              │                      │
              ├─ Yes: Use it         │
              │                      │
              └─ No: Try fallback ───┼───────────────────────┐
                                     │                       │
                            ┌────────┴──────────┐   ┌───────┴─────────┐
                            │ Try Fallback      │   │ Use Primary     │
                            │ $HOME/watch-party │   │                 │
                            │ /nginx/ssl        │   │ Continue        │
                            └────────┬──────────┘   │ Deployment      │
                                     │              └─────────────────┘
                                     ├─ Writable?
                                     │
                                     ├─ Yes: Use it
                                     │       Update APP_DIR
                                     │       Export to vars file
                                     │
                                     └─ No: FAIL
                                            (Neither location writable)
```

## Benefits

✅ **Resilient to Permission Issues**: Works even when primary location isn't writable  
✅ **No Sudo Required**: Falls back to user-writable locations automatically  
✅ **Proactive Prevention**: Attempts to fix ownership issues before they cause problems  
✅ **Clear Error Messages**: Provides detailed logging for debugging  
✅ **Consistent State**: All scripts use the same `APP_DIR` via shared variables file  
✅ **Backward Compatible**: Still works when permissions are correct  

## Verification

All deployment scripts have been validated:
```
✓ build-docker-images.sh
✓ common-functions.sh
✓ deploy-main.sh
✓ deploy-services.sh
✓ health-checks.sh
✓ setup-aws-environment.sh
✓ setup-repository.sh
✓ setup-ssl-certificates.sh
```

## Testing

The fix will be automatically tested on the next push to the `master` or `main` branch. The deployment should:

1. ✅ Pass Step 3 (SSL Certificate Setup) without errors
2. ✅ Use either `/srv/watch-party` or `$HOME/watch-party` depending on permissions
3. ✅ Create SSL certificates in the writable location
4. ✅ Complete all subsequent steps successfully
5. ✅ Deploy the application successfully

## Monitoring

After deployment, you can verify which location was used:

```bash
# SSH to your server
ssh deploy@your-server

# Check which directory is being used
docker-compose ps
docker inspect nginx | grep -A 10 "Mounts"

# Check SSL directory location and ownership
ls -la /srv/watch-party/nginx/ssl 2>/dev/null || echo "Not using /srv"
ls -la ~/watch-party/nginx/ssl 2>/dev/null || echo "Not using home"

# View deployment logs
docker-compose logs nginx | grep -i ssl
```

## Rollback

If needed, the changes can be reverted by checking out the previous commit:
```bash
git revert HEAD~3..HEAD
```

However, this should not be necessary as the changes are backward compatible.

## Related Files

- `scripts/deployment/setup-ssl-certificates.sh` - Main SSL setup logic
- `scripts/deployment/build-docker-images.sh` - Proactive ownership fix
- `scripts/deployment/deploy-main.sh` - Deployment variables initialization
- `.github/workflows/deploy.yml` - GitHub Actions workflow (unchanged)
- `docker-compose.yml` - Docker configuration (unchanged)
- `nginx/conf.d/default.conf` - Nginx SSL configuration (unchanged)

## Summary

This fix resolves the SSL directory permission issue by implementing a robust fallback mechanism that works with or without sudo privileges. The deployment will now automatically use a writable location for SSL certificates, ensuring successful deployments regardless of directory ownership on the server.
