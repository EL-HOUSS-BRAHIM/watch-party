# Docker Build Cache Fix

## Problem

Despite having the GIT_COMMIT_HASH cache-busting mechanism in place, deployments were still using cached Docker layers. Changes were not appearing on the deployed website because Docker's BuildKit cache persisted between builds.

## Root Cause

The issue had two components:

1. **BUILDKIT_INLINE_CACHE=1**: This flag in `docker-compose.yml` tells Docker to store cache metadata in the built images. This cache persists between builds and can prevent fresh code from being used.

2. **Docker Builder Cache**: Docker BuildKit maintains a build cache on disk that persists between builds. Even with the GIT_COMMIT_HASH mechanism, if the build cache exists, Docker may still reference old cached layers.

## Solution

The fix involves three changes:

### 1. Remove BUILDKIT_INLINE_CACHE

Removed `BUILDKIT_INLINE_CACHE: 1` from both frontend and backend service definitions in `docker-compose.yml`. This prevents Docker from embedding cache metadata in images.

**Before:**
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
    args:
      BUILDKIT_INLINE_CACHE: 1
```

**After:**
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
```

### 2. Prune Docker Build Cache Before Building

Added `docker builder prune -f` to `scripts/deployment/build-docker-images.sh` to clear Docker's build cache before every build.

```bash
# Prune Docker build cache to ensure fresh builds
log_info "Pruning Docker build cache..."
docker builder prune -f || true
log_success "Docker build cache cleared"
```

This ensures that every deployment starts with a clean build cache, forcing Docker to rebuild all layers with fresh code.

### 3. Enhanced Cache Clearing Script

Updated `scripts/deployment/clear-app-cache.sh` to also clear Docker build cache when running with `--target all`.

```bash
# Clear Docker build cache to ensure fresh builds
if [ "$TARGET" = "all" ]; then
    log_info "Clearing Docker build cache"
    docker builder prune -f 2>/dev/null || true
    log_success "Docker build cache cleared"
fi
```

## How It Works

### Complete Cache-Busting Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Git Pull (Fresh Code)                                   │
│     └─ git reset --hard origin/master                       │
│                                                              │
│  2. Extract Commit Hash                                     │
│     └─ GIT_COMMIT_HASH=$(git rev-parse HEAD)               │
│                                                              │
│  3. Clean Containers                                         │
│     └─ docker-compose down --remove-orphans                 │
│                                                              │
│  4. Prune Build Cache (NEW!)                                │
│     └─ docker builder prune -f                              │
│         ├─ Removes all cached build layers                  │
│         └─ Forces fresh rebuild from scratch                │
│                                                              │
│  5. Docker Build                                             │
│     └─ docker-compose build --build-arg GIT_COMMIT_HASH=... │
│         ├─ No BUILDKIT_INLINE_CACHE (NEW!)                  │
│         ├─ ARG GIT_COMMIT_HASH in Dockerfile                │
│         ├─ RUN echo "Building from commit: ${HASH}"         │
│         └─ COPY . . (Fresh code guaranteed!)                │
│                                                              │
│  6. Deploy Services                                          │
│     └─ docker-compose up -d                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Guaranteed Fresh Builds**: Every deployment now starts with a clean Docker build cache
2. **No Stale Code**: The combination of cache pruning + GIT_COMMIT_HASH ensures fresh code
3. **Manual Cache Clearing**: The `clear-caches.yml` workflow now also clears Docker build cache
4. **Performance Balance**: While builds may take slightly longer (no layer cache reuse), they are guaranteed to use fresh code

## Trade-offs

- **Slightly Longer Build Times**: Without cached layers, Docker must rebuild everything from scratch each time
- **More Disk I/O**: Pruning and rebuilding uses more disk I/O
- **Network Usage**: Dependencies (npm packages, pip packages) must be downloaded fresh each time

However, these trade-offs are acceptable because:
- Build times are still reasonable (~5-10 minutes total)
- Correctness (deploying fresh code) is more important than speed
- The previous issue (cached stale code) was blocking all deployments

## Verification

After deployment, check logs for these indicators:

### ✅ Good (Cache Cleared)
```bash
INFO: Pruning Docker build cache...
Total reclaimed space: 2.5GB
SUCCESS: Docker build cache cleared

Building from commit: abc1234...

#30 [frontend builder 3/4] COPY . .
#30 0.234s    ← Time shown = actually copied!
```

### ❌ Bad (Would indicate reversion)
```bash
#30 [frontend builder 3/4] COPY . .
#30 CACHED    ← Should never happen now!
```

## Testing Locally

Test the fix locally:

```bash
cd /home/runner/work/watch-party/watch-party

# Make a code change
echo "// test change" >> frontend/app/page.tsx
git add .
git commit -m "Test change"

# Build with the fixed script
bash scripts/deployment/build-docker-images.sh

# Verify output:
# - "Pruning Docker build cache..."
# - "Building from commit: <new-hash>"
# - No "CACHED" on COPY operations
```

## Manual Cache Clearing

Use the GitHub Actions workflow or run manually:

```bash
# Via GitHub Actions
# Go to Actions → Clear Application Caches → Run workflow → Select "all"

# Or manually via SSH
cd /srv/watch-party  # or ~/watch-party
bash scripts/deployment/clear-app-cache.sh all
```

## Files Modified

1. `docker-compose.yml` - Removed BUILDKIT_INLINE_CACHE from backend and frontend
2. `scripts/deployment/build-docker-images.sh` - Added docker builder prune before build
3. `scripts/deployment/clear-app-cache.sh` - Added Docker cache clearing to "all" target

## References

- Original cache-busting fix: `DEPLOYMENT_CACHE_FIX.md`
- Complete fix summary: `FIX_SUMMARY.md`
- Test verification: `test-cache-busting.sh`
