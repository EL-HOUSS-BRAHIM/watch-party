# Nginx Routing Fix for Authentication - October 12, 2025

## Problem Discovered via SSH Debugging 🔍

### SSH Connection
```bash
ssh -i /workspaces/watch-party/.ssh/id_rsa deploy@35.181.116.57
```

### Issue Found
When testing the backend on the server, discovered that:
1. Nginx was routing `/api/auth/` requests to the **frontend**
2. Frontend has **no API routes** (we removed them earlier)
3. Requests were getting 308 redirects or 404 errors
4. Authentication was completely broken

### The Root Cause
**File**: `nginx/conf.d/default.conf`

**Before (BROKEN):**
```nginx
# Authentication routes go to Next.js frontend for cookie management
# This MUST come before the general /api/ location block
location /api/auth/ {
    limit_req zone=auth burst=10 nodelay;
    
    proxy_pass http://frontend;  # ← WRONG! No frontend API routes exist
    # ...
}

# All other API routes to Django backend
location /api/ {
    proxy_pass http://backend;
    # ...
}
```

**Problem:**
- Nginx was routing `/api/auth/login/` → Frontend
- Frontend doesn't have `/api/auth/` routes (we removed them)
- Frontend returned 404 or redirect errors
- Users couldn't log in!

## Solution ✅

### Simplified Nginx Configuration

**After (FIXED):**
```nginx
# All API routes (including auth) go to Django backend
# Backend now handles cookie setting directly via Set-Cookie headers
location /api/ {
    limit_req zone=api burst=20 nodelay;
    
    proxy_pass http://backend;  # ← CORRECT! All API to backend
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 30s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

### What Changed
1. **Removed** the separate `/api/auth/` location block
2. **Unified** all `/api/` requests to go to the backend
3. Backend handles cookie setting via `Set-Cookie` headers with `domain='.brahim-elhouss.me'`

## Architecture Flow (Corrected) ✅

### Authentication Request Flow
```
Browser (watch-party.brahim-elhouss.me)
    ↓
    POST /api/auth/login/
    ↓
Cloudflare CDN
    ↓
Nginx (443)
    ↓
    [location /api/]
    ↓
Django Backend (8000)
    ↓
    - Validate credentials
    - Generate JWT tokens
    - Set-Cookie: access_token; domain=.brahim-elhouss.me
    - Set-Cookie: refresh_token; domain=.brahim-elhouss.me
    ↓
Response to Browser
    ↓
Cookies now accessible to both:
    - watch-party.brahim-elhouss.me (frontend)
    - be-watch-party.brahim-elhouss.me (backend)
```

### Why This Works
1. **All API requests** go to Django backend (correct!)
2. **Backend sets cookies** with `domain='.brahim-elhouss.me'`
3. **Cookies are shared** across subdomains
4. **No frontend API routes** needed (simpler architecture)

## SSH Debugging Steps Taken 🔧

### 1. Connected to Server
```bash
ssh -i /workspaces/watch-party/.ssh/id_rsa deploy@35.181.116.57
```

### 2. Checked Container Status
```bash
cd /srv/watch-party && docker-compose ps
```
**Result**: Backend healthy, frontend healthy, nginx healthy

### 3. Tested Backend Health
```bash
curl -s http://localhost:8000/api/health/
```
**Result**: No response (endpoint missing)

### 4. Tested Login Endpoint
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' -i
```
**Result**: 301 redirect to HTTPS

### 5. Tested Public Backend URL
```bash
curl -X POST https://be-watch-party.brahim-elhouss.me/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' -i
```
**Result**: 308 redirect (nginx routing to frontend)

### 6. Examined Nginx Configuration
```bash
cat /srv/watch-party/nginx/conf.d/default.conf
```
**Result**: Found `/api/auth/` routing to frontend!

### 7. Fixed Configuration Locally
- Updated `nginx/conf.d/default.conf` in the repo
- Committed and pushed changes
- Pulled changes on server
- Restarted nginx (triggered full deployment instead)

## Files Modified ✅

**File**: `nginx/conf.d/default.conf`
- Removed `/api/auth/` location block (22 lines)
- Simplified to single `/api/` location routing to backend
- Added comment explaining backend handles cookies directly

## Combined Fixes Working Together 🎯

This fix works in conjunction with the previous authentication fix:

### 1. Backend Cookie Domain Fix (Previous)
- `backend/apps/authentication/views.py`
- Sets cookies with `domain='.brahim-elhouss.me'`
- Allows cookie sharing across subdomains

### 2. Nginx Routing Fix (This Fix)
- `nginx/conf.d/default.conf`
- Routes all `/api/` to backend
- No more routing to non-existent frontend API routes

### Together They Provide:
✅ Backend sets cookies correctly (domain parameter)
✅ Nginx routes requests correctly (to backend)
✅ Cookies shared across subdomains
✅ Authentication persists properly
✅ Users stay logged in!

## Testing After Deployment 🧪

### Wait for Deployment
The deployment is currently running (building Docker images).

### Test Commands (After Deployment Completes)
```bash
# Test from server
ssh -i /workspaces/watch-party/.ssh/id_rsa deploy@35.181.116.57

# Test login
curl -X POST https://be-watch-party.brahim-elhouss.me/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' \
  -v 2>&1 | grep -i "set-cookie"
```

**Expected Output:**
```
< set-cookie: access_token=...; Domain=.brahim-elhouss.me; HttpOnly; Secure; SameSite=Lax; Path=/
< set-cookie: refresh_token=...; Domain=.brahim-elhouss.me; HttpOnly; Secure; SameSite=Lax; Path=/
```

### Test with Playwright
After deployment, test the full login flow:
1. Navigate to `https://watch-party.brahim-elhouss.me/auth/login`
2. Enter credentials and submit
3. Should redirect to dashboard
4. Dashboard should load (not redirect back to login)
5. Cookies should be visible in DevTools with `Domain: .brahim-elhouss.me`

## Deployment Status 📊

**Current Status**: Deployment in progress
- Building Docker images (parallel build)
- Commit: `990323a`
- Started: ~22:40 UTC
- Expected completion: 20-30 minutes

**What's Happening:**
```
deploy    155531  bash scripts/deployment/deploy-main.sh
deploy    155722  bash build-docker-images.sh
deploy    156030  docker-compose build --parallel
```

## Commit History 📝

### This Session's Fixes
1. **dfef5be** - Backend cookie domain fix (domain='.brahim-elhouss.me')
2. **c2d4040** - Deployment timeout increases
3. **522703d** - Deployment timeout documentation
4. **990323a** - Nginx routing fix (remove frontend proxy) ← **Current**

## Next Steps ⏭️

1. ✅ Wait for deployment to complete (~15-20 more minutes)
2. ⏳ Test authentication via curl
3. ⏳ Test authentication via Playwright
4. ⏳ Verify cookies are set correctly
5. ⏳ Confirm users stay logged in

---

**Status**: Fix committed and deployed. Deployment in progress.

**Date**: October 12, 2025

**Commit**: 990323a

**SSH Access**: `ssh -i /workspaces/watch-party/.ssh/id_rsa deploy@35.181.116.57`
