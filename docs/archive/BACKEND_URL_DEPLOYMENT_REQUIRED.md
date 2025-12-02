# CONFIRMED: Backend URL Issue Still Present - Quick Fix Required

## 🔴 Current Status: CONFIRMED BROKEN

### Live Test Results (October 3, 2025)

Using Playwright to test `https://watch-party.brahim-elhouss.me/auth/login`:

```
✅ Page loads successfully
✅ Login form renders correctly
❌ Login attempt → 500 Internal Server Error
❌ Request goes to: https://watch-party.brahim-elhouss.me/api/auth/login/
✅ Should go to: https://be-watch-party.brahim-elhouss.me/api/auth/login/
```

**Console Errors:**
```
[ERROR] Failed to load resource: the server responded with a status of 500
[ERROR] API Error (/auth/login/): Error: Internal server error
[ERROR] Login error: Error: Internal server error
```

**Network Request:**
```
POST https://watch-party.brahim-elhouss.me/api/auth/login/ => [500]
```

## 🔧 The Fix (Already Committed)

We've already committed the fix to `docker-compose.yml`:

```yaml
frontend:
  environment:
    - BACKEND_URL=https://be-watch-party.brahim-elhouss.me  # ✅ Hardcoded
    - NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
    # ... other vars ...
```

**Status:** ✅ Code is fixed and pushed to GitHub  
**Problem:** ❌ Server is still running OLD containers without the fix

## 🚀 Quick Fix - Apply Changes Immediately

### Option 1: Run the Quick Fix Script (RECOMMENDED)

SSH into your server and run:

```bash
# SSH to the server
ssh deploy@your-server-ip

# Navigate to app directory
cd /srv/watch-party  # or ~/watch-party

# Pull latest changes and run the fix script
git pull origin master
bash quick-fix-backend-url.sh
```

The script will:
1. ✅ Pull latest code from GitHub
2. ✅ Verify docker-compose.yml has correct settings
3. ✅ Recreate frontend container with new environment
4. ✅ Verify BACKEND_URL is correctly set
5. ✅ Confirm frontend is running

### Option 2: Manual Steps

If you prefer to run commands manually:

```bash
# SSH to server
ssh deploy@your-server-ip

# Navigate to app directory
cd /srv/watch-party  # or ~/watch-party if permissions issue

# Pull latest changes
git pull origin master

# Verify the docker-compose.yml has the fix
grep -A 10 "frontend:" docker-compose.yml | grep "BACKEND_URL"
# Should show: - BACKEND_URL=https://be-watch-party.brahim-elhouss.me

# Recreate frontend container with new environment
docker-compose up -d --force-recreate frontend

# Wait a few seconds
sleep 10

# Verify the environment variable
docker-compose ps -q frontend | xargs docker exec -i env | grep BACKEND_URL
# Should show: BACKEND_URL=https://be-watch-party.brahim-elhouss.me
```

### Option 3: Full Redeployment

Run the full deployment script:

```bash
ssh deploy@your-server-ip
cd /srv/watch-party
bash scripts/deployment/deploy-main.sh
```

This will rebuild everything (takes longer but ensures everything is fresh).

## 📊 Verification Steps

After applying the fix:

### 1. Check Container Environment
```bash
# Get frontend container ID
CONTAINER_ID=$(docker-compose ps -q frontend)

# Check BACKEND_URL
docker exec $CONTAINER_ID env | grep BACKEND_URL

# Should output:
# BACKEND_URL=https://be-watch-party.brahim-elhouss.me
```

### 2. Test Login in Browser
1. Go to: `https://watch-party.brahim-elhouss.me/auth/login`
2. Open Browser DevTools → Network tab
3. Enter any credentials and click "Sign in"
4. Look for the POST request to `/api/auth/login/`
5. **It should now return 401 (Unauthorized) instead of 500!**
   - 401 = Backend is reachable, but credentials are wrong ✅
   - 500 = Backend is not reachable ❌

