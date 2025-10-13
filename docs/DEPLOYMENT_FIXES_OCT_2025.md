# Deployment Fixes - October 2025

## Overview
This document describes the deployment issues identified and fixed on October 13, 2025.

## Issues Identified

### 1. Frontend Build Failure - pnpm Version Mismatch
**Error**: `ERR_PNPM_LOCKFILE_BREAKING_CHANGE Lockfile /app/pnpm-lock.yaml not compatible with current pnpm`

**Root Cause**: 
- The `pnpm-lock.yaml` file uses lockfile version 9.0
- The frontend Dockerfile was installing pnpm@8, which cannot read version 9.0 lockfiles
- This caused the frontend build to fail during the Docker build process

**Fix Applied**:
- Updated `frontend/Dockerfile` to install pnpm@9 instead of pnpm@8
- Change: `RUN npm install -g pnpm@8` → `RUN npm install -g pnpm@9`

### 2. Backend Build Warning - DATABASE_URL Missing
**Warning**: `WARNING:root:No DATABASE_URL environment variable set, and so no databases setup`

**Root Cause**:
- The backend Dockerfile runs `python manage.py collectstatic --noinput` during build
- Django's settings check for DATABASE_URL environment variable at startup
- While collectstatic doesn't need a real database, Django still checks for the variable

**Fix Applied**:
- Added `DATABASE_URL` as a build argument in `backend/Dockerfile`
- Set default value to `sqlite:///tmp/build.db` (dummy SQLite database for build-time only)
- Updated `scripts/deployment/build-docker-images.sh` to pass this build arg
- This suppresses the warning without requiring a real database connection

### 3. Backend URL Configuration
**Status**: ✅ Already Correctly Configured

The backend URL configuration was already correct:
- `NEXT_PUBLIC_API_URL`: `https://be-watch-party.brahim-elhouss.me`
- `NEXT_PUBLIC_WS_URL`: `wss://be-watch-party.brahim-elhouss.me/ws`
- Build arguments are properly passed in `scripts/deployment/build-docker-images.sh`
- Docker Compose configuration has correct environment variables

**No changes needed** for backend URL configuration.

## Files Modified

### 1. `frontend/Dockerfile`
```diff
- RUN npm install -g pnpm@8
+ RUN npm install -g pnpm@9
```

### 2. `backend/Dockerfile`
```diff
+ # Set a dummy DATABASE_URL for collectstatic (doesn't need real DB)
+ ARG DATABASE_URL=sqlite:///tmp/build.db
+ ENV DATABASE_URL=$DATABASE_URL
```

### 3. `scripts/deployment/build-docker-images.sh`
```diff
  if ! timeout 600 docker-compose build $BUILD_FLAGS backend \
      --build-arg SKIP_AWS_DURING_BUILD=1 \
+     --build-arg DATABASE_URL="sqlite:///tmp/build.db" \
      --build-arg GIT_COMMIT_HASH="$GIT_COMMIT_HASH"; then
```

## Testing

### Before Fixes
- ❌ Frontend build failed with pnpm lockfile incompatibility error
- ⚠️  Backend build showed DATABASE_URL warning
- ❌ Deployment workflow failed

### After Fixes
- ✅ Frontend build should complete successfully
- ✅ Backend build should complete without warnings
- ✅ Deployment workflow should succeed

## Next Steps

1. **Test Deployment**: Trigger a new deployment to verify the fixes work
2. **Monitor**: Check GitHub Actions logs to confirm no errors
3. **Verify Application**: Once deployed, verify the application is working correctly:
   - Frontend is accessible at `https://watch-party.brahim-elhouss.me`
   - Backend API is accessible at `https://be-watch-party.brahim-elhouss.me`
   - API calls from frontend go to the correct backend domain

## Related Documentation

- [Backend URL Fix Summary](./BACKEND_URL_FIX_SUMMARY.md)
- [Backend URL Fix Deployment](./BACKEND_URL_FIX_DEPLOYMENT.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE_BACKEND_URL.md)
- [Docker Compose Environment Fix](./DOCKER_COMPOSE_ENV_FIX.md)

## Summary

All identified deployment errors have been fixed with minimal, targeted changes:
1. ✅ Updated pnpm version to match lockfile format
2. ✅ Added DATABASE_URL build arg to suppress warning
3. ✅ Verified backend URL configuration is correct

The deployment should now succeed without errors.
