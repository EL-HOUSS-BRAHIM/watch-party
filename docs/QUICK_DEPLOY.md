# Quick Reference - Deployment Commands

## 🚀 Deploy to Production (Recommended Path)

### Option 1: Push to GitHub and Auto-Deploy
```bash
# Make sure you're in the frontend directory
cd /workspaces/watch-party/frontend

# Check what will be pushed
git log origin/master..HEAD --oneline

# Push to remote
git push origin master
```

### Option 2: Manual Deployment via SSH
```bash
# SSH into production server
ssh user@watch-party.brahim-elhouss.me

# Navigate to project directory
cd /path/to/watch-party

# Pull latest changes
git pull origin master

# Install dependencies
cd frontend
pnpm install

# Build the project
pnpm build

# Restart the service (choose one):
pm2 restart watchparty-frontend
# OR
systemctl restart watchparty-frontend
# OR
docker-compose restart frontend
```

### Option 3: Docker Deployment
```bash
# From project root
cd /workspaces/watch-party

# Rebuild frontend container
docker-compose build frontend

# Restart with new changes
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend
```

---

## 🧪 Post-Deployment Verification

```bash
# Test support page
curl -I https://watch-party.brahim-elhouss.me/support | head -n 1
# Expected: HTTP/1.1 200 OK

# Test favicon
curl -I https://watch-party.brahim-elhouss.me/favicon.ico | head -n 1
# Expected: HTTP/1.1 200 OK

# Test security headers
curl -I https://watch-party.brahim-elhouss.me/ | grep -i "content-security-policy\|x-frame-options\|strict-transport"
# Expected: All 3 headers present

# Quick health check script
curl -s https://watch-party.brahim-elhouss.me/support | grep -q "Support Center" && echo "✅ Support page working" || echo "❌ Support page issue"
```

---

## 🔄 Rollback if Needed

```bash
# If something goes wrong, revert the commit
git revert ce9c916
git push origin master

# Or hard reset (use with caution!)
git reset --hard HEAD~1
git push origin master --force
```

---

## 📋 Current Commit Info

```
Commit Hash: ce9c916
Message: fix: resolve all 7 issues from Playwright test report
Files Changed: 10
Date: October 11, 2025
```

---

## 🎯 What This Deployment Includes

✅ **Critical Fixes (3)**
- New /support page
- Fixed broken Status link  
- Fixed broken Press Kit link

✅ **Medium Fixes (1)**
- Corrected header navigation

✅ **Minor Fixes (3)**
- Added favicon.ico
- Configured security headers
- Verified anchor links

---

## 📞 Need Help?

Refer to:
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `TESTING_GUIDE.md` - How to test the fixes
- `PLAYWRIGHT_TEST_FIXES_SUMMARY.md` - What was changed
- `BEFORE_AFTER_FIXES.md` - Detailed comparison
