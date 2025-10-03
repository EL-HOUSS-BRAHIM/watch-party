# 🔧 Deployment Fixes Summary

## Problems Addressed

### 1. Frontend Deployment Health Check Failure ❌ → ✅

**Problem:**
- Frontend container showing as "unhealthy" in production
- Health checks failing after deployment
- Container logs showing connection errors to backend

**Root Cause:**
The frontend Next.js application uses API routes (e.g., `/app/api/auth/login/route.ts`) that make server-side calls to the Django backend. These routes use:

```typescript
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"
```

However, the `BACKEND_URL` environment variable was **not being set** in the frontend's `.env.local` file during deployment. This caused the frontend to default to `http://localhost:8000`, which doesn't work in Docker since the backend is in a different container.

**Solution:**
Added `BACKEND_URL=http://backend:8000` to the frontend environment configuration in `scripts/deployment/setup-aws-environment.sh`:

```bash
# Frontend .env.local
cat > "$APP_DIR/frontend/.env.local" << 'FRONTEND_ENV'
# Backend URL for server-side API calls (internal Docker network)
BACKEND_URL=http://backend:8000

# Public API URLs for client-side calls
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
...
FRONTEND_ENV
```

**Impact:**
- ✅ Frontend can now communicate with backend during SSR
- ✅ Health checks will pass
- ✅ API routes will work correctly
- ✅ No more "unhealthy" container status

---

### 2. Destroy Workflow Limited to All-or-Nothing ❌ → ✅

**Problem:**
- Could only destroy everything at once
- No way to selectively remove backend or frontend
- Caused unnecessary downtime when only one service needed redeployment

**Solution:**
Enhanced the destroy workflow with three selective options:

#### Option 1: Destroy Both (Complete Teardown)
```yaml
target: both
```
- Stops and removes all Docker containers
- Deletes application directory
- Cleans up nginx configuration
- Prunes Docker resources
- **Use case**: Complete removal or fresh start

#### Option 2: Destroy Backend Only
```yaml
target: backend
```
- Stops backend, celery-worker, celery-beat services
- Keeps frontend running
- Preserves application directory
- **Use case**: Redeploy backend with new config while maintaining frontend

#### Option 3: Destroy Frontend Only
```yaml
target: frontend
```
- Stops frontend service only
- Keeps backend services running
- Preserves application directory
- **Use case**: Fix frontend issues without backend downtime

**Impact:**
- ✅ Selective service destruction
- ✅ Reduced downtime for partial redeployments
- ✅ Better control over infrastructure
- ✅ Automated backups for all destroy operations

---

## How to Use

### Frontend Fix (Automatic)
The fix is applied automatically during the next deployment. The deployment script will:
1. Create frontend `.env.local` with `BACKEND_URL=http://backend:8000`
2. Frontend containers will start successfully
3. Health checks will pass

No manual action required! Just push to master/main branch.

### Selective Destroy Workflow

#### Via GitHub Actions:
1. Go to **Actions** → **Destroy Lightsail Deployment**
2. Click **Run workflow**
3. Enter `destroy` to confirm
4. Select target:
   - `both`: Complete teardown
   - `backend`: Backend services only
   - `frontend`: Frontend service only
5. Click **Run workflow**

#### Manual Execution:
```bash
# SSH into your server
ssh deploy@your-server

# Destroy both (complete teardown)
cd /srv/watch-party
DESTROY_TARGET=both bash scripts/deployment/destroy-services.sh

# Destroy backend only
cd /srv/watch-party
DESTROY_TARGET=backend bash scripts/deployment/destroy-services.sh

# Destroy frontend only
cd /srv/watch-party
DESTROY_TARGET=frontend bash scripts/deployment/destroy-services.sh
```

---

## Files Changed

### 1. `scripts/deployment/setup-aws-environment.sh`
- **Change**: Added `BACKEND_URL` to frontend `.env.local`
- **Purpose**: Enable frontend-to-backend communication in Docker

### 2. `frontend/.env.example`
- **Change**: Added `BACKEND_URL` with documentation
- **Purpose**: Help developers understand the variable

### 3. `.github/workflows/destroy.yml`
- **Change**: Added `target` input parameter and conditional logic
- **Purpose**: Support selective destruction

### 4. `scripts/deployment/destroy-services.sh` (NEW)
- **Purpose**: Modular destroy script for manual use and maintainability

### 5. `backend/docs/deployment/DEPLOYMENT.md`
- **Change**: Updated destroy section with new options
- **Purpose**: Document selective destroy functionality

---

## Testing Recommendations

### Test Frontend Fix:
1. Deploy to production (automatic on push)
2. Wait for deployment to complete
3. Check Docker container status: `docker ps`
4. Verify frontend shows as "healthy"
5. Test API routes by logging in

### Test Selective Destroy:
1. **Test backend-only destroy:**
   - Run destroy workflow with `target: backend`
   - Verify backend stops, frontend keeps running
   - Verify application directory preserved
   
2. **Test frontend-only destroy:**
   - Run destroy workflow with `target: frontend`
   - Verify frontend stops, backend keeps running
   - Verify application directory preserved
   
3. **Test complete destroy:**
   - Run destroy workflow with `target: both`
   - Verify all services stop
   - Verify application directory removed
   - Download backup artifact

---

## Rollback Plan

If issues occur after these changes:

### Frontend Issues:
The `BACKEND_URL` variable is backwards compatible. If it causes issues:
1. Remove `BACKEND_URL` from `.env.local`
2. Frontend will fall back to default `http://localhost:8000`
3. This won't work in Docker, but won't break anything worse than before

### Destroy Workflow Issues:
The selective destroy feature is additive:
1. The `both` option maintains original behavior
2. Can still manually run `docker-compose down` if workflow fails
3. Backup creation happens before any destruction

---

## Benefits

### Immediate Benefits:
- ✅ Frontend health checks pass
- ✅ Reduced deployment failures
- ✅ Better infrastructure control
- ✅ Selective service management

### Long-term Benefits:
- ✅ Faster debugging and iteration
- ✅ Reduced downtime during updates
- ✅ Better separation of concerns
- ✅ More flexible deployment strategies

---

## Next Steps

1. **Monitor next deployment** to confirm frontend health
2. **Document any issues** in GitHub issues if they arise
3. **Consider adding** destroy scripts for individual containers (nginx, celery services)
4. **Plan for** database migration strategy with selective destroys

---

## Questions?

If you have questions about these changes:
1. Check the updated documentation in `backend/docs/deployment/DEPLOYMENT.md`
2. Review the workflow file at `.github/workflows/destroy.yml`
3. Examine the scripts in `scripts/deployment/`
4. Open an issue on GitHub
