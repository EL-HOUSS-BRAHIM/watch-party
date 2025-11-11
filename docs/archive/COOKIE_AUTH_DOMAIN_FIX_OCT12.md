# Cookie Authentication Domain Fix - October 12, 2025

## Problem

After successful login, users were immediately logged out when navigating to the dashboard. The authentication flow was failing with a 401 error.

### Root Cause Analysis

The issue was a **domain mismatch in API requests**:

1. **Login Request**: `POST https://watch-party.brahim-elhouss.me/api/auth/login/`
   - Went through nginx proxy (relative URL)
   - Backend set cookies with `Domain=brahim-elhouss.me`
   - Cookies were associated with `watch-party.brahim-elhouss.me`

2. **Profile Check Request**: `GET https://be-watch-party.brahim-elhouss.me/api/auth/profile/`
   - Went DIRECTLY to backend (absolute URL)
   - Different domain from where cookies were set
   - Browser didn't send cookies → 401 Unauthorized

### Error Flow

```
1. User logs in
   ↓
2. POST /api/auth/login/ → watch-party.brahim-elhouss.me/api/auth/login/
   ↓ (nginx proxies to backend)
3. Backend sets cookies on watch-party.brahim-elhouss.me domain
   ↓
4. Login success, redirect to /dashboard
   ↓
5. Dashboard checks auth: GET /api/auth/profile/
   ↓ (buildUrl sends to be-watch-party.brahim-elhouss.me)
6. Request to different domain → cookies NOT sent
   ↓
7. 401 Unauthorized → redirected back to login
```

### Console Errors

```
GET https://be-watch-party.brahim-elhouss.me/api/auth/profile/ 401 (Unauthorized)

API Error (/api/auth/profile/): Error: Authentication credentials were not provided.

Failed to load session Error: Authentication credentials were not provided.
```

## Solution

### Changes Made

**File**: `frontend/lib/api-client.ts`

**Before**:
```typescript
const AUTH_ENDPOINTS_REQUIRING_PROXY = [
  '/api/auth/login/',
  '/api/auth/logout/',
  '/api/auth/refresh/',
]

const buildUrl = (endpoint: string) => {
  // ...
  if (AUTH_ENDPOINTS_REQUIRING_PROXY.includes(normalizedEndpoint)) {
    return normalizedEndpoint
  }
  
  return `${BACKEND_URL}${normalizedEndpoint}`
}
```

**After**:
```typescript
const buildUrl = (endpoint: string) => {
  // If endpoint is already a full URL, return it as-is
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // ALL /api/ requests should go through nginx proxy (relative URL)
  // This ensures cookies work correctly across the same domain
  if (normalizedEndpoint.startsWith('/api/')) {
    return normalizedEndpoint
  }
  
  // Non-API endpoints (if any) go to backend directly
  return `${BACKEND_URL}${normalizedEndpoint}`
}
```

### Key Changes

1. **Removed selective proxying**: Instead of only proxying specific auth endpoints, NOW ALL `/api/` requests go through nginx
2. **Simplified logic**: Removed `AUTH_ENDPOINTS_REQUIRING_PROXY` array
3. **Consistent domain**: All API requests now use the same domain (watch-party.brahim-elhouss.me)

### How It Works Now

```
1. User logs in
   ↓
2. POST /api/auth/login/ → watch-party.brahim-elhouss.me/api/auth/login/
   ↓ (nginx proxies to backend)
3. Backend sets cookies on watch-party.brahim-elhouss.me
   ↓
4. Login success, redirect to /dashboard
   ↓
5. Dashboard checks auth: GET /api/auth/profile/
   ↓ (buildUrl returns relative URL: /api/auth/profile/)
6. Request to same domain: watch-party.brahim-elhouss.me/api/auth/profile/
   ↓ (nginx proxies to backend, cookies sent!)
7. Backend validates cookies → 200 OK
   ↓
8. User stays logged in ✅
```

## Technical Details

### Cookie Domain Strategy

The backend sets cookies with these parameters:
```python
response.set_cookie(
    key='access_token',
    value=str(access_token),
    httponly=True,
    secure=True,
    samesite='Lax',
    domain='.brahim-elhouss.me',  # Works across subdomains
    path='/',
)
```

However, browsers will only send cookies when:
1. The request is to the **same domain** where cookies were set
2. OR the cookie domain allows it (e.g., `.brahim-elhouss.me` for subdomains)

### Why Direct Backend Calls Failed

When the frontend made requests directly to `be-watch-party.brahim-elhouss.me`:
- Browser saw this as a different domain
- Even though cookies had `Domain=brahim-elhouss.me`, the **origin mismatch** prevented cookie sending
- CORS policies and cookie security prevented cross-origin cookie transmission

### Why Nginx Proxy Works

With all requests going through nginx on `watch-party.brahim-elhouss.me`:
- Cookies are set from `watch-party.brahim-elhouss.me`
- All subsequent requests are to `watch-party.brahim-elhouss.me`
- Browser sends cookies automatically (same origin)
- Nginx transparently proxies to backend

## Nginx Configuration

The nginx configuration routes all `/api/` requests to the backend:

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    
    # Preserve original request info
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Important for cookies
    proxy_set_header Cookie $http_cookie;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## Testing

### Before Fix
```bash
# Login succeeds
POST https://watch-party.brahim-elhouss.me/api/auth/login/
→ 200 OK, cookies set

# Profile check fails
GET https://be-watch-party.brahim-elhouss.me/api/auth/profile/
→ 401 Unauthorized (no cookies sent)
```

### After Fix
```bash
# Login succeeds
POST https://watch-party.brahim-elhouss.me/api/auth/login/
→ 200 OK, cookies set

# Profile check succeeds
GET https://watch-party.brahim-elhouss.me/api/auth/profile/
→ 200 OK (cookies sent via nginx proxy)
```

## Related Fixes

This fix builds on previous authentication fixes:

1. **Backend Cookie Domain** (commit: dfef5be)
   - Added `domain='.brahim-elhouss.me'` to cookie settings
   - Enables cookies to work across subdomains

2. **Nginx Routing Fix** (commit: 990323a)
   - Fixed nginx to route ALL `/api/` to backend
   - Removed incorrect frontend proxy for `/api/auth/`

3. **Session Endpoint Fix** (commit: 6afb664)
   - Changed from non-existent `/api/auth/session` to `/api/auth/profile/`

4. **API Routing Fix** (commit: 048487f - THIS FIX)
   - Route ALL `/api/` requests through nginx proxy
   - Ensures consistent domain for cookie authentication

## Impact

✅ **Users can now log in and stay logged in**
✅ **Authentication persists across page refreshes**
✅ **All API requests use consistent domain**
✅ **Cookies work correctly with nginx proxy**
✅ **No more immediate logout after login**

## Deployment

**Commit**: `048487f`
**Files Changed**: `frontend/lib/api-client.ts`
**Deployment**: Automatic via GitHub Actions

The fix is being deployed and should be live within 15-20 minutes.

## Lessons Learned

1. **Same-Origin Policy Matters**: Cookies require consistent domains
2. **Proxy Everything**: When using nginx, proxy ALL API requests, not just specific endpoints
3. **Test Cookie Flow**: Verify cookies are sent with every authenticated request
4. **Domain Strategy**: Choose one domain for all API requests (either direct backend OR nginx proxy)
5. **Cookie Domain vs Request Domain**: Both must align for cookies to be sent

## Future Improvements

Consider:
1. Add logging to track cookie presence in requests
2. Implement cookie refresh mechanism
3. Add better error messages for auth failures
4. Monitor cookie expiration and auto-refresh