### 3. Check Network Request URL
The POST request should go to:
```
POST https://be-watch-party.brahim-elhouss.me/api/auth/login/
```

NOT:
```
POST https://watch-party.brahim-elhouss.me/api/auth/login/  ❌
```

## 🎯 Expected Behavior After Fix

### Before (Current - Broken)
```
User enters credentials → Frontend calls /api/auth/login
→ Next.js API route receives request
→ Uses BACKEND_URL (wrong value: http://backend:8000)
→ Tries to reach backend → FAILS
→ Returns 500 error to user
```

### After (Fixed)
```
User enters credentials → Frontend calls /api/auth/login
→ Next.js API route receives request
→ Uses BACKEND_URL (correct: https://be-watch-party.brahim-elhouss.me)
→ Successfully reaches backend
→ Backend validates credentials
→ Returns 200 (success) or 401 (invalid credentials)
```

## 🔍 Why The Fix Wasn't Applied Yet

1. ✅ Code was committed and pushed to GitHub
2. ❌ GitHub Actions workflow is **DISABLED** (see `.github/workflows/deploy.yml`)
3. ❌ Server containers are still running with OLD environment variables
4. ❌ Docker-compose needs to recreate containers to pick up new `environment` section

**Solution:** Manually apply the fix by recreating the frontend container (see options above).

## 📝 Technical Details

### What Changed in docker-compose.yml

**Before:**
```yaml
frontend:
  env_file:
    - ./frontend/.env.local  # Only source - could be wrong on server
```

**After:**
```yaml
frontend:
  environment:
    - BACKEND_URL=https://be-watch-party.brahim-elhouss.me  # Hardcoded - always correct
  env_file:
    - ./frontend/.env.local  # Still here but overridden by environment section
```

### Docker Compose Environment Priority

1. **`environment:` section** ← Highest priority (our fix uses this)
2. `env_file:` section
3. Shell environment
4. Dockerfile ENV

The `environment` section ALWAYS wins, so the hardcoded value will be used regardless of what's in `.env.local`.

## ✅ Verification Checklist

After running the fix:

- [ ] Pulled latest code from GitHub
- [ ] docker-compose.yml has `environment:` section with BACKEND_URL
- [ ] Frontend container recreated
- [ ] Container environment shows correct BACKEND_URL
- [ ] Login page loads without errors
- [ ] Login attempt returns 401 (not 500)
- [ ] Network requests go to be-watch-party.brahim-elhouss.me
- [ ] No "Internal server error" messages

## 🎉 Success Indicators

You'll know it's fixed when:
1. ✅ Login shows "Invalid credentials" instead of "Internal server error"
2. ✅ Browser network tab shows requests going to `be-watch-party.brahim-elhouss.me`
3. ✅ Console shows no 500 errors
4. ✅ With valid credentials, login actually works!

## 📞 If Still Having Issues

If the fix doesn't work:

1. **Check container logs:**
   ```bash
   docker-compose logs --tail=100 frontend
   ```

2. **Verify environment in container:**
   ```bash
   docker-compose exec frontend env
   ```

3. **Check if containers are using latest docker-compose.yml:**
   ```bash
   docker-compose config | grep -A 10 "frontend:"
   ```

4. **Restart all services:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## 📚 Related Files

- `docker-compose.yml` - ✅ FIXED (hardcoded BACKEND_URL)
- `docker-compose.aws.yml` - ✅ FIXED (hardcoded BACKEND_URL)
- `scripts/deployment/setup-aws-environment.sh` - ✅ FIXED (generates correct .env.local)
- `quick-fix-backend-url.sh` - ✅ NEW (apply fix quickly)
- `docs/DOCKER_COMPOSE_ENV_FIX.md` - Full documentation
- `docs/BACKEND_URL_FIX.md` - Original fix documentation

---

**Next Step:** SSH to your server and run `bash quick-fix-backend-url.sh` to apply the fix! 🚀
