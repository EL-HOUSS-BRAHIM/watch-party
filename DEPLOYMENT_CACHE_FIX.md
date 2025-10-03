# Deployment Cache Fix - Changes Not Appearing on Website

## Problem

Despite successful deployments, code changes were not appearing on the deployed website because Docker was using cached build layers.

## Root Cause

Docker's layer caching was keeping old code:
```
#30 [frontend builder 3/4] COPY . .
#30 CACHED    ← This means new code was NOT copied!
```

When the `COPY . .` step is cached, new code changes never make it into the Docker image.

## Solution

Added git commit hash as a Docker build argument that changes on every commit, forcing cache invalidation:

### Changes Made

1. **`scripts/deployment/build-docker-images.sh`**
   - Extract current commit hash: `GIT_COMMIT_HASH=$(git rev-parse HEAD)`
   - Pass to all Docker builds: `--build-arg GIT_COMMIT_HASH="$GIT_COMMIT_HASH"`

2. **`frontend/Dockerfile` and `backend/Dockerfile`**
   - Accept build arg: `ARG GIT_COMMIT_HASH=unknown`
   - Use in RUN command before COPY: `RUN echo "Building from commit: ${GIT_COMMIT_HASH}"`

### How It Works

```
Commit A (hash: abc123)
└─> Docker build with --build-arg GIT_COMMIT_HASH="abc123"
    └─> RUN echo "Building from commit: abc123"  ← This layer's hash includes "abc123"
        └─> COPY . .  ← Cache invalidated, copies new code!

Commit B (hash: def456)  
└─> Docker build with --build-arg GIT_COMMIT_HASH="def456"
    └─> RUN echo "Building from commit: def456"  ← Different hash = different layer
        └─> COPY . .  ← Must run again with new code!
```

## Verification

After deployment, check the logs for:

### ✅ Good (Cache Busted)
```
#30 [frontend builder 3/4] COPY . .
#30 0.234s  ← Time shown = actually copied!

Building from commit: 1b6a66d...  ← Shows commit hash
```

### ❌ Bad (Still Cached - shouldn't happen)
```
#30 [frontend builder 3/4] COPY . .
#30 CACHED  ← Would mean fix didn't work
```

## Testing Locally

To test this fix locally:

```bash
# Make a code change
echo "// test change" >> frontend/app/page.tsx

# Commit it
git add .
git commit -m "Test change"

# Build with the script
cd /home/runner/work/watch-party/watch-party
bash scripts/deployment/build-docker-images.sh

# Look for these in the output:
# - "Building from commit: <new-hash>"
# - No "CACHED" on COPY operations
```

## Expected Result

After this fix:
- Every new commit will have a different hash
- Docker will invalidate cache at the RUN echo step
- All subsequent steps (including COPY) will run fresh
- New code will be included in the Docker images
- Deployed website will show the latest changes

## Rollback

If this causes issues, revert with:
```bash
git revert 1b6a66d
```

## Notes

- This adds ~1 second to build time (the RUN echo command)
- The trade-off is acceptable because it ensures deployments work correctly
- Previously cached dependency layers (pip install, npm install) remain cached for speed
