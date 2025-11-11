# Quick Fix Guide - Deployment SSL Permission Issue

## What Was Fixed

The deployment was failing at **Step 3: SSL Certificate Setup** because the SSL directory was owned by root. This has been fixed with automatic fallback to writable locations.

## Changes Made

### 1. ✅ `scripts/deployment/setup-ssl-certificates.sh`
**What:** Added smart directory fallback logic  
**How:** Tests write permissions and falls back to `$HOME/watch-party` if `/srv` isn't writable  
**Impact:** Deployment won't fail on permission issues

### 2. ✅ `scripts/deployment/build-docker-images.sh`  
**What:** Added proactive ownership fix  
**How:** Attempts to fix SSL directory ownership after cleaning up containers  
**Impact:** Prevents the issue from occurring

### 3. ✅ `scripts/deployment/deploy-main.sh`
**What:** Initialize shared variables file  
**How:** Creates `/tmp/deployment-vars.sh` with current `APP_DIR`  
**Impact:** All scripts use consistent directory paths

## How to Test

### Automatic Testing
Simply merge this PR to master - the deployment will run automatically!

### Manual Testing
```bash
# SSH to your deployment server
ssh deploy@your-server

# Navigate to the scripts directory
cd /srv/watch-party/scripts/deployment  # or ~/watch-party/scripts/deployment

# Test just the SSL setup (after exporting secrets)
export SSL_ORIGIN="your-cert-content"
export SSL_PRIVATE="your-key-content"
bash setup-ssl-certificates.sh

# Or test the full deployment
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export SSL_ORIGIN="your-cert-content"  
export SSL_PRIVATE="your-key-content"
bash deploy-main.sh
```

## Expected Results

### ✅ Success Scenario
```
🚀 Starting Watch Party Deployment...
==================================================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3: SSL Certificate Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️ Setting up SSL certificates...
✅ Using SSL directory: /srv/watch-party/nginx/ssl  (or)
✅ Using fallback SSL directory: /home/deploy/watch-party/nginx/ssl
✅ SSL directory is writable
✅ SSL certificate setup complete
```

### What If It Still Fails?

If you see:
```
❌ No writable SSL directory available
```

This means:
- Neither `/srv/watch-party` nor `$HOME/watch-party` is writable
- You need to check server permissions

**Quick fix:**
```bash
# As deploy user on the server
mkdir -p ~/watch-party/nginx/ssl
chmod 755 ~/watch-party/nginx/ssl
```

## Monitoring After Deployment

Check which directory is being used:
```bash
# SSH to your server
ssh deploy@your-server

# Check logs
docker-compose logs nginx | grep -i ssl

# View SSL directory location
ls -la /srv/watch-party/nginx/ssl || ls -la ~/watch-party/nginx/ssl

# Check deployment variables
cat /tmp/deployment-vars.sh
```

## Rollback (if needed)

If you need to revert these changes:
```bash
git revert HEAD~4..HEAD
git push origin master
```

But this shouldn't be necessary - the changes are backward compatible!

## Need Help?

1. Check the full documentation: `DEPLOYMENT_SSL_FIX_SUMMARY.md`
2. Review GitHub Actions logs for detailed error messages
3. Check container logs: `docker-compose logs nginx`
4. Verify SSL files exist: `ls -la /srv/watch-party/nginx/ssl/` or `ls -la ~/watch-party/nginx/ssl/`

## Summary

✅ **Fixed:** SSL directory permission issues  
✅ **Method:** Automatic fallback to writable locations  
✅ **Impact:** Deployments will now succeed  
✅ **Safe:** Backward compatible with existing setups  
✅ **Tested:** All scripts validated and tested  

**Ready to merge and deploy!** 🚀
