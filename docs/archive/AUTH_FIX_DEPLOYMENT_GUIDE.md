# Authentication Fix - Deployment Guide

**Date:** October 12, 2025  
**Issue:** Users can't log in - redirected back to login page after successful authentication  
**Root Cause:** API routes removed + nginx routing all /api/ to backend = no cookie management  
**Solution:** Re-add minimal auth API routes + update nginx config

---

## Overview

This fix addresses the authentication issue by:
1. Re-adding Next.js API routes for authentication endpoints only
2. Updating nginx to route `/api/auth/` to frontend for cookie management
3. Keeping all other `/api/` routes going directly to backend

---

## Files Changed

### Frontend API Routes (NEW)
- `frontend/app/api/auth/login/route.ts`
- `frontend/app/api/auth/logout/route.ts`
- `frontend/app/api/auth/session/route.ts`
- `frontend/app/api/auth/refresh/route.ts`

### Frontend Libraries (UPDATED)
- `frontend/lib/api-client.ts` - Routes auth endpoints through frontend API
- `frontend/lib/auth.ts` - Uses `/api/auth/session` for session validation

### Nginx Configuration (UPDATED)
- `nginx/conf.d/default.conf` - Added `/api/auth/` location block

---

## Deployment Steps

### 1. Update Frontend

```bash
# SSH into production server
ssh user@production-server

# Navigate to project directory
cd /path/to/watch-party

# Pull latest changes
git pull origin main

# Navigate to frontend directory
cd frontend

# Install dependencies (if package.json changed)
npm install

# Build the frontend
npm run build

# Restart Next.js
pm2 restart watchparty-frontend
# OR
sudo systemctl restart watchparty-frontend
```

### 2. Update Nginx Configuration

```bash
# Navigate to nginx config directory
cd /path/to/watch-party/nginx

# Backup current config
sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup

# Copy new config
sudo cp conf.d/default.conf /etc/nginx/conf.d/default.conf

# Test nginx configuration
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Reload Nginx

```bash
# Reload nginx without dropping connections
sudo nginx -s reload

# OR restart nginx
sudo systemctl restart nginx
```

---

## Verification Steps

### 1. Test Login API Endpoint

```bash
# Test that login goes through Next.js API route
curl -X POST https://watch-party.brahim-elhouss.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' \
  -c cookies.txt -v 2>&1 | grep -E "Set-Cookie|HTTP/2"
```

**Expected Results:**
- HTTP status: `200 OK`
- Response should NOT contain `access_token` or `refresh_token` in JSON
- Response headers should contain:
  ```
  Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=Lax
  Set-Cookie: refresh_token=...; Path=/; HttpOnly; SameSite=Lax
  ```

### 2. Test Session Endpoint

```bash
# Test session validation with cookies
curl https://watch-party.brahim-elhouss.me/api/auth/session \
  -b cookies.txt -v
```

**Expected Results:**
- HTTP status: `200 OK`
- Response body:
  ```json
  {
    "authenticated": true,
    "user": {
      "id": "...",
      "email": "admin@watchparty.local",
      ...
    }
  }
  ```

### 3. Test Dashboard Access

```bash
# Test dashboard with cookies
curl https://watch-party.brahim-elhouss.me/dashboard \
  -b cookies.txt -v
