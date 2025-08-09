# Backend Fixes for Vercel Frontend Integration

## Issues Identified

### 1. CORS Configuration Issue
The frontend deployed on Vercel (`https://v0-watch-party-chi.vercel.app`) is being blocked by CORS policy when trying to make requests to the backend at `https://be-watch-party.brahim-elhouss.me`.

### 2. User Registration Bug
Backend error: `User() got unexpected keyword arguments: 'username'`
- The User model has `username = None` but the serializer was still passing a `username` parameter to `create_user()`

## Changes Made

### 1. Fixed User Registration Serializer
**File:** `apps/authentication/serializers.py`
- Removed the `username` parameter from `User.objects.create_user()` call
- The User model uses email as the username field, so only email should be passed

### 2. Updated `.env.production.example`
- Added `CORS_ALLOWED_ORIGINS` environment variable
- Updated `CSRF_TRUSTED_ORIGINS` to include the Vercel URL

### 3. Updated `watchparty/settings/production.py`
- Added explicit CORS configuration that reads from environment variables
- Ensured `CORS_ALLOW_CREDENTIALS = True` for cookie-based authentication

## Deployment Instructions

### For Production Server

#### Step 1: Apply Backend Code Fix
```bash
# Pull the latest code changes
cd /home/ubuntu/brahim/be_watch-party
git pull origin main

# Apply database migrations (if any)
python manage.py migrate
```

#### Step 2: Update Environment Configuration
Add these lines to your production `.env` file:
```bash
# CORS Configuration  
CORS_ALLOWED_ORIGINS=https://v0-watch-party-chi.vercel.app,https://be-watch-party.brahim-elhouss.me
CSRF_TRUSTED_ORIGINS=https://be-watch-party.brahim-elhouss.me,https://v0-watch-party-chi.vercel.app
```

#### Step 3: Restart Services
```bash
# Restart Django application
sudo systemctl restart watch-party-backend

# Check service status
sudo systemctl status watch-party-backend

# Restart Nginx (if applicable)
sudo systemctl reload nginx
```

#### Step 4: Verify Logs
```bash
# Check application logs
watch-party logs

# Or view directly
sudo journalctl -u watch-party-backend -f
```

## Verification Steps

1. **Test Backend Fix:**
   - Try registering a new user from Vercel frontend
   - Should not see the `username` error anymore

2. **Test CORS Configuration:**
   - Open browser developer tools
   - Navigate to `https://v0-watch-party-chi.vercel.app`
   - Attempt registration/login
   - Should not see CORS errors in console

3. **API Health Check:**
   ```bash
   # Test from command line
   curl -X OPTIONS https://be-watch-party.brahim-elhouss.me/api/auth/register/ \
        -H "Origin: https://v0-watch-party-chi.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -v
   ```

## Environment Variables Summary

```bash
# Domain Configuration
ALLOWED_HOSTS=be-watch-party.brahim-elhouss.me,127.0.0.1,localhost
CSRF_TRUSTED_ORIGINS=https://be-watch-party.brahim-elhouss.me,https://v0-watch-party-chi.vercel.app

# CORS Configuration  
CORS_ALLOWED_ORIGINS=https://v0-watch-party-chi.vercel.app,https://be-watch-party.brahim-elhouss.me
```

## Troubleshooting

### If CORS errors persist:
1. Verify environment variables are loaded: `echo $CORS_ALLOWED_ORIGINS`
2. Check Django settings in production: Add temporary logging to see loaded values
3. Ensure middleware order is correct (CORS middleware should be early)

### If registration still fails:
1. Check logs for different error messages
2. Verify database connectivity
3. Test with a simple user creation in Django shell

## Additional Security Notes
- CORS configuration allows credentials (cookies/auth headers)
- Both frontend and backend domains are whitelisted
- CSRF protection remains active with trusted origins
