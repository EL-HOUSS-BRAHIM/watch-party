# Frame Security Revert Guide

**Date Created:** October 15, 2025  
**Purpose:** Instructions to revert frame-ancestors and CORS settings back to secure configuration

## Overview

On October 15, 2025, frame security was temporarily disabled to allow the site to be embedded in iframes from any domain. This document provides instructions to restore the secure configuration.

---

## Changes That Were Made (To Allow All Framing)

### 1. Frontend - `/frontend/next.config.mjs`
- Changed `frame-ancestors 'none'` to `frame-ancestors *`
- Changed `X-Frame-Options: DENY` to `X-Frame-Options: ALLOWALL`

### 2. Nginx - `/nginx/conf.d/default.conf`
- Changed `X-Frame-Options DENY` to `X-Frame-Options ALLOWALL`

### 3. Django Backend - `/backend/config/settings/base.py`
- Changed `X_FRAME_OPTIONS = 'DENY'` to `X_FRAME_OPTIONS = 'ALLOWALL'`

### 4. Django Production - `/backend/config/settings/production.py`
- Changed `CORS_ALLOW_ALL_ORIGINS = False` to `CORS_ALLOW_ALL_ORIGINS = True`

---

## How to Revert to Secure Configuration

### Step 1: Frontend Security Headers

**File:** `/home/bross/watch-party/frontend/next.config.mjs`

Find and replace:
```javascript
// CURRENT (INSECURE):
              "frame-ancestors *",

// CHANGE TO (SECURE):
              "frame-ancestors 'none'",
```

And:
```javascript
// CURRENT (INSECURE):
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },

// CHANGE TO (SECURE):
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
```

### Step 2: Nginx Security Headers

**File:** `/home/bross/watch-party/nginx/conf.d/default.conf`

Find and replace:
```nginx
# CURRENT (INSECURE):
    add_header X-Frame-Options ALLOWALL always;

# CHANGE TO (SECURE):
    add_header X-Frame-Options DENY always;
```

### Step 3: Django Base Settings

**File:** `/home/bross/watch-party/backend/config/settings/base.py`

Find and replace:
```python
# CURRENT (INSECURE):
X_FRAME_OPTIONS = 'ALLOWALL'

# CHANGE TO (SECURE):
X_FRAME_OPTIONS = 'DENY'
```

### Step 4: Django Production CORS Settings

**File:** `/home/bross/watch-party/backend/config/settings/production.py`

Find and replace:
```python
# CURRENT (INSECURE):
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# CHANGE TO (SECURE):
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
```

---

## Alternative: Allow Specific Domains Only

If you want to allow framing from specific trusted domains instead of blocking all or allowing all:

### Option A: Specific Domains in CSP (Frontend)

**File:** `/home/bross/watch-party/frontend/next.config.mjs`

```javascript
// Allow framing from specific domains only:
"frame-ancestors 'self' https://trusted-domain.com https://another-trusted.com",
```

### Option B: Specific Domains in Django Settings

**File:** `/home/bross/watch-party/backend/config/settings/production.py`

```python
# Keep specific origins only
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me,http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
```

### Option C: Use Environment Variables

Add to `.env` file:
```bash
# Comma-separated list of allowed origins
CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://trusted-domain.com

# Comma-separated list of CSRF trusted origins
CSRF_TRUSTED_ORIGINS=https://watch-party.brahim-elhouss.me,https://trusted-domain.com
```

---

## Deployment Steps After Reverting

### 1. Rebuild Frontend
```bash
cd frontend
npm run build
# or if using Docker:
docker-compose build frontend
```

### 2. Restart Backend Services
```bash
# If using Docker:
docker-compose restart backend

# If using PM2:
pm2 restart all
```

### 3. Reload Nginx
```bash
# If using Docker:
docker-compose restart nginx

# If on server directly:
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Clear Browser Cache
After deployment, users may need to clear their browser cache or do a hard refresh (Ctrl+Shift+R) to see the updated security headers.

---

## Verification

After reverting, verify the security headers are working:

### Check Headers with curl:
```bash
curl -I https://watch-party.brahim-elhouss.me/ | grep -i "x-frame-options\|content-security-policy"
```

Expected output:
```
X-Frame-Options: DENY
Content-Security-Policy: ... frame-ancestors 'none' ...
```

### Check in Browser DevTools:
1. Open the site in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Reload the page
5. Click on the main document request
6. Check the Response Headers
7. Verify `X-Frame-Options: DENY` is present
8. Verify CSP contains `frame-ancestors 'none'`

### Test Frame Blocking:
Try embedding the site in an iframe. It should be blocked with an error message like:
```
Refused to frame 'https://watch-party.brahim-elhouss.me/' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'none'".
```

---

## Security Best Practices

1. **Default to DENY**: Unless you have a specific business need, always keep frame-ancestors set to `'none'` or `'self'`

2. **Use Allowlist**: If you need to allow framing, specify exact trusted domains instead of using `*`

3. **Regular Audits**: Periodically review security headers and CORS settings

4. **Environment-Specific**: Use environment variables to manage different settings for dev/staging/prod

5. **Monitor Logs**: Watch for unusual framing attempts in your security logs

---

## Related Documentation

- [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Django CORS Settings](https://github.com/adamchainz/django-cors-headers)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

## Quick Revert Command

If you want to quickly revert all changes, you can use these sed commands (use with caution):

```bash
# Frontend
sed -i "s/frame-ancestors \*/frame-ancestors 'none'/g" frontend/next.config.mjs
sed -i "s/value: 'ALLOWALL'/value: 'DENY'/g" frontend/next.config.mjs

# Nginx
sed -i 's/X-Frame-Options ALLOWALL/X-Frame-Options DENY/g' nginx/conf.d/default.conf

# Django Base
sed -i "s/X_FRAME_OPTIONS = 'ALLOWALL'/X_FRAME_OPTIONS = 'DENY'/g" backend/config/settings/base.py

# Django Production
sed -i 's/CORS_ALLOW_ALL_ORIGINS = True/CORS_ALLOW_ALL_ORIGINS = False/g' backend/config/settings/production.py
```

Then rebuild and redeploy as described above.

---

**Last Updated:** October 15, 2025  
**Status:** Insecure configuration active - revert when framing no longer needed
