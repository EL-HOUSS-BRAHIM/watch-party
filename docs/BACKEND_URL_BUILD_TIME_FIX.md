# Backend URL Build-Time Fix - October 2025

## Problem
The frontend was making API requests to the wrong domain after deployment:
- **Incorrect**: `https://watch-party.brahim-elhouss.me/api/...`
- **Correct**: `https://be-watch-party.brahim-elhouss.me/api/...`

This resulted in 500 Internal Server Error responses because the frontend domain doesn't host the backend API.

## Root Cause
In Next.js, environment variables starting with `NEXT_PUBLIC_` are **embedded into the JavaScript bundle at build time**, not runtime. The docker-compose files were correctly setting these variables in the `environment` section (for runtime), but NOT in the `args` section (for build time).

During the Docker build process:
1. Docker builds the Next.js application
2. Next.js looks for `NEXT_PUBLIC_*` environment variables
3. If not found, it uses empty strings or code defaults
4. These values get baked into the JavaScript bundle
5. At runtime, the `environment` variables don't affect client-side code

## Solution
Pass `NEXT_PUBLIC_*` environment variables as **build arguments** so they're available during the build phase.

### Files Modified

#### 1. `/frontend/Dockerfile`
Added ARG and ENV declarations in the builder stage:

```dockerfile
# Accept NEXT_PUBLIC_* environment variables as build args
# These are embedded into the JavaScript bundle at build time
ARG NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
ARG NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
ARG NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=true
ARG NEXT_PUBLIC_ENABLE_DISCORD=true
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Convert build args to environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=$NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE
ENV NEXT_PUBLIC_ENABLE_DISCORD=$NEXT_PUBLIC_ENABLE_DISCORD
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS
```

#### 2. `/docker-compose.yml`
Added build args to frontend service:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      NODE_OPTIONS: "--max-old-space-size=2048"
      # Pass NEXT_PUBLIC_* variables as build args so they're embedded at build time
      NEXT_PUBLIC_API_URL: "https://be-watch-party.brahim-elhouss.me"
      NEXT_PUBLIC_WS_URL: "wss://be-watch-party.brahim-elhouss.me/ws"
      NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE: "true"
      NEXT_PUBLIC_ENABLE_DISCORD: "true"
      NEXT_PUBLIC_ENABLE_ANALYTICS: "true"
    target: runner
```

#### 3. `/docker-compose.aws.yml`
Same changes as docker-compose.yml for AWS deployment.

#### 4. `/frontend/.env.example`
Updated to show correct production values:

```env
# Backend URL for server-side API calls
# IMPORTANT: For production deployment, this MUST be the real backend domain
# NOT the internal Docker service name, as Next.js API routes need to reach the actual backend
BACKEND_URL=https://be-watch-party.brahim-elhouss.me
```

## How Next.js Environment Variables Work

### Build-Time Variables (NEXT_PUBLIC_*)
- **When**: Embedded during `next build`
- **Where**: Available in browser (client-side)
- **How to set**: Must be available as environment variables during build
- **Docker**: Pass as `ARG` and `ENV` in Dockerfile builder stage + `args` in docker-compose

### Runtime Variables (non-NEXT_PUBLIC)
- **When**: Read when server starts
- **Where**: Only available server-side (API routes, getServerSideProps)
- **How to set**: Can be set at container runtime
- **Docker**: Pass as `environment` in docker-compose

## Environment Variable Table

| Variable | Type | Usage | Set At | Source |
|----------|------|-------|--------|--------|
| `NEXT_PUBLIC_API_URL` | Build-time | Client-side API calls | Build | Docker build args |
| `NEXT_PUBLIC_WS_URL` | Build-time | Client-side WebSocket | Build | Docker build args |
| `BACKEND_URL` | Runtime | Server-side API proxy | Runtime | Docker environment |

## Deployment Process

After this fix, the deployment flow is:

1. **Build Phase**:
   ```bash
   docker-compose build frontend
   # Docker passes NEXT_PUBLIC_* as build args
   # Next.js embeds them into JavaScript bundle
   ```

2. **Runtime Phase**:
   ```bash
   docker-compose up -d frontend
   # Docker sets BACKEND_URL as environment variable
   # Next.js API routes use it to proxy to backend
   ```

## Testing

### 1. Verify Build Args Are Set
```bash
# Check docker-compose.yml
grep -A 10 "NEXT_PUBLIC_API_URL" docker-compose.yml
```

### 2. Check Built JavaScript Bundle
After building, the JavaScript bundle should contain the correct URL:
```bash
# Build the image
docker-compose build frontend

# Create a container to inspect
docker create --name temp-frontend watchparty-frontend:latest

# Copy and search the built files
docker cp temp-frontend:/app/.next/static /tmp/frontend-static
grep -r "be-watch-party.brahim-elhouss.me" /tmp/frontend-static

# Cleanup
docker rm temp-frontend
```

### 3. Test in Browser
1. Deploy and visit `https://watch-party.brahim-elhouss.me`
2. Open Browser DevTools → Network tab
3. Perform an action that calls the API (e.g., login)
4. Verify API requests go to `https://be-watch-party.brahim-elhouss.me`

## Related Files

- `/frontend/Dockerfile` - Build configuration ✅ FIXED
- `/docker-compose.yml` - Production config ✅ FIXED
- `/docker-compose.aws.yml` - AWS config ✅ FIXED
- `/frontend/.env.example` - Documentation ✅ FIXED
- `/scripts/deployment/setup-aws-environment.sh` - Already correct
- `/frontend/lib/api-client.ts` - API client code (no changes needed)
- `/frontend/app/api/*/route.ts` - API routes (use BACKEND_URL at runtime)

## Summary

✅ **NEXT_PUBLIC_* variables** now passed as build args  
✅ **Dockerfile** declares ARG and ENV for build-time variables  
✅ **docker-compose files** pass these as build args  
✅ **Documentation** updated to reflect correct production values  
✅ **Client-side code** will now use correct backend URL  
✅ **Server-side code** already uses correct BACKEND_URL at runtime  

The fix ensures that:
- Client-side JavaScript makes API calls to `https://be-watch-party.brahim-elhouss.me`
- Server-side API routes proxy to `https://be-watch-party.brahim-elhouss.me`
- No more 500 errors due to wrong backend URL! 🎉
