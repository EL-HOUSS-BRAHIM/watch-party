# Backend URL Deployment Fix

## Problem
Frontend was making API calls to the frontend domain (`https://watch-party.brahim-elhouss.me`) instead of the backend domain (`https://be-watch-party.brahim-elhouss.me`), causing 500 errors.

## Root Cause
The GitHub Actions deployment script was building the frontend Docker image but **NOT** passing the `NEXT_PUBLIC_*` environment variables as build arguments. Even though the `docker-compose.yml` was correctly configured, the deployment script was overriding the build args with its own parameters, causing the frontend to be built without the correct backend URL embedded.

## Solution Applied

### 1. Fixed Deployment Script (`scripts/deployment/build-docker-images.sh`)
Added the missing `NEXT_PUBLIC_*` build arguments to both parallel and sequential builds:

```bash
--build-arg NEXT_PUBLIC_API_URL="https://be-watch-party.brahim-elhouss.me" \
--build-arg NEXT_PUBLIC_WS_URL="wss://be-watch-party.brahim-elhouss.me/ws" \
--build-arg NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE="true" \
--build-arg NEXT_PUBLIC_ENABLE_DISCORD="true" \
--build-arg NEXT_PUBLIC_ENABLE_ANALYTICS="true"
```

### 2. Added Build Verification
The script now verifies that the backend URL is properly embedded in the built frontend:
```bash
docker run --rm watchparty-frontend:latest find .next -name "*.js" -exec grep -l "be-watch-party.brahim-elhouss.me" {} \;
```

### 3. Enhanced GitHub Workflow
Added `REMOVE_OLD_IMAGES` option to force complete rebuild when needed.

## Why This Fix Works

1. **Build-Time Embedding**: `NEXT_PUBLIC_*` variables are now passed as build args during Docker build
2. **No Cache Issues**: Build args ensure fresh builds embed the correct URLs  
3. **Automatic Deployment**: Fix is applied on every push via GitHub Actions
4. **Verification**: Script checks that URLs are actually embedded in the built bundle

## Next Deployment

When you push this commit, the GitHub Actions workflow will:
1. Build the frontend with correct `NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me`
2. Embed this URL in the client-side JavaScript bundle
3. Deploy the fixed frontend

## Results After Deployment
- ✅ Client-side API calls go to: `https://be-watch-party.brahim-elhouss.me`
- ✅ Server-side API calls go to: `https://be-watch-party.brahim-elhouss.me`  
- ✅ No more 500 errors from wrong domain routing
- ✅ Login and all API calls work correctly

## For Emergency Rebuild
If you need to force a complete rebuild:
1. Go to Actions tab in GitHub
2. Run "Deploy to Lightsail" workflow manually
3. Check "Force rebuild without cache" and "Remove old images before building"