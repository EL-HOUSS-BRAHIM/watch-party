# Critical Auth Fix - Frontend API Configuration Issue

## Problem Identified

The authentication flow is broken in production because the frontend is configured to call the Django backend **directly** instead of going through the Next.js API routes.

### Current (Broken) Configuration:
```env
NEXT_PUBLIC_FRONTEND_API=https://be-watch-party.brahim-elhouss.me/api
```

This causes:
1. ✅ Login request goes directly to Django backend
2. ✅ Backend returns tokens in JSON response
3. ❌ **Tokens are exposed to client JavaScript** (security risk!)
4. ❌ **Tokens are NOT set as HTTP-only cookies**
5. ❌ Session validation fails (no cookies present)
6. ❌ User redirected back to login page

### Root Cause:

When `NEXT_PUBLIC_FRONTEND_API` is set to the backend URL, the `apiFetch` function in `/frontend/lib/api-client.ts` calls:

```
/auth/login -> https://be-watch-party.brahim-elhouss.me/api/auth/login
```

Instead of:

```
/auth/login -> https://watch-party.brahim-elhouss.me/api/auth/login (Next.js API route)
              -> https://be-watch-party.brahim-elhouss.me/api/auth/login (proxy to backend)
```

## Solution

### Option 1: Remove NEXT_PUBLIC_FRONTEND_API (Recommended)

**In production environment:**
```bash
# Remove or comment out this variable
# NEXT_PUBLIC_FRONTEND_API=https://be-watch-party.brahim-elhouss.me/api
```

This will use the default `/api` which routes to Next.js API routes.

### Option 2: Set to Relative Path

```env
NEXT_PUBLIC_FRONTEND_API=/api
```

This ensures requests go through Next.js API routes first.

## Implementation Steps

### 1. Update Production Environment Variables

SSH into production server:
```bash
ssh user@production-server
cd /path/to/watch-party/frontend
```

Edit the `.env.local` or `.env.production` file:
```bash
nano .env.production
```

Remove or comment out:
```env
# NEXT_PUBLIC_FRONTEND_API=https://be-watch-party.brahim-elhouss.me/api
```

Or change to:
```env
NEXT_PUBLIC_FRONTEND_API=/api
```

### 2. Rebuild Frontend

```bash
npm run build
```

### 3. Restart Next.js Application

```bash
pm2 restart watchparty-frontend
# OR
sudo systemctl restart watchparty-frontend
```

### 4. Verify the Fix

Test login:
```bash
# Should now work correctly
curl -X POST https://watch-party.brahim-elhouss.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}'  \
  -c cookies.txt -b cookies.txt
```

Check that cookies are set (you won't see tokens in response).

## Why This Matters

### Security Issue:
- **Current setup exposes JWT tokens to client JavaScript** (XSS vulnerability)
- HTTP-only cookies prevent JavaScript access (secure)

### Correct Flow:

```
Browser
  ↓
  POST /api/auth/login (Next.js API Route)
  ↓
  Forwards to Django Backend
  ↓
  Django returns {access_token, refresh_token, user}
  ↓
  Next.js sets HTTP-only cookies
  ↓
  Next.js returns {success, user} (NO TOKENS)
  ↓
  Browser receives response
  ↓
  Cookies sent automatically on future requests
```

### Current (Broken) Flow:

```
Browser
  ↓
  POST directly to Django Backend
  ↓
  Django returns {access_token, refresh_token, user}
  ↓
  Browser receives tokens in JSON
  ↓
  NO COOKIES SET
  ↓
  Session check fails
  ↓
  Redirected to login
```

## Additional Files to Check

### .env files that might have this variable:
- `frontend/.env`
- `frontend/.env.local`
- `frontend/.env.production`
- `frontend/.env.production.local`

### Deployment scripts that might set it:
- Any CI/CD configuration
- Docker compose files
- Deployment scripts

## Testing After Fix

1. **Clear browser cookies**
2. **Navigate to login page**
3. **Open browser DevTools > Network tab**
4. **Login with credentials**
5. **Check the response:**
   - Should see: `{success: true, user: {...}}`
   - Should NOT see: `access_token` or `refresh_token` in response
6. **Check cookies:**
   - Should have `access_token` cookie (HTTP-only)
   - Should have `refresh_token` cookie (HTTP-only)
7. **Navigate to dashboard:**
   - Should load successfully
   - Should NOT redirect to login

## Related Files

- `/frontend/lib/api-client.ts` - API client configuration
- `/frontend/app/api/auth/login/route.ts` - Next.js API route
- `/frontend/app/api/auth/session/route.ts` - Session validation
- `/frontend/app/auth/login/page.tsx` - Login page component

## Summary

**DO NOT** set `NEXT_PUBLIC_FRONTEND_API` to point directly to the backend in production. This bypasses the Next.js API routes that handle secure cookie management.

**Correct configuration:**
- Development: `NEXT_PUBLIC_FRONTEND_API=/api` (or unset)
- Production: `NEXT_PUBLIC_FRONTEND_API=/api` (or unset)

The backend URL should ONLY be set in the Next.js API routes server-side environment variable `BACKEND_URL`, never exposed to the client via `NEXT_PUBLIC_*`.
