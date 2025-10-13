# Authentication Cookie Domain Fix - October 12, 2025

## Problem Identified ✅

### Issue
After successful login, users were immediately redirected back to the login page because authentication tokens weren't persisting in subsequent requests.

### Root Cause
**Cross-subdomain cookie issue**: The backend (`be-watch-party.brahim-elhouss.me`) was setting cookies without a domain parameter, which meant:
- Cookies were scoped to `be-watch-party.brahim-elhouss.me` only
- The frontend (`watch-party.brahim-elhouss.me`) couldn't access these cookies
- Subsequent API requests from the browser didn't include the authentication tokens
- Backend returned 401 Unauthorized when checking `/api/auth/profile/`

### Evidence
```bash
# Curl test showed cookies were being set:
< set-cookie: access_token=eyJ...; HttpOnly; SameSite=Lax; Secure; Path=/
< set-cookie: refresh_token=eyJ...; HttpOnly; SameSite=Lax; Secure; Path=/
```

But Playwright browser test showed:
- Login POST returned 200 ✅
- Redirect to dashboard happened ✅
- GET `/api/auth/profile/` returned 401 ❌
- User redirected back to login ❌

## Solution Implemented ✅

### Changes Made
Updated `backend/apps/authentication/views.py` to set `domain='.brahim-elhouss.me'` on all cookie operations:

#### 1. LoginView - Set cookie domain for login
```python
response.set_cookie(
    key='access_token',
    value=str(access_token),
    max_age=60 * 60,  # 60 minutes
    httponly=True,
    secure=True,
    samesite='Lax',
    domain='.brahim-elhouss.me',  # ← NEW: Allow subdomain sharing
    path='/',
)
```

#### 2. RegisterView - Set cookie domain for registration
```python
response.set_cookie(
    key='access_token',
    value=str(access_token),
    max_age=60 * 60,
    httponly=True,
    secure=True,
    samesite='Lax',
    domain='.brahim-elhouss.me',  # ← NEW
    path='/',
)
```

#### 3. CustomTokenRefreshView - Set cookie domain for token refresh
```python
response.set_cookie(
    key='access_token',
    value=access_token,
    max_age=60 * 60,
    httponly=True,
    secure=True,
    samesite='Lax',
    domain='.brahim-elhouss.me',  # ← NEW
    path='/',
)
```

#### 4. LogoutView - Delete cookies with domain parameter
```python
response.delete_cookie('access_token', domain='.brahim-elhouss.me', path='/')
response.delete_cookie('refresh_token', domain='.brahim-elhouss.me', path='/')
```

### How It Works

With `domain='.brahim-elhouss.me'`:
1. Backend at `be-watch-party.brahim-elhouss.me` sets cookies
2. Cookies are accessible to all `*.brahim-elhouss.me` subdomains
3. Frontend at `watch-party.brahim-elhouss.me` can now access the cookies
4. Browser automatically includes cookies in requests to `be-watch-party.brahim-elhouss.me`
5. Authentication persists! ✅

## Architecture Overview

### Before Fix ❌
```
User → watch-party.brahim-elhouss.me (Frontend)
         ↓ POST /api/auth/login/
       be-watch-party.brahim-elhouss.me (Backend)
         ↓ Set-Cookie: access_token (no domain)
         ↓ Cookie scoped to: be-watch-party.brahim-elhouss.me only
       watch-party.brahim-elhouss.me
         ↓ GET /api/auth/profile/ (no cookies sent!)
       be-watch-party.brahim-elhouss.me
         ↓ 401 Unauthorized
       Redirect to login ❌
```

### After Fix ✅
```
User → watch-party.brahim-elhouss.me (Frontend)
         ↓ POST /api/auth/login/
       be-watch-party.brahim-elhouss.me (Backend)
         ↓ Set-Cookie: access_token; domain=.brahim-elhouss.me
         ↓ Cookie accessible to: *.brahim-elhouss.me
       watch-party.brahim-elhouss.me
         ↓ GET /api/auth/profile/ (cookies sent automatically!)
       be-watch-party.brahim-elhouss.me
         ↓ 200 OK with user data
       Dashboard loads successfully ✅
```

