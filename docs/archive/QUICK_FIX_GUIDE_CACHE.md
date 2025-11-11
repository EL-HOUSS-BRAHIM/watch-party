# Quick Fix Guide - Frontend Cache Issues

## Problem
Frontend changes not appearing after deployment despite multiple PR merges and cache clearing attempts.

## Solution Implemented
Added three new ways to force completely fresh Docker builds that bypass all caching layers.

---

## 🚀 Quick Fixes (Choose One)

### Option 1: Clear All Caches (Recommended)
**Best for:** Most cache issues

1. Go to **GitHub Actions** → **Clear Application Caches**
2. Click **"Run workflow"**
3. Select target: **"all"**
4. Click **"Run workflow"** button
5. Wait for completion (removes all caches + old Docker images)
6. Push a new commit or trigger deployment

**What it does:**
- Clears frontend build artifacts (`.next`, `.turbo`)
- Clears backend caches (`__pycache__`)
- Clears Docker builder cache
- **NEW:** Removes old Docker images (`watchparty-backend:latest`, `watchparty-frontend:latest`)

**Result:** Next deployment will build completely fresh

---

### Option 2: Force Rebuild Deploy (Immediate)
**Best for:** Need immediate fresh deployment

1. Go to **GitHub Actions** → **Deploy to Lightsail**
2. Click **"Run workflow"**
3. Check ✅ **"Force rebuild without cache"**
4. Click **"Run workflow"** button

**What it does:**
- Builds with `--no-cache --pull` flags
- Downloads fresh base images
- Ignores all cached layers
- Deploys immediately

**Result:** Immediate deployment with completely fresh build

---

### Option 3: SSH Manual Override (Emergency)
**Best for:** Direct server access needed

```bash
# SSH into your server
ssh deploy@your-server

# Navigate to app directory
cd /srv/watch-party  # or ~/watch-party

# Clear all caches
bash scripts/deployment/clear-app-cache.sh all

# Force fresh build
export FORCE_REBUILD=1
export REMOVE_OLD_IMAGES=1
bash scripts/deployment/build-docker-images.sh

# Deploy services
bash scripts/deployment/deploy-services.sh
```

**Result:** Complete manual control, nuclear option

---

## 📊 How to Verify It Worked

### In Build Logs - Look For:

**✅ SUCCESS (Fresh Build):**
```
INFO: FORCE_REBUILD enabled - building without cache
INFO: Removing old Docker images...
SUCCESS: Removed backend image
SUCCESS: Removed frontend image

[Build starts]
#3 [internal] load metadata for docker.io/library/node:18-alpine
#3 DONE 0.5s  ← Fresh pull

#30 [builder 3/4] COPY . .
#30 0.456s  ← Time shown = actually copied!

#31 [builder 4/4] RUN pnpm run build
#31 120.5s  ← Time shown = actually built!
```

**❌ PROBLEM (Still Cached):**
```
#30 [builder 3/4] COPY . .
#30 CACHED  ← Bad! Still using cache

#31 [builder 4/4] RUN pnpm run build
#31 CACHED  ← Bad! Still using cache
```

---

## 🔍 What Was Changed

### Build Script (`scripts/deployment/build-docker-images.sh`)
- Added `FORCE_REBUILD=1` option → uses `--no-cache --pull`
- Added `REMOVE_OLD_IMAGES=1` option → removes old images before build

### Cache Clearing (`scripts/deployment/clear-app-cache.sh`)
- Now removes old Docker images when target is "all"
- Ensures next build is completely fresh

### Deploy Workflow (`.github/workflows/deploy.yml`)
- Added manual workflow dispatch option
- Can now force rebuild from GitHub UI

---

## 🎯 When to Use Each Option

| Situation | Use This Option |
|-----------|----------------|
| Changes not appearing | Option 1: Clear All Caches |
| Need immediate fix | Option 2: Force Rebuild Deploy |
| Suspicious behavior | Option 1: Clear All Caches |
| After major update | Option 2: Force Rebuild Deploy |
| Server is acting weird | Option 3: SSH Manual Override |
| CI/CD pipeline broken | Option 3: SSH Manual Override |

---

## ⏱️ Expected Build Times

| Build Type | Time | Use Case |
|------------|------|----------|
| Normal (with cache) | 2-5 min | Regular deploys |
| After cache clear | 5-10 min | First build after clearing |
| Force rebuild | 10-15 min | Critical/troubleshooting |

---

## 💡 Pro Tips

1. **Normal workflow:** Just push code. Fast builds with cache.

2. **Changes not appearing?** Run Option 1 (Clear Caches), then deploy normally.

3. **Really urgent?** Use Option 2 (Force Rebuild) for immediate fresh deployment.

4. **Still not working?** Use Option 3 (SSH Manual) and check server directly.

5. **Monitor logs:** Always check deployment logs to verify fresh build (look for time values, not "CACHED").

---

## 📝 Technical Details

### The Complete Cache Hierarchy

```
Level 1: Application Build Artifacts
  ├── frontend/.next, .turbo, out
  └── backend/__pycache__, staticfiles
  
Level 2: Docker Builder Cache
  └── Cached layers on disk
  
Level 3: Docker Images (THE FIX!)
  ├── watchparty-backend:latest
  └── watchparty-frontend:latest
  
Level 4: Base Images
  ├── node:18-alpine
  └── python:3.11-slim
```

**Previous fixes only cleared Levels 1-2.**
**This fix clears Levels 3-4 too!**

---

## ✅ Success Indicators

After applying this fix, you should see:

- ✅ Cache clearing workflow removes old images
- ✅ Force rebuild option in deploy workflow UI
- ✅ Build logs show actual times (not "CACHED")
- ✅ Changes appear on deployed site
- ✅ Fresh builds when needed, fast builds normally

---

## 🆘 Still Having Issues?

1. Check that you're using the latest version of the scripts
2. Verify workflow permissions in GitHub Settings
3. Check server disk space: `df -h`
4. Check Docker disk usage: `docker system df`
5. If all else fails, use Option 3 (SSH Manual Override)

---

## 📚 Full Documentation

See `FRONTEND_CACHE_FIX_FINAL.md` for complete technical details and troubleshooting.

---

**Created:** 2024
**Last Updated:** This PR
**Status:** ✅ Implemented and Tested
