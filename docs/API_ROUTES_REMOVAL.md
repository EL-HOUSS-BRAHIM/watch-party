# API Routes Removal - Frontend Direct Backend Access

## Summary

**Date:** October 12, 2025  
**Change:** Removed all Next.js API routes from the frontend and implemented direct backend API calls

## What Changed

### Before
- Frontend had API routes in `frontend/app/api/*` that acted as proxies to the backend
- Requests went: **Browser → Next.js API Route → Django Backend**
- Required both `BACKEND_URL` (server-side) and `NEXT_PUBLIC_API_URL` (client-side)
- More complex deployment and configuration

### After
- All API routes removed from `frontend/app/api/`
- Direct backend calls from browser using centralized API client
- Requests go: **Browser → Django Backend** (direct!)
- Only `NEXT_PUBLIC_API_URL` needed
- Simpler, faster, and more maintainable

## Files Removed

Deleted entire directory:
- `frontend/app/api/` (and all subdirectories)
  - `api/auth/login/route.ts`
  - `api/auth/register/route.ts`
  - `api/auth/logout/route.ts`
  - `api/auth/refresh/route.ts`
  - `api/auth/session/route.ts`
  - `api/parties/route.ts`
  - `api/parties/public/[code]/route.ts`
  - `api/health/route.ts`
  - `api/proxy/[...path]/route.ts`

## Files Modified

### Core API Client
- **`frontend/lib/api-client.ts`**
  - Removed `FRONTEND_API_BASE` and `BACKEND_PROXY_BASE` constants
  - Updated to use `NEXT_PUBLIC_API_URL` directly
  - Removed `useBackend` parameter from `apiFetch` function
  - All API calls now go directly to backend

### Auth Library
- **`frontend/lib/auth.ts`**
  - Updated `fetchSession()` to use `authApi.getProfile()` instead of `/api/auth/session`
  - Updated `performLogout()` to use `authApi.logout()` instead of `/api/auth/logout`

### Components
- **`frontend/components/mobile/MobileMenu.tsx`**
  - Replaced `fetch("/api/auth/logout")` with `authApi.logout()`

- **`frontend/components/mobile/MobileNavigation.tsx`**
  - Replaced `fetch("/api/notifications/unread-count")` with `notificationsApi.getUnreadCount()`

- **`frontend/components/layout/dashboard-header.tsx`**
  - Replaced `fetch("/api/notifications/unread-count")` with `notificationsApi.getUnreadCount()`

### Pages
- **`frontend/app/dashboard/parties/[id]/interactive/page.tsx`**
  - Replaced `fetch(\`/api/parties/${partyId}/\`)` with `partiesApi.getById(partyId)`
  - Updated Party type to use WatchParty from api-client

- **`frontend/app/party/[code]/page.tsx`**
  - Updated to call backend API directly with credentials
  - Maintained error handling for 404/403 responses

### Auth Pages
- **`frontend/app/auth/login/page.tsx`** - Already using `authApi.login()`
- **`frontend/app/auth/register/page.tsx`** - Already using `authApi.register()`

## Environment Variables

### Updated `.env.example`
```bash
# REQUIRED: Backend API URL (browser-side)
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me

# REQUIRED: WebSocket URL
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws

# OPTIONAL: Alternative name (backwards compat)
NEXT_PUBLIC_BACKEND_URL=https://be-watch-party.brahim-elhouss.me

# DEPRECATED (no longer used):
# - BACKEND_URL
# - NEXT_PUBLIC_FRONTEND_API
```

## Benefits

1. **Simpler Architecture**: No middleware layer, direct communication
2. **Better Performance**: One less hop in the request chain
3. **Easier Debugging**: Clear request flow, no proxy confusion
4. **Reduced Bundle Size**: Removed all API route code
5. **Easier CORS Management**: All CORS handled in Django
6. **Consistent Error Handling**: All errors come from backend
7. **Better Type Safety**: Single source of truth for API types

## CORS Configuration

Since frontend now makes direct requests to backend, ensure your Django backend has proper CORS configuration:

```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://watch-party.brahim-elhouss.me",
    "http://localhost:3000",  # for local development
]

CORS_ALLOW_CREDENTIALS = True
```

## Testing Checklist

- [x] Login functionality
- [x] Registration functionality  
- [x] Logout functionality
- [x] Session management
- [x] Party listing
- [x] Party details
- [x] Public party access
- [x] Notifications
- [x] Mobile navigation
- [x] Dashboard header
- [ ] WebSocket connections
- [ ] File uploads
- [ ] Video streaming

## Migration for Local Development

1. Update your `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```

2. Ensure Django backend is running and accessible

3. Restart your Next.js development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Deployment Notes

- Frontend build is now simpler (no server-side API logic)
- Can be deployed as pure static site (SSG) if needed
- All authentication handled via HTTP-only cookies from backend
- Make sure `NEXT_PUBLIC_API_URL` is set correctly in build environment

## Rollback Plan

If issues arise, the API routes can be restored from git history:
```bash
git checkout HEAD~1 -- frontend/app/api/
```

However, you'd also need to revert changes to:
- `lib/api-client.ts`
- `lib/auth.ts`
- Component files mentioned above
