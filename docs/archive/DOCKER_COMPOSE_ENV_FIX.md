# BACKEND_URL Docker Compose Fix - October 3, 2025

## Critical Issue
The frontend was making API requests to the wrong domain even after deployment:
- ❌ Wrong: `https://watch-party.brahim-elhouss.me/api/auth/login/`
- ✅ Correct: `https://be-watch-party.brahim-elhouss.me/api/auth/login/`

## Root Cause
The environment variables were set in `.env.local` files which are:
1. **Gitignored** - Not in version control
2. **Manually managed** - Set manually on the deployment server
3. **Easy to forget** - Can have wrong values after fresh deployments

The deployment script creates `.env.local`, but if it's set manually on the server, it might have the wrong `BACKEND_URL` value (like `http://backend:8000` instead of the real domain).

## The Solution
**Hardcode environment variables directly in `docker-compose.yml`** files so they are:
- ✅ Version controlled
- ✅ Always correct
- ✅ Can't be forgotten or misconfigured
- ✅ Override any `.env.local` settings

## Files Modified

### 1. `/docker-compose.yml` (Main production file)
Added `environment` section to frontend service:
```yaml
  frontend:
    # ... build config ...
    environment:
      # Backend URL for server-side API calls
      - BACKEND_URL=https://be-watch-party.brahim-elhouss.me
      # Public API URLs for client-side calls
      - NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
      - NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
      - NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=true
      - NEXT_PUBLIC_ENABLE_DISCORD=true
      - NEXT_PUBLIC_ENABLE_ANALYTICS=true
    env_file:
      - ./frontend/.env.local  # Still here as fallback, but environment takes priority
```

### 2. `/docker-compose.aws.yml` (AWS-specific file)
Same changes applied for consistency.

### 3. `/scripts/deployment/setup-aws-environment.sh`
Previously updated (but not sufficient since `.env.local` is manual).

## How Docker Compose Environment Variables Work

### Priority Order (Highest to Lowest)
1. **Command-line overrides** (`docker-compose run -e VAR=value`)
2. **`environment` section in docker-compose.yml** ← **We use this!**
3. **`env_file` referenced files** (`.env.local`)
4. **Shell environment variables**
5. **Dockerfile ENV statements**

By using the `environment` section, our values **always win** regardless of what's in `.env.local`!

## Critical Environment Variables

| Variable | Purpose | Value | Used By |
|----------|---------|-------|---------|
| `BACKEND_URL` | Server-side API proxy | `https://be-watch-party.brahim-elhouss.me` | Next.js API routes |
| `NEXT_PUBLIC_API_URL` | Client-side API calls | `https://be-watch-party.brahim-elhouss.me` | React components |
| `NEXT_PUBLIC_WS_URL` | WebSocket connections | `wss://be-watch-party.brahim-elhouss.me/ws` | Real-time features |

## Why This Fix Works

### Before (Broken)
```
1. Deployment script creates .env.local with correct BACKEND_URL
2. BUT: .env.local is manually managed on server (might be wrong)
3. Frontend container loads wrong BACKEND_URL from .env.local
4. API routes proxy to wrong domain → 500 errors
```

### After (Fixed)
```
1. docker-compose.yml has hardcoded BACKEND_URL
2. Frontend container ALWAYS gets correct BACKEND_URL
3. .env.local values are ignored (environment section wins)
4. API routes proxy to correct domain → Success!
```

## Testing the Fix

### 1. Check environment variables in container
```bash
# SSH into the server
ssh deploy@your-server

# Check what BACKEND_URL the frontend container actually has
docker exec -it <frontend-container-id> env | grep BACKEND_URL

# Should output:
# BACKEND_URL=https://be-watch-party.brahim-elhouss.me
```

### 2. Test login endpoint
```bash
# From your browser, try to login
# Open DevTools → Network tab
# Look for the login request
# Should go to: https://be-watch-party.brahim-elhouss.me/api/auth/login/
```

### 3. Check Next.js API route
```bash
# The Next.js API route should proxy correctly
curl -X POST https://watch-party.brahim-elhouss.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Should get a response from Django (not 500 error)
```

## Deployment Steps

### Option 1: Full Redeployment (Recommended)
```bash
# 1. Commit and push the docker-compose.yml changes
git add docker-compose.yml docker-compose.aws.yml
git commit -m "Fix: Hardcode BACKEND_URL in docker-compose for production"
git push origin master

# 2. GitHub Actions will automatically deploy (if enabled)
# Or manually trigger the deployment workflow
```

### Option 2: Quick Fix on Server (Immediate)
```bash
# SSH into the server
ssh deploy@your-server

# Navigate to the app directory
cd /srv/watch-party  # or ~/watch-party

# Pull latest changes
git pull origin master

# Restart the frontend service with new environment
docker-compose up -d --force-recreate frontend

# Verify it's running
docker-compose ps
docker logs <frontend-container-id>
```

### Option 3: Manual Environment Variable Check
```bash
# If still having issues, verify the environment on server
ssh deploy@your-server
cd /srv/watch-party

# Check what's in the .env.local file
cat frontend/.env.local

# If BACKEND_URL is wrong, either:
# A) Fix it manually (temporary)
echo "BACKEND_URL=https://be-watch-party.brahim-elhouss.me" >> frontend/.env.local

# B) Recreate from deployment script (better)
bash scripts/deployment/setup-aws-environment.sh

# C) Just use docker-compose.yml environment (best - already done!)
docker-compose up -d --force-recreate frontend
```

## Verification Checklist

After deployment, verify:

- [ ] Frontend container is running: `docker ps | grep frontend`
- [ ] Environment variable is set: `docker exec <frontend> env | grep BACKEND_URL`
- [ ] Value is correct: Should be `https://be-watch-party.brahim-elhouss.me`
- [ ] Login works: Try logging in at `https://watch-party.brahim-elhouss.me`
- [ ] No 500 errors: Check browser network tab
- [ ] API calls go to correct domain: Network tab shows `be-watch-party.brahim-elhouss.me`

## Why .env.local is Still There

The `env_file` line is kept for:
1. **Local development** - Developers can override with their local settings
2. **Additional variables** - Other env vars not in the hardcoded list
3. **Backward compatibility** - Doesn't break existing setups
4. **Non-critical vars** - Feature flags, optional configs, etc.

But **critical production values** (BACKEND_URL, API URLs) are now hardcoded in docker-compose.yml and **cannot be wrong**.

## Common Mistakes (Now Prevented)

❌ **Before**: Setting `BACKEND_URL=http://backend:8000` in .env.local
- This is the Docker internal network address
- Works for container-to-container communication
- Doesn't work for Next.js server-side API routes making external calls

✅ **After**: Hardcoded `BACKEND_URL=https://be-watch-party.brahim-elhouss.me`
- Real public domain
- Works for all cases
- Can't be misconfigured

## Related Files

- `/docker-compose.yml` - Main production config ✅ FIXED
- `/docker-compose.aws.yml` - AWS-specific config ✅ FIXED
- `/docker-compose.dev.yml` - Development config (can use localhost)
- `/scripts/deployment/setup-aws-environment.sh` - Environment generator
- `/frontend/.env.local` - Manual overrides (now superseded by docker-compose)
- `/frontend/.env.example` - Template/documentation

## Summary

✅ **BACKEND_URL** now hardcoded in `docker-compose.yml`  
✅ **Always correct** regardless of .env.local contents  
✅ **Version controlled** - can't be lost or forgotten  
✅ **No manual configuration** needed on server  
✅ **API requests** will go to correct backend domain  

The 500 errors should be **completely resolved** after redeployment! 🎉