## Additional Changes

### Also Updated Frontend API Client
The frontend `lib/api-client.ts` already had the correct logic:
- `getCookie()` function to read cookies
- `Authorization: Bearer ${accessToken}` header added to requests
- `credentials: 'include'` to send cookies with requests

This was already in place from a previous fix (AUTH_TOKEN_HEADER_FIX_OCT12.md).

### Removed Incorrect API Routes
Initially created Next.js API routes (`/app/api/auth/`) but removed them because:
- The architecture uses **direct backend calls**
- Frontend doesn't proxy requests through Next.js API routes
- Backend sets cookies directly via HTTP headers

## Testing

### Test with curl
```bash
curl -X POST https://be-watch-party.brahim-elhouss.me/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' \
  -v 2>&1 | grep "set-cookie"
```

**Expected Output:**
```
< set-cookie: access_token=...; HttpOnly; SameSite=Lax; Secure; Domain=.brahim-elhouss.me; Path=/
< set-cookie: refresh_token=...; HttpOnly; SameSite=Lax; Secure; Domain=.brahim-elhouss.me; Path=/
```

### Test with Playwright (after deployment)
1. Navigate to `https://watch-party.brahim-elhouss.me/auth/login`
2. Fill in credentials
3. Submit form
4. Should see "Success! Redirecting..."
5. Should redirect to `/dashboard`
6. Dashboard should load (not redirect back to login)
7. Check cookies in browser DevTools:
   - `access_token` with Domain `.brahim-elhouss.me`
   - `refresh_token` with Domain `.brahim-elhouss.me`

## Files Modified

1. **`backend/apps/authentication/views.py`**
   - LoginView: Added `domain='.brahim-elhouss.me'` to cookie settings
   - RegisterView: Added `domain='.brahim-elhouss.me'` to cookie settings
   - CustomTokenRefreshView: Added `domain='.brahim-elhouss.me'` to cookie settings
   - CustomTokenRefreshView: Added logic to read refresh token from cookies
   - LogoutView: Added `domain='.brahim-elhouss.me'` to cookie deletion

## Security Considerations

### ✅ Maintained Security
- HTTP-only cookies (prevents XSS attacks)
- Secure flag (HTTPS only)
- SameSite=Lax (CSRF protection)
- Short-lived access tokens (60 minutes)
- Long-lived refresh tokens (7 days)

### ✅ Proper Domain Scoping
- Domain `.brahim-elhouss.me` allows:
  - `be-watch-party.brahim-elhouss.me` ✅
  - `watch-party.brahim-elhouss.me` ✅
  - `*.brahim-elhouss.me` ✅
- Domain does NOT allow:
  - `brahim-elhouss.me` (no subdomain)
  - `otherdomain.com` ❌
  - `malicious-brahim-elhouss.me.evil.com` ❌

## Deployment

### Commit
```bash
git add backend/apps/authentication/views.py
git commit -m "Fix: Set cookie domain to .brahim-elhouss.me for cross-subdomain auth"
git push origin master
```

### Auto-deployment
The backend should automatically deploy via GitHub Actions workflow.

### Verification After Deployment
Wait for deployment to complete (~2-5 minutes), then test the login flow.

## Next Steps

- ✅ Backend changes committed and pushed
- ⏳ Wait for automatic deployment
- ⏳ Test with Playwright after deployment
- ⏳ Verify cookies are shared across subdomains
- ⏳ Confirm authentication persists

## Related Documentation

- `AUTH_TOKEN_HEADER_FIX_OCT12.md` - Previous fix for Authorization header
- `SESSION_TOKEN_CONSISTENCY_FIX.md` - Token lifecycle documentation
- `AUTHENTICATION_FLOW_ANALYSIS.md` - Complete auth flow analysis

---

**Status**: Fix implemented and pushed. Waiting for deployment to test.

**Date**: October 12, 2025

**Commit**: dfef5be
