# Watch Party Implementation Checklist

## ✅ COMPLETED (Phase 1)

### Security & CORS Configuration
- [x] Fixed `CORS_ALLOW_ALL_ORIGINS` from `True` to `False` in production
- [x] Added VS Code Simple Browser support with regex patterns
- [x] Updated allowed origins to include localhost variations
- [x] Added development CORS regex patterns for VS Code
- [x] Updated Next.js config to detect VS Code environment
- [x] Documented X_FRAME_OPTIONS setting for embedded previews

### WebSocket Consolidation
- [x] Added deprecation warnings to `PartyConsumer`
- [x] Added deprecation warnings to `VideoSyncConsumer`
- [x] Documented that `EnhancedPartyConsumer` is the recommended consumer
- [x] Existing routes: `ws/party/<party_id>/enhanced/` is available

### Backend Models Verification
- [x] Video models: `VideoLike` and `VideoComment` exist ✓
- [x] Support models: `SupportTicket` and `SupportTicketMessage` exist ✓
- [x] Events models: `Event`, `EventAttendee`, `EventInvitation` exist ✓
- [x] All models have proper serializers and views ✓

## 🔴 CRITICAL - MUST DO IMMEDIATELY

### 1. Replace Placeholder Secrets in Production

**File:** `backend/.env`

Generate new secrets:
```bash
# Run these commands to generate secure secrets
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(64))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(64))"
python -c "import secrets; print('JWT_REFRESH_SECRET_KEY=' + secrets.token_urlsafe(64))"
```

**Required replacements:**
- [ ] `SECRET_KEY` - Generate new 64-char secret
- [ ] `JWT_SECRET_KEY` - Generate new 64-char secret  
- [ ] `JWT_REFRESH_SECRET_KEY` - Generate new 64-char secret
- [ ] `DB_PASSWORD` - Get from AWS RDS Console
- [ ] `REDIS_PASSWORD` - Get from AWS ElastiCache Console
- [ ] `AWS_STORAGE_BUCKET_NAME` - Set actual S3 bucket name
- [ ] `STRIPE_PUBLISHABLE_KEY` - Get from Stripe Dashboard
- [ ] `STRIPE_SECRET_KEY` - Get from Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` - Get from Stripe Dashboard
- [ ] `EMAIL_HOST_USER` - Configure email service
- [ ] `EMAIL_HOST_PASSWORD` - Configure email service password
- [ ] `GOOGLE_OAUTH_CLIENT_ID` - Get from Google Cloud Console
- [ ] `GOOGLE_OAUTH_CLIENT_SECRET` - Get from Google Cloud Console
- [ ] `YOUTUBE_API_KEY` - Get from Google Cloud Console
- [ ] `FIREBASE_PROJECT_ID` - Get from Firebase Console
- [ ] `FIREBASE_PRIVATE_KEY` - Get from Firebase JSON
- [ ] `FIREBASE_CLIENT_EMAIL` - Get from Firebase JSON

### 2. Verify Authentication Fix

Test the authentication flow:
- [ ] Login works and session persists
- [ ] Cookies are set correctly (check browser DevTools)
- [ ] Session persists after page reload
- [ ] Logout works properly
- [ ] No redirect loops to login page

### 3. Test VS Code Simple Browser Access

**Backend:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Then in VS Code:
- [ ] Right-click on `http://localhost:3000`
- [ ] Select "Open in Simple Browser"
- [ ] Verify no CORS errors in console
- [ ] Test login/logout
- [ ] Test WebSocket connections

## 🟡 HIGH PRIORITY - DO NEXT

### 4. Frontend Environment Configuration

**Development** (`frontend/.env.local`):
```bash
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
VSCODE_SIMPLE_BROWSER=true
NODE_ENV=development
```

**Production** (`frontend/.env.production`):
```bash
BACKEND_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
NODE_ENV=production
```

- [ ] Create `.env.local` for development
- [ ] Create `.env.production` for production
- [ ] Verify build-time variables work in Docker

### 5. WebSocket Frontend Update

Update frontend to use the recommended WebSocket endpoint:

**Files to check/update:**
- [ ] `frontend/contexts/PartyContext.tsx`
- [ ] `frontend/components/party/*.tsx`
- [ ] Search for `ws/party/${partyId}/` and update to `ws/party/${partyId}/enhanced/`

### 6. Complete Billing Integration

**Backend:**
- [ ] Verify Stripe webhook handler is active
- [ ] Test subscription creation flow
- [ ] Test subscription cancellation
- [ ] Test payment method update

**Frontend:**
- [ ] Remove mock data from `PremiumBenefits.tsx`
- [ ] Connect to real billing API endpoints
- [ ] Test payment flow end-to-end

### 7. Database Migrations

Run any pending migrations:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

- [ ] Check for any pending migrations
- [ ] Run migrations in development
- [ ] Run migrations in production (coordinate with deployment)

## 🟢 MEDIUM PRIORITY - IMPROVE QUALITY

### 8. Add Test Coverage

