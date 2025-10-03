# Docker Build Cache Fix

## Problem

Despite having the GIT_COMMIT_HASH cache-busting mechanism in place, deployments were still using cached Docker layers. Changes were not appearing on the deployed website because Docker's BuildKit cache persisted between builds.

## Root Cause

**Docker Builder Cache**: Docker BuildKit maintains a build cache on disk that persists between builds. Even with the GIT_COMMIT_HASH mechanism, if the build cache exists, Docker may still reference old cached layers.

## Solution

The fix provides **manual control** over Docker cache clearing:

### Enhanced Cache Clearing Script

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

### Manual Cache Clearing Flow

When you need to clear Docker cache (e.g., when deployments seem stale):

```
┌─────────────────────────────────────────────────────────────┐
│                   MANUAL CACHE CLEARING                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Trigger Workflow                                         │
│     └─ GitHub Actions → Clear Application Caches → Run      │
│         └─ Select target: "all"                             │
│                                                              │
│  2. Clear Application Caches                                 │
│     └─ Frontend: .next, .turbo, node_modules/.cache         │
│     └─ Backend: __pycache__, staticfiles                    │
│                                                              │
│  3. Clear Docker Build Cache (NEW!)                          │
│     └─ docker builder prune -f                              │
│         ├─ Removes all cached build layers                  │
│         └─ Next build will be completely fresh              │
│                                                              │
│  4. Next Deployment Will Build Fresh                         │
│     └─ Regular deployment workflow runs                     │
│         └─ Uses GIT_COMMIT_HASH cache-busting               │
│         └─ Builds with fresh layers                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Manual Control**: Clear Docker cache only when needed, not on every deployment
2. **Faster Regular Deployments**: Normal deployments use cache for speed
3. **Clear When Needed**: Use the workflow when deployments seem stale
4. **GIT_COMMIT_HASH Still Works**: Cache-busting mechanism remains active for code changes

## Trade-offs

- **Manual Action Required**: You need to run the workflow when cache issues occur
- **No Automatic Cache Clearing**: Regular deployments keep using cache (faster but may be stale)

However, this approach gives you:
- **Control**: Clear cache only when you need to
- **Speed**: Normal deployments are faster with cache
- **Flexibility**: Choose when to take the performance hit of a full rebuild

## Verification

After running the cache clearing workflow:

### In Workflow Logs
```bash
INFO: Clearing Docker build cache
Total reclaimed space: 2.5GB
SUCCESS: Docker build cache cleared
```

### In Next Deployment
After clearing cache, the next deployment will build fresh:
```bash
Building from commit: abc1234...

#30 [frontend builder 3/4] COPY . .
#30 0.234s    ← Time shown = actually copied!
```

Without clearing cache, deployments may show:
```bash
#30 [frontend builder 3/4] COPY . .
#30 CACHED    ← Using cached layers (faster but may be stale)
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

## When to Clear Cache

Clear Docker cache when:
- Deployments complete but changes don't appear
- You suspect stale cached layers
- After major dependency updates
- When troubleshooting deployment issues

### Via GitHub Actions
1. Go to Actions → "Clear Application Caches"
2. Click "Run workflow"
3. Select target: "all"
4. Click "Run workflow"

### Via SSH
```bash
cd /srv/watch-party  # or ~/watch-party
bash scripts/deployment/clear-app-cache.sh all
```

Then trigger a new deployment to rebuild with fresh cache.

## Files Modified

1. `scripts/deployment/clear-app-cache.sh` - Added Docker cache clearing to "all" target

## References

- Original cache-busting fix: `DEPLOYMENT_CACHE_FIX.md`
- Complete fix summary: `FIX_SUMMARY.md`
- Test verification: `test-cache-busting.sh`
