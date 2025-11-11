# Backend URL Configuration Fix - October 3, 2025

## Problem
The frontend was making API requests to the wrong domain:
- **Incorrect**: `https://watch-party.brahim-elhouss.me/api/auth/login/`
- **Correct**: `https://be-watch-party.brahim-elhouss.me/api/auth/login/`

This resulted in 500 Internal Server Error responses because the frontend domain doesn't host the backend API.

## Root Cause
The `BACKEND_URL` environment variable in the deployment configuration was set to `http://backend:8000`, which is the internal Docker network address. While this works for internal container-to-container communication, it doesn't work for server-side Next.js API routes that need to make external requests to the real backend domain.

## Solution
Updated the deployment script to use the real backend domain instead of the internal Docker service name.

### Files Modified

#### 1. `/scripts/deployment/setup-aws-environment.sh`
Changed the frontend environment configuration from:
```bash
# Backend URL for server-side API calls (internal Docker network)
BACKEND_URL=http://backend:8000
```

To:
```bash
# Backend URL for server-side API calls (should use the real domain)
BACKEND_URL=https://be-watch-party.brahim-elhouss.me
```

#### 2. `/frontend/.env.local` (Local Development)
Also updated the local environment file for consistency:
```env
BACKEND_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
```

## Why This Matters

### Server-Side API Routes
Next.js API routes (in `/frontend/app/api/`) run on the server and use the `BACKEND_URL` environment variable to proxy requests to Django. These include:
- `/frontend/app/api/auth/login/route.ts`
- `/frontend/app/api/auth/register/route.ts`
- `/frontend/app/api/parties/route.ts`
- `/frontend/app/api/parties/public/[code]/route.ts`

### Client-Side Requests
Client-side code uses `NEXT_PUBLIC_API_URL` (which was already correct) for direct API calls from the browser.

## Environment Variable Usage

| Variable | Used By | Purpose | Value |
|----------|---------|---------|-------|
| `BACKEND_URL` | Server-side Next.js API routes | Proxy requests to Django backend | `https://be-watch-party.brahim-elhouss.me` |
| `NEXT_PUBLIC_API_URL` | Client-side React components | Direct browser API calls | `https://be-watch-party.brahim-elhouss.me` |
| `NEXT_PUBLIC_WS_URL` | Client-side WebSocket | Real-time connections | `wss://be-watch-party.brahim-elhouss.me/ws` |

## Deployment Process

The environment variables are set during deployment in this order:

1. **GitHub Actions** triggers deployment (`.github/workflows/deploy.yml`)
2. **Main deployment script** runs (`scripts/deployment/deploy-main.sh`)
3. **AWS environment setup** creates `.env` files (`scripts/deployment/setup-aws-environment.sh`) ← **Fixed here**
4. **Docker Compose** uses these `.env` files to configure containers (`docker-compose.yml`)
5. **Frontend container** starts with correct `BACKEND_URL`

## Testing

After redeployment, verify the fix:

1. **Check environment variable in container**:
   ```bash
   docker exec -it <frontend-container> env | grep BACKEND_URL
   # Should show: BACKEND_URL=https://be-watch-party.brahim-elhouss.me
   ```

2. **Test login endpoint**:
   ```bash
   curl -X POST https://watch-party.brahim-elhouss.me/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

3. **Check browser network tab**:
   - Login request should go to `https://be-watch-party.brahim-elhouss.me/api/auth/login/`
   - Should return 200 or 401 (not 500)

## Important Notes

⚠️ **Local `.env.local` changes don't affect production**
- Local file is for development only
- Production uses the deployment script to generate `.env.local`
- Always update `scripts/deployment/setup-aws-environment.sh` for production changes

⚠️ **Requires redeployment**
- Changes take effect on next GitHub Actions deployment
- Or manually trigger deployment workflow
- Or SSH into server and run deployment script

## Related Files

- `/scripts/deployment/setup-aws-environment.sh` - Generates production env files
- `/frontend/.env.local` - Local development environment
- `/frontend/.env.example` - Environment template
- `/docker-compose.yml` - Docker service configuration
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow

## Verification Checklist

- [x] Updated deployment script with correct BACKEND_URL
- [x] Updated local .env.local for development
- [x] Documented the fix
- [ ] Deploy to production via GitHub Actions
- [ ] Verify frontend can authenticate successfully
- [ ] Test all API endpoints work correctly
