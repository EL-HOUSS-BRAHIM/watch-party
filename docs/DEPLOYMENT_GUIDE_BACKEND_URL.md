# Deployment Guide: Backend URL Configuration

## Quick Summary

✅ **Issue Fixed**: Frontend now correctly makes API calls to `https://be-watch-party.brahim-elhouss.me`  
✅ **Root Cause**: NEXT_PUBLIC_* variables were not passed as build arguments  
✅ **Solution**: Added build args to Dockerfile and docker-compose files  

## For Deployers

### What Changed

The next deployment will automatically include these fixes:

1. **Build-time environment variables** are now passed correctly
2. **Client-side JavaScript** will have the correct backend URL embedded
3. **Server-side API routes** will proxy to the correct backend
4. **No manual intervention required** - just deploy as usual

### Deployment Steps

Standard deployment process - no changes needed:

```bash
# On the deployment server
cd /srv/watch-party  # or $HOME/watch-party
git pull origin master
docker-compose build frontend
docker-compose up -d frontend
```

Or trigger the GitHub Actions workflow as usual.

### Verification After Deployment

1. **Check container environment**:
   ```bash
   docker-compose exec frontend env | grep BACKEND_URL
   # Should show: BACKEND_URL=https://be-watch-party.brahim-elhouss.me
   ```

2. **Test the application**:
   - Visit https://watch-party.brahim-elhouss.me
   - Try to log in or make any API call
   - Open browser DevTools → Network tab
   - Verify requests go to `https://be-watch-party.brahim-elhouss.me`

3. **Check for errors**:
   ```bash
   docker-compose logs -f frontend
   # Should show no connection errors to backend
   ```

### Expected Results

✅ **Before** (broken):
```
User Action → Frontend → /api/auth/login
              ↓
          Tries to reach: http://localhost:8000 (fallback)
              ↓
          ❌ 500 Internal Server Error
```

✅ **After** (fixed):
```
User Action → Frontend → /api/auth/login
              ↓
          Reaches: https://be-watch-party.brahim-elhouss.me/api/auth/login/
              ↓
          ✅ 200 OK or 401 Unauthorized (expected for wrong credentials)
```

## For Developers

### Local Development Setup

1. **Copy the local environment template**:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. **Start your local backend**:
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Verify .env.local has**:
   ```env
   BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Understanding the Configuration

| Variable | When Set | Where Used | Value (Production) | Value (Local Dev) |
|----------|----------|------------|-------------------|------------------|
| `NEXT_PUBLIC_API_URL` | Build time | Client-side JS | `https://be-watch-party.brahim-elhouss.me` | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | Build time | Client-side WebSocket | `wss://be-watch-party.brahim-elhouss.me/ws` | `ws://localhost:8000/ws` |
| `BACKEND_URL` | Runtime | Server-side API routes | `https://be-watch-party.brahim-elhouss.me` | `http://localhost:8000` |

### Build-Time vs Runtime

**Build-Time Variables** (`NEXT_PUBLIC_*`):
- Embedded in JavaScript bundle during `next build`
- Available in browser (client-side)
- Cannot be changed without rebuilding
- Set via `ARG` and `ENV` in Dockerfile
- Passed as `args:` in docker-compose

**Runtime Variables** (regular env vars):
- Read when Next.js server starts
- Only available server-side
- Can be changed by restarting container
- Set via `environment:` in docker-compose

## Troubleshooting

### Issue: Still getting 500 errors after deployment

**Check 1**: Verify environment variable in container
```bash
docker-compose exec frontend env | grep BACKEND_URL
```
Expected: `BACKEND_URL=https://be-watch-party.brahim-elhouss.me`

**Check 2**: Verify build args were used
```bash
docker-compose config | grep -A 20 "frontend:"
```
Should show `NEXT_PUBLIC_API_URL` in the args section.

**Check 3**: Rebuild without cache
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: Works in production but not locally

**Solution**: Create `.env.local` for local development
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local to use localhost:8000
```

### Issue: Client-side requests go to wrong URL

**Cause**: Build-time variables not set correctly  
**Solution**: Rebuild the frontend image
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: Server-side proxy failing

**Check**: Runtime BACKEND_URL environment variable
```bash
docker-compose exec frontend node -e "console.log(process.env.BACKEND_URL)"
```

## Files Changed

### Core Configuration
- ✅ `frontend/Dockerfile` - Added build args for NEXT_PUBLIC_* variables
- ✅ `docker-compose.yml` - Added args section with correct URLs
- ✅ `docker-compose.aws.yml` - Added args section with correct URLs

### Code Changes
- ✅ `frontend/app/api/auth/login/route.ts` - Updated fallback URL
- ✅ `frontend/app/api/auth/register/route.ts` - Updated fallback URL
- ✅ `frontend/app/api/parties/route.ts` - Updated fallback URL
- ✅ `frontend/app/api/parties/public/[code]/route.ts` - Updated fallback URL

### Documentation
- ✅ `frontend/.env.example` - Updated with correct production values
- ✅ `frontend/.env.local.example` - NEW: Local development template
- ✅ `docs/BACKEND_URL_BUILD_TIME_FIX.md` - Technical explanation
- ✅ `docs/DEPLOYMENT_GUIDE_BACKEND_URL.md` - This file
- ✅ `test-backend-url-config.sh` - Validation test script

## Testing

Run the validation test:
```bash
./test-backend-url-config.sh
```

All tests should pass ✅

## Related Documentation

- [BACKEND_URL_BUILD_TIME_FIX.md](./BACKEND_URL_BUILD_TIME_FIX.md) - Detailed technical explanation
- [BACKEND_URL_FIX.md](./BACKEND_URL_FIX.md) - Previous fix attempt
- [DOCKER_COMPOSE_ENV_FIX.md](./DOCKER_COMPOSE_ENV_FIX.md) - Docker environment variable fix

## Summary

This fix ensures that:
1. ✅ NEXT_PUBLIC_* variables are available during Docker build
2. ✅ Client-side code uses correct backend URL
3. ✅ Server-side API routes proxy to correct backend
4. ✅ No manual configuration needed on deployment
5. ✅ Local development clearly documented
6. ✅ Production is the default configuration

**Result**: No more 500 errors from wrong backend URL! 🎉