```

**Expected Results:**
- HTTP status: `200 OK`
- Should NOT redirect to login page
- Should load dashboard content

### 4. Browser Test

1. Open https://watch-party.brahim-elhouss.me/auth/login
2. Open Developer Tools → Network tab
3. Enter credentials: `admin@watchparty.local` / `admin123!`
4. Click "Sign in"
5. Verify in Network tab:
   - POST to `/api/auth/login` returns 200 OK
   - Response does NOT contain tokens in JSON
   - Cookies tab shows `access_token` and `refresh_token` (HTTP-only)
6. Verify redirect to `/dashboard` works
7. Verify dashboard loads without redirecting to login

---

## Troubleshooting

### Issue: Still redirects to login after successful authentication

**Possible causes:**
1. Nginx config not updated - check with `sudo nginx -t`
2. Nginx not reloaded - restart with `sudo nginx -s reload`
3. Frontend not rebuilt - run `npm run build` in frontend directory
4. Browser cache - clear browser cookies and try again

**Verify nginx is routing correctly:**
```bash
# Check nginx config has auth location BEFORE general api location
sudo grep -A 5 "location /api/auth/" /etc/nginx/conf.d/default.conf
sudo grep -A 5 "location /api/" /etc/nginx/conf.d/default.conf
```

### Issue: Cookies not being set

**Possible causes:**
1. Backend not accessible from Next.js
2. BACKEND_URL environment variable not set correctly
3. CORS issues with backend

**Check Next.js logs:**
```bash
pm2 logs watchparty-frontend
# OR
journalctl -u watchparty-frontend -f
```

Look for errors like:
- "Login proxy error"
- "Failed to connect to backend"
- CORS errors

**Verify backend URL:**
```bash
# Check Next.js environment variables
cat frontend/.env.production | grep API_URL
```

Should be:
```
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
```

### Issue: 502 Bad Gateway

**Possible causes:**
1. Frontend not running
2. Frontend crashed during startup
3. Port 3000 not accessible

**Check frontend status:**
```bash
pm2 status watchparty-frontend
# OR
sudo systemctl status watchparty-frontend
```

**Check frontend logs:**
```bash
pm2 logs watchparty-frontend --lines 50
```

---

## Rollback Plan

If issues occur after deployment:

### 1. Rollback Nginx
```bash
sudo cp /etc/nginx/conf.d/default.conf.backup /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo nginx -s reload
```

### 2. Rollback Frontend
```bash
cd /path/to/watch-party
git checkout HEAD~1 frontend/
cd frontend
npm run build
pm2 restart watchparty-frontend
```

---

## Architecture

### Before (Broken)

```
Browser
  ↓
  POST /api/auth/login
  ↓
  Nginx → Backend (Django) directly
  ↓
  Backend returns JSON with tokens
  ↓
  Browser receives tokens in JSON (INSECURE!)
  ↓
  No cookies set on frontend domain
  ↓
  Session validation fails
  ↓
  Redirect to login ❌
```

### After (Fixed)

```
Browser
  ↓
  POST /api/auth/login
  ↓
  Nginx → Frontend (Next.js API route)
  ↓
  Next.js → Backend (Django)
  ↓
  Backend returns JSON with tokens
  ↓
  Next.js sets HTTP-only cookies
  ↓
  Next.js returns safe JSON (no tokens)
  ↓
  Browser receives response + cookies
  ↓
  Session validation works ✅
```

---

## Security Benefits

- ✅ Tokens stored as HTTP-only cookies (immune to XSS)
- ✅ Tokens never exposed to JavaScript
- ✅ SameSite=Lax prevents CSRF attacks
- ✅ Secure flag enabled in production (HTTPS only)
- ✅ Proper domain scoping

---

## Monitoring

After deployment, monitor:

1. **Login success rate** - Should be 100% for valid credentials
2. **Session persistence** - Users should stay logged in
3. **Dashboard access** - No redirects to login page
4. **Error logs** - No "Login proxy error" messages

---

## Related Documentation

- `AUTH_FIX_NGINX_ROUTING.md` - Detailed nginx routing explanation
- `AUTH_FIX_FRONTEND_CONFIG.md` - Original frontend config issue
- `API_ROUTES_REMOVAL.md` - Why API routes were removed (and why we brought some back)
- `AUTHENTICATION_FLOW_ANALYSIS.md` - Complete authentication flow documentation

---

## Support

If issues persist after following this guide:

1. Check Next.js logs: `pm2 logs watchparty-frontend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check Backend logs: `pm2 logs watchparty-backend`
4. Test with curl commands from verification section
5. Check browser console for errors

---

**Deployed by:** [Your Name]  
**Deployment Date:** [Date]  
**Verification Status:** [ ] Passed / [ ] Failed  
**Notes:** _Add any deployment notes here_
