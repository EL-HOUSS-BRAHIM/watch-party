# 🚀 Watch Party - Quick Reference Card

## ⚡ Quick Commands

### Setup
```bash
# First time setup
./scripts/quick-setup.sh

# Generate secrets
python3 scripts/generate-secrets.py

# Verify configuration
./scripts/verify-setup.sh
```

### Development
```bash
# Backend (Terminal 1)
cd backend && python manage.py runserver 0.0.0.0:8000

# Frontend (Terminal 2)
cd frontend && npm run dev

# Open VS Code Simple Browser: http://localhost:3000
```

### Testing
```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test

# Check health
curl http://localhost:8000/api/health/
```

---

## 📝 Critical Files

### Configuration
- `backend/.env` - Backend secrets (GENERATE THIS!)
- `frontend/.env.local` - Frontend dev config
- `frontend/.env.production` - Frontend prod config

### Documentation
- `IMPLEMENTATION_CHECKLIST.md` - Complete task list
- `IMPLEMENTATION_SUMMARY.md` - Executive summary
- `docs/VSCODE_SIMPLE_BROWSER_GUIDE.md` - VS Code setup

### Scripts
- `scripts/generate-secrets.py` - Generate secure keys
- `scripts/verify-setup.sh` - Verify configuration
- `scripts/quick-setup.sh` - Automated setup

---

## 🔑 Required Secrets

```bash
SECRET_KEY=                    # Generate with script
JWT_SECRET_KEY=                # Generate with script
JWT_REFRESH_SECRET_KEY=        # Generate with script
DB_PASSWORD=                   # Get from AWS RDS
REDIS_PASSWORD=                # Get from AWS ElastiCache
AWS_STORAGE_BUCKET_NAME=       # Your S3 bucket
STRIPE_PUBLISHABLE_KEY=        # Get from Stripe
STRIPE_SECRET_KEY=             # Get from Stripe
EMAIL_HOST_USER=               # Email service
EMAIL_HOST_PASSWORD=           # Email service
```

---

## ✅ Implementation Status

### ✅ Done (Phase 1)
- [x] CORS security configuration
- [x] VS Code Simple Browser support
- [x] WebSocket consumer consolidation
- [x] Documentation and tooling
- [x] Setup automation scripts

### 🔴 Critical (Do Now)
- [ ] Generate and set secrets
- [ ] Verify authentication works
- [ ] Test VS Code Simple Browser
- [ ] Replace all placeholders

### 🟡 High Priority (Do Next)
- [ ] Update frontend WebSocket endpoints
- [ ] Complete billing integration
- [ ] Add test coverage
- [ ] Run database migrations

---

## 🐛 Common Issues

### CORS Error
```bash
# Check production.py
grep CORS_ALLOW_ALL_ORIGINS backend/config/settings/production.py
# Should be: False
```

### VS Code Not Working
```bash
# Set in frontend/.env.local
VSCODE_SIMPLE_BROWSER=true
# Restart: npm run dev
```

### WebSocket Failed
```bash
# Use enhanced endpoint
ws://localhost:8000/ws/party/<id>/enhanced/
```

### Auth Not Persisting
```bash
# Check cookies in DevTools
# Verify CSRF_TRUSTED_ORIGINS includes localhost
```

---

## 🔍 Verification

```bash
# Check for placeholders
grep -E "your-|change-this" backend/.env

# Check CORS settings
./scripts/verify-setup.sh

# Test backend
curl http://localhost:8000/api/health/

# Test frontend
curl http://localhost:3000
```

---

## 📊 Project Status

**Completion:** ~80%  
**Security:** ✅ Fixed (CORS restricted)  
**VS Code:** ✅ Supported  
**Documentation:** ✅ Complete  
**Secrets:** 🔴 Need to be set  
**Testing:** 🟡 Needs coverage  
**Production:** 🔴 Pending secret config

---

## 🎯 Next Actions

1. Run: `python3 scripts/generate-secrets.py`
2. Update: `backend/.env` with secrets
3. Run: `./scripts/verify-setup.sh`
4. Test: VS Code Simple Browser
5. Deploy: Follow checklist

---

## 📞 Quick Help

**Documentation:** Check `IMPLEMENTATION_CHECKLIST.md`  
**VS Code Issues:** Check `docs/VSCODE_SIMPLE_BROWSER_GUIDE.md`  
**Setup Problems:** Run `./scripts/verify-setup.sh`  
**Secrets:** Run `scripts/generate-secrets.py`

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0  
**Status:** Phase 1 Complete ✅
