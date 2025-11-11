# Authentication Flow Fixes - October 11, 2025

## Summary

Fixed all identified issues in the authentication flow between the backend API and frontend to ensure proper session management, token handling, and cleanup.

## Problems Identified & Fixed

### ✅ 1. UserSession Model Not Being Used During Login

**Problem**: The backend had a `UserSession` model but wasn't creating session records during login.

**Solution**: Updated `LoginView` to create session records with:
- Device information (browser, OS, device type)
- IP address (with proxy header support)
- User agent string
- Refresh token hash
- Expiration timestamp

**Files Modified**:
- `backend/apps/authentication/views.py` - Added session creation in `LoginView.post()`
- `backend/apps/authentication/utils.py` - Created helper functions for extracting device info and IP

### ✅ 2. Session Cleanup on Logout

**Problem**: Logout wasn't deactivating UserSession records.

**Solution**: Updated `LogoutView` to:
- Mark sessions as inactive when logging out
- Use token hash to identify and deactivate the specific session
- Maintain existing token blacklist functionality

**Files Modified**:
- `backend/apps/authentication/views.py` - Enhanced `LogoutView.post()`

### ✅ 3. Token Lifetime Mismatch

**Problem**: Frontend cookie expiry (24 hours) didn't match backend JWT access token lifetime (60 minutes).

**Solution**: Aligned frontend cookie expiry with backend settings:
- Access token cookie: 60 minutes (matches `JWT_ACCESS_TOKEN_LIFETIME`)
- Refresh token cookie: 7 days (matches `JWT_REFRESH_TOKEN_LIFETIME`)

**Files Modified**:
- `frontend/app/api/auth/login/route.ts` - Updated cookie maxAge
- `frontend/app/api/auth/session/route.ts` - Updated cookie maxAge for token refresh

### ✅ 4. No Automatic Cleanup of Expired Sessions

**Problem**: No periodic task to clean up expired UserSession records.

**Solution**: Created Celery tasks for automated cleanup:
- `cleanup_expired_sessions` - Runs every hour to remove expired/inactive sessions
- `cleanup_expired_tokens` - Runs every 6 hours to clean email verification and password reset tokens
- `cleanup_inactive_sessions` - Runs daily to remove sessions inactive for 30+ days

**Files Created/Modified**:
- `backend/apps/authentication/tasks.py` - New file with Celery tasks
- `backend/config/settings/base.py` - Added tasks to `CELERY_BEAT_SCHEDULE` and `CELERY_TASK_ROUTES`

### ✅ 5. Missing Dependency

**Problem**: `user-agents` library not in requirements.

**Solution**: Added `user-agents==2.2.0` to requirements.txt

**Files Modified**:
- `backend/requirements.txt`

## New Files Created

1. **`backend/apps/authentication/utils.py`**
   - `get_client_ip(request)` - Extracts client IP with proxy header support
   - `extract_device_info(request)` - Parses user agent for device details
   - `hash_token(token)` - Creates SHA256 hash for secure token storage

2. **`backend/apps/authentication/tasks.py`**
   - `cleanup_expired_sessions()` - Celery task for session cleanup
   - `cleanup_expired_tokens()` - Celery task for token cleanup
   - `cleanup_inactive_sessions()` - Celery task for inactive session cleanup

## Changes by File

### Backend

#### `backend/apps/authentication/views.py`
- **LoginView**: Added UserSession creation with device tracking
- **LogoutView**: Added session deactivation before token blacklist
- **Imports**: Added utility functions for session tracking

#### `backend/apps/authentication/utils.py` (NEW)
- Helper functions for IP extraction, device info parsing, and token hashing

#### `backend/apps/authentication/tasks.py` (NEW)
- Celery tasks for automated cleanup of sessions and tokens

#### `backend/config/settings/base.py`
- Added 3 new tasks to `CELERY_BEAT_SCHEDULE`
- Added task routes to `CELERY_TASK_ROUTES`

#### `backend/requirements.txt`
- Added `user-agents==2.2.0`

### Frontend

#### `frontend/app/api/auth/login/route.ts`
- Changed access token cookie: `maxAge: 60 * 60` (60 minutes)
- Added comment explaining alignment with backend settings

#### `frontend/app/api/auth/session/route.ts`
- Changed access token cookie: `maxAge: 60 * 60` (60 minutes)
- Added comment explaining alignment with backend settings

## Authentication Flow (Updated)

### Login Process
1. User submits credentials to frontend
2. Frontend calls `/api/auth/login` Next.js route
3. Next.js route forwards to Django backend
4. Backend validates credentials
5. Backend updates `last_login` timestamp
6. Backend generates JWT tokens (access + refresh)
7. **NEW**: Backend creates UserSession record with device info
8. Backend returns tokens + user profile
9. Frontend stores tokens in HTTP-only cookies (60min + 7days)
10. Frontend redirects to dashboard

### Session Validation
1. Frontend checks session on page load
2. Frontend calls `/api/auth/session` with cookies
3. Next.js route reads tokens from cookies
4. Next.js validates access token with backend
5. If expired, automatically refreshes using refresh token
6. Updates cookies with new tokens
7. Returns authentication status + user data

### Logout Process
1. User clicks logout
2. Frontend calls `/api/auth/logout` with refresh token
3. Next.js route forwards to Django backend
4. **NEW**: Backend deactivates UserSession record
5. Backend blacklists refresh token
6. Frontend clears auth state and redirects

### Automated Cleanup
- **Every hour**: Remove expired/inactive sessions
- **Every 6 hours**: Remove used/expired email and password reset tokens
- **Daily**: Remove sessions inactive for 30+ days

## Testing Recommendations

1. **Login Testing**:
   - Verify UserSession records are created on login
   - Check device info is correctly captured
   - Confirm IP address extraction works with proxies

2. **Logout Testing**:
   - Verify sessions are marked inactive on logout
   - Confirm tokens are still blacklisted

3. **Token Lifecycle**:
   - Verify access token expires after 60 minutes
   - Confirm automatic refresh works correctly
   - Check cookies expire at correct times

4. **Celery Tasks**:
   - Run tasks manually to verify they work
   - Check logs for cleanup counts
   - Verify database records are removed

## Migration Requirements

Before deploying, run Django migrations to ensure the UserSession table exists:

```bash
python manage.py makemigrations
python manage.py migrate
```

Also install the new dependency:

```bash
pip install -r requirements.txt
```

## Monitoring

Monitor the following after deployment:

1. UserSession table growth
2. Celery task execution logs
3. Login/logout success rates
4. Session cleanup effectiveness
5. Cookie expiration behavior

## Security Improvements

- ✅ Session tracking with device fingerprinting
- ✅ IP address logging for security audits
- ✅ Automatic cleanup prevents database bloat
- ✅ Token hashing prevents exposure of refresh tokens
- ✅ Aligned cookie lifetimes reduce confusion
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ Proper session invalidation on logout