**Backend Tests:**
```bash
cd backend
pytest
```

- [ ] Write tests for video comments API
- [ ] Write tests for video likes API
- [ ] Write tests for support tickets API
- [ ] Write tests for events API
- [ ] Write tests for authentication flow

**Frontend Tests:**
```bash
cd frontend
npm test
```

- [ ] Write component tests for dashboard
- [ ] Write tests for party features
- [ ] Write tests for authentication
- [ ] Write E2E tests with Playwright

### 9. Documentation Cleanup

- [ ] Move old fix docs to `/docs/archive/`
- [ ] Create consolidated deployment guide
- [ ] Create API documentation
- [ ] Update main README with VS Code support
- [ ] Create troubleshooting guide

### 10. Performance Optimization

- [ ] Test video upload with 5GB limit
- [ ] Monitor Redis connection pooling
- [ ] Test WebSocket connection limits
- [ ] Add database query optimization
- [ ] Add CDN caching for static assets

### 11. Error Monitoring Setup

- [ ] Get Sentry DSN and add to `.env`
- [ ] Test error reporting in Sentry
- [ ] Set up error alerts
- [ ] Create error dashboards
- [ ] Configure log aggregation

## 📊 TESTING MATRIX

### Local Development
- [ ] Backend runs on `localhost:8000`
- [ ] Frontend runs on `localhost:3000`
- [ ] VS Code Simple Browser works
- [ ] WebSocket connections work
- [ ] File uploads work
- [ ] Authentication works

### Production
- [ ] CORS allows only specified origins
- [ ] HTTPS/WSS connections work
- [ ] Authentication cookies work
- [ ] Video uploads to S3 work
- [ ] Redis/Valkey connections work
- [ ] Database connections work
- [ ] Email sending works

### Security Verification
- [ ] All placeholder secrets replaced
- [ ] `CORS_ALLOW_ALL_ORIGINS = False` in production
- [ ] Database password changed from default
- [ ] JWT secrets are unique and secure
- [ ] Stripe keys are for production (not test)
- [ ] HTTPS enforced in production
- [ ] Security headers present

## 🚀 DEPLOYMENT STEPS

### Pre-Deployment
1. [ ] Replace all placeholder secrets
2. [ ] Run database migrations locally
3. [ ] Test full application flow locally
4. [ ] Run linters and formatters
5. [ ] Update version number

### Deployment
1. [ ] Build Docker images with new changes
2. [ ] Push to container registry
3. [ ] Update environment variables on server
4. [ ] Run database migrations on production
5. [ ] Deploy backend
6. [ ] Deploy frontend
7. [ ] Verify CORS settings work

### Post-Deployment
1. [ ] Test login/logout flow
2. [ ] Test WebSocket connections
3. [ ] Test video uploads
4. [ ] Test billing flow
5. [ ] Monitor error logs
6. [ ] Check performance metrics

## 📝 NOTES

### CORS Configuration Summary
- **Production:** Specific allowed origins only, includes localhost for development
- **Development:** Allow all origins with additional regex patterns for VS Code
- **VS Code Support:** Regex patterns allow `vscode-webview://`, `*.vscode-cdn.net`, and GitHub Codespaces

### WebSocket Endpoints
- **Deprecated:** `ws/party/<id>/` and `ws/party/<id>/sync/`
- **Recommended:** `ws/party/<id>/enhanced/` (EnhancedPartyConsumer)
- **Reason:** Comprehensive features, better error handling, unified connection management

### Known Working Features
- ✅ Video models with comments and likes
- ✅ Support ticket system
- ✅ Events management system
- ✅ User authentication (needs verification)
- ✅ Real-time chat
- ✅ Video sync (needs testing)
- ✅ Social features (friends, groups)

### Known Issues to Fix
- ⚠️ Authentication session persistence (fix documented, needs validation)
- ⚠️ Billing uses mock data on frontend
- ⚠️ Some TODO comments remain in code
- ⚠️ Test coverage is minimal
- ⚠️ Email service not configured

## 🔍 VERIFICATION COMMANDS

### Check CORS Settings
```bash
# In production.py
grep "CORS_ALLOW_ALL_ORIGINS" backend/config/settings/production.py
# Should show: CORS_ALLOW_ALL_ORIGINS = False
```

### Check for Placeholder Secrets
```bash
grep -r "your-" backend/.env
grep -r "change-this" backend/.env
grep -r "pk_test" backend/.env
# Should return no results in production
```

### Check WebSocket Routes
```bash
grep -r "websocket_urlpatterns" backend/
```

### Check Frontend Environment
```bash
cat frontend/.env.local
cat frontend/.env.production
```

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for CORS errors
2. Check backend logs: `/var/log/watchparty/`
3. Check Django settings are loading correctly
4. Verify environment variables are set
5. Test with curl/Postman before testing in browser

---

**Last Updated:** November 11, 2025
**Version:** 1.0.0
**Status:** Phase 1 Complete - Critical Fixes Applied
