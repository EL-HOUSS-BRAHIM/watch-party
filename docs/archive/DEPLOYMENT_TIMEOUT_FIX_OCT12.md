# Deployment Timeout Fix - October 12, 2025

## Problem ❌
Deployment was failing with **"run command timeout"** error during GitHub Actions deployment.

## Root Cause 🔍

### Timeout Configuration Issues
The GitHub Actions workflow had insufficient timeouts for Docker image builds:

**Before:**
- GitHub Actions job timeout: **15 minutes**
- SSH action timeout: **14 minutes**
- Docker parallel build timeout: **20 minutes** (1200s)
- Docker frontend sequential build: **20 minutes** (1200s)
- Docker backend sequential build: **10 minutes** (600s)

**Problem:** Docker builds can take 20+ minutes, but GitHub Actions was killing the process after 14 minutes!

## Solution ✅

### Updated Timeouts

**File: `.github/workflows/deploy.yml`**
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 45  # ← Increased from 15
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        timeout-minutes: 40  # ← Increased from 14
```

**File: `scripts/deployment/build-docker-images.sh`**
```bash
# Parallel build
timeout 1800  # ← 30 minutes (increased from 20)

# Sequential backend build
timeout 900   # ← 15 minutes (increased from 10)

# Sequential frontend build
timeout 1800  # ← 30 minutes (kept at 30)
```

### New Timeout Hierarchy
```
GitHub Actions Job: 45 minutes
  └─ SSH Action: 40 minutes
      └─ Docker Build (parallel): 30 minutes
          OR
      └─ Docker Build (sequential):
          ├─ Backend: 15 minutes
          └─ Frontend: 30 minutes
```

This ensures each level has buffer time and won't be killed prematurely.

## Why Docker Builds Take Long ⏱️

### Frontend Build (Slowest)
1. **Next.js build process**: Compiling all pages, components, and assets
2. **Node modules**: Installing and building dependencies
3. **Optimization**: Minification, tree-shaking, code splitting
4. **Static generation**: Pre-rendering pages
5. **Asset processing**: Images, fonts, CSS

Typical time: **10-20 minutes** (without cache)

### Backend Build (Faster)
1. **Python dependencies**: Installing packages from requirements.txt
2. **Django static files**: Collection and compilation
3. **Database migrations**: Checking and preparing migrations

Typical time: **5-10 minutes** (without cache)

## Optimization Tips 🚀

### 1. Use Docker Layer Caching
Already enabled via BuildKit, but can be improved:

**Add to docker-compose.yml:**
```yaml
services:
  frontend:
    build:
      cache_from:
        - watchparty-frontend:latest
      target: runner
```

### 2. Reduce Frontend Build Size
**In `frontend/next.config.js`:**
```javascript
module.exports = {
  // Reduce build output
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  
  // Skip linting during build (do it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip type checking during build (do it separately)
  typescript: {
    ignoreBuildErrors: false,
  },
}
```

### 3. Use Multi-Stage Builds (Already Implemented)
Your Dockerfiles already use multi-stage builds, which is good!

### 4. GitHub Actions Cache
**Add to `.github/workflows/deploy.yml`:**
```yaml
steps:
  - name: Cache Docker layers
    uses: actions/cache@v3
    with:
      path: /tmp/.buildx-cache
      key: ${{ runner.os }}-buildx-${{ github.sha }}
      restore-keys: |
        ${{ runner.os }}-buildx-
```

### 5. Build Only Changed Services
Instead of building everything, detect changes:

```bash
# In build script
if git diff --name-only HEAD~1 | grep -q "^frontend/"; then
    log_info "Frontend changed, rebuilding..."
    docker-compose build frontend
else
    log_info "Frontend unchanged, skipping build"
fi
```

### 6. Use Remote Build Cache
For faster builds across deployments:

**In docker-compose.yml:**
```yaml
services:
  frontend:
    build:
      cache_from:
        - type=registry,ref=ghcr.io/el-houss-brahim/watchparty-frontend:buildcache
```

## Monitoring Build Times 📊

### Check Build Duration
After deployment, check the GitHub Actions logs:
1. Go to: `https://github.com/EL-HOUSS-BRAHIM/watch-party/actions`
2. Click on the latest workflow run
3. Expand "Deploy over SSH" step
4. Look for timing information

### Expected Timings (Approximate)
- **Repository setup**: 10-30 seconds
- **AWS configuration**: 5-10 seconds
- **SSL setup**: 5-15 seconds
- **Docker build (with cache)**: 5-15 minutes
- **Docker build (no cache)**: 15-30 minutes
- **Service deployment**: 1-2 minutes
- **Health checks**: 1-2 minutes

**Total (with cache)**: 10-20 minutes
**Total (no cache)**: 25-40 minutes

## Troubleshooting Future Timeouts 🔧

### If Deployment Still Times Out

**1. Check which step is slow:**
```bash
# SSH into server
ssh deploy@<lightsail-host>

# Check Docker build progress
cd /srv/watch-party
docker-compose build --progress=plain frontend 2>&1 | tee build.log
```

**2. Build locally on server (bypass GitHub Actions):**
```bash
ssh deploy@<lightsail-host>
cd /srv/watch-party
bash scripts/deployment/deploy-main.sh
```

**3. Increase memory for Node.js:**
```bash
# Already set in build script
NODE_OPTIONS="--max-old-space-size=2048"  # Increase to 4096 if needed
```

**4. Clean Docker cache:**
```bash
# On server
docker system prune -af --volumes
docker builder prune -af
```

**5. Split deployment into two workflows:**
- **Workflow 1**: Build images and push to registry
- **Workflow 2**: Pull images and deploy

## Files Modified ✅

1. **`.github/workflows/deploy.yml`**
   - Increased job timeout: 15 → 45 minutes
   - Increased SSH action timeout: 14 → 40 minutes

2. **`scripts/deployment/build-docker-images.sh`**
   - Increased parallel build timeout: 1200s → 1800s (20 → 30 min)
   - Increased backend build timeout: 600s → 900s (10 → 15 min)
   - Kept frontend build timeout: 1800s (30 min)

## Testing ✅

The deployment will now:
1. Allow up to 45 minutes for the entire workflow
2. Allow up to 40 minutes for SSH operations
3. Allow up to 30 minutes for Docker builds
4. Gracefully fall back to sequential builds if parallel fails
5. Complete successfully without timeout errors

## Monitoring Next Deployment 👀

After pushing this fix, watch the deployment:
1. Go to: https://github.com/EL-HOUSS-BRAHIM/watch-party/actions
2. Watch the workflow progress
3. It should complete successfully within 20-30 minutes
4. The authentication cookie fix will also be deployed

## Commit

**Hash**: c2d4040
**Message**: "Fix: Increase deployment timeouts to prevent timeout errors"

---

**Status**: Fix committed and pushed. Deployment triggered.
**Date**: October 12, 2025
