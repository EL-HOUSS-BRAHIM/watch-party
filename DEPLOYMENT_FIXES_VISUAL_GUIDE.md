# 🎨 Visual Guide: Deployment Fixes

## 1. Frontend Container Communication Fix

### Before Fix ❌

```
┌─────────────────────────────────────────────────────┐
│ Docker Host                                          │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │ Frontend         │      │ Backend          │   │
│  │ Container        │      │ Container        │   │
│  │                  │      │                  │   │
│  │ BACKEND_URL=???  │  ✗   │ Django API       │   │
│  │ (undefined)      │      │ Port: 8000       │   │
│  │                  │      │                  │   │
│  │ Tries:           │      │                  │   │
│  │ localhost:8000 ──┼──────┼──X (fails)       │   │
│  │                  │      │                  │   │
│  │ Result:          │      │                  │   │
│  │ Health Check ✗   │      │ Health Check ✓   │   │
│  │ Status: unhealthy│      │ Status: healthy  │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

Problem: Frontend can't reach backend because "localhost"
         refers to the frontend container itself, not the
         backend container.
```

### After Fix ✅

```
┌─────────────────────────────────────────────────────┐
│ Docker Host                                          │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │ Frontend         │      │ Backend          │   │
│  │ Container        │      │ Container        │   │
│  │                  │      │                  │   │
│  │ BACKEND_URL=     │  ✓   │ Django API       │   │
│  │ http://backend:  │──────│ Port: 8000       │   │
│  │ 8000             │      │                  │   │
│  │                  │      │                  │   │
│  │ Uses Docker      │      │                  │   │
│  │ network to reach │      │                  │   │
│  │ backend by name  │      │                  │   │
│  │                  │      │                  │   │
│  │ Result:          │      │                  │   │
│  │ Health Check ✓   │      │ Health Check ✓   │   │
│  │ Status: healthy  │      │ Status: healthy  │   │
│  └──────────────────┘      └──────────────────┘   │
│           │                         │               │
│           └─────────────────────────┘               │
│              watchparty-network                     │
│                                                      │
└─────────────────────────────────────────────────────┘

Solution: BACKEND_URL=http://backend:8000 uses Docker's
         internal network to route requests correctly.
```

---

## 2. Selective Destroy Options

### Before (All-or-Nothing) ❌

```
GitHub Actions Workflow
         │
         ▼
   ┌─────────┐
   │ Destroy │
   └────┬────┘
        │
        ▼
   Everything gets destroyed:
   ✗ Backend
   ✗ Frontend
   ✗ Celery Workers
   ✗ All Volumes
   ✗ Application Directory
   ✗ Nginx Config
   
   Result: Complete downtime
```

### After (Selective) ✅

```
GitHub Actions Workflow
         │
         ▼
    Select Target:
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
┌───────┬────────┬──────────┐
│Backend│Frontend│   Both   │
└───┬───┴────┬───┴─────┬────┘
    │        │         │
    ▼        ▼         ▼
```

#### Option 1: Destroy Backend Only

```
Services After Destroy:
┌─────────────────────────────────────┐
│ ✗ Backend          (stopped)        │
│ ✗ Celery Worker    (stopped)        │
│ ✗ Celery Beat      (stopped)        │
│ ✓ Frontend         (running)        │
│ ✓ Nginx            (running)        │
│ ✓ App Directory    (preserved)      │
│ ✓ Volumes          (preserved)      │
└─────────────────────────────────────┘

Use Case: Redeploy backend with new configuration
```

#### Option 2: Destroy Frontend Only

```
Services After Destroy:
┌─────────────────────────────────────┐
│ ✓ Backend          (running)        │
│ ✓ Celery Worker    (running)        │
│ ✓ Celery Beat      (running)        │
│ ✗ Frontend         (stopped)        │
│ ✓ Nginx            (running)        │
│ ✓ App Directory    (preserved)      │
│ ✓ Volumes          (preserved)      │
└─────────────────────────────────────┘

Use Case: Fix frontend issues without backend downtime
```

#### Option 3: Destroy Both (Complete)

```
Services After Destroy:
┌─────────────────────────────────────┐
│ ✗ Backend          (removed)        │
│ ✗ Celery Worker    (removed)        │
│ ✗ Celery Beat      (removed)        │
│ ✗ Frontend         (removed)        │
│ ✗ Nginx            (running)        │
│ ✗ App Directory    (deleted)        │
│ ✗ Volumes          (pruned)         │
│ ✗ Nginx Config     (cleaned)        │
└─────────────────────────────────────┘

Use Case: Complete removal or fresh start
```

---

## 3. Workflow Decision Tree

```
                   GitHub Actions
                         │
                         ▼
              ┌──────────────────┐
              │ Destroy Workflow │
              └────────┬─────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Type "destroy" │
              │   to confirm   │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Select Target: │
              └────────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌──────────┐   ┌──────┐
   │Backend │    │ Frontend │   │ Both │
   └───┬────┘    └─────┬────┘   └───┬──┘
       │               │             │
       ▼               ▼             ▼
  Stop backend    Stop frontend  Stop all
  services        service        services
       │               │             │
       ▼               ▼             ▼
  Keep frontend   Keep backend   Remove all
  running         running        resources
       │               │             │
       ▼               ▼             ▼
  Preserve data   Preserve data  Clean everything
       │               │             │
       └───────────────┴─────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Create Backup  │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │Upload Artifact │
              └────────────────┘
```

---

## 4. Environment Variables Flow

### Frontend Environment Setup

```
Deployment Script
      │
      ▼
┌─────────────────────────────────────────────┐
│ setup-aws-environment.sh                    │
│                                             │
│ Creates frontend/.env.local:                │
│                                             │
│ # Server-side (API routes)                 │
│ BACKEND_URL=http://backend:8000            │
│                                             │
│ # Client-side (browser)                    │
│ NEXT_PUBLIC_API_URL=https://be...          │
│ NEXT_PUBLIC_WS_URL=wss://be...             │
│ ...                                         │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ Frontend Container                          │
│                                             │
│ When frontend starts:                       │
│                                             │
│ 1. Reads .env.local                         │
│ 2. Sets process.env.BACKEND_URL            │
│ 3. API routes use it for SSR               │
│ 4. Client gets NEXT_PUBLIC_* vars          │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ API Route Execution                         │
│                                             │
│ /app/api/auth/login/route.ts:              │
│                                             │
│ const BACKEND_URL =                         │
│   process.env.BACKEND_URL ||               │
│   "http://localhost:8000"                  │
│                                             │
│ fetch(`${BACKEND_URL}/api/auth/login/`)    │
│       └─> http://backend:8000/...          │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│ Backend Container                           │
│                                             │
│ Receives request on:                        │
│ http://backend:8000/api/auth/login/        │
│                                             │
│ Processes and returns response              │
└─────────────────────────────────────────────┘
```

---

## 5. Docker Compose Service Dependencies

```
                    ┌──────────┐
                    │  Nginx   │
                    └─────┬────┘
                          │
                depends_on
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌───────────────┐           ┌──────────────┐
    │   Backend     │           │   Frontend   │
    │  (healthy)    │◄──────────┤  BACKEND_URL │
    └───────┬───────┘  depends  └──────────────┘
            │            on
    condition: healthy
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌──────────┐
│ Celery  │   │  Celery  │
│ Worker  │   │   Beat   │
└─────────┘   └──────────┘

Legend:
─────► depends_on relationship
◄────► communication path
```

---

## 6. Deployment vs Destroy Flow

### Deployment Flow (Automated)

```
GitHub Push
    │
    ▼
Deploy Workflow
    │
    ├─> Clone/Update Repo
    │
    ├─> Setup Environment
    │   └─> Create .env files
    │       └─> Set BACKEND_URL ✓
    │
    ├─> Build Docker Images
    │
    ├─> Start Services
    │   ├─> Backend (starts first)
    │   ├─> Celery Workers
    │   ├─> Frontend (after backend healthy)
    │   └─> Nginx
    │
    └─> Health Checks
        └─> All services healthy ✓
```

### Destroy Flow (Manual Trigger)

```
GitHub Actions → Run Workflow
    │
    ▼
Destroy Workflow
    │
    ├─> Confirm: "destroy"
    │
    ├─> Select Target
    │   ├─> backend
    │   ├─> frontend
    │   └─> both
    │
    ├─> Create Backup
    │   ├─> App directory
    │   └─> Docker volumes
    │
    ├─> Stop Services (selective)
    │   └─> Based on target
    │
    ├─> Remove Resources (conditional)
    │   ├─> If "both": full cleanup
    │   └─> Else: preserve most
    │
    └─> Upload Backup Artifact
```

---

## 7. Before and After Summary

### Before These Changes

```
Problems:
┌─────────────────────────────────────────┐
│ 1. Frontend container unhealthy ✗       │
│    - Missing BACKEND_URL                │
│    - Health checks failing              │
│    - API routes broken                  │
│                                         │
│ 2. Destroy workflow inflexible ✗        │
│    - All-or-nothing only                │
│    - Unnecessary downtime               │
│    - No partial redeployment            │
└─────────────────────────────────────────┘
```

### After These Changes

```
Solutions:
┌─────────────────────────────────────────┐
│ 1. Frontend container healthy ✓         │
│    - BACKEND_URL properly set           │
│    - Health checks passing              │
│    - API routes working                 │
│                                         │
│ 2. Destroy workflow flexible ✓          │
│    - Three selective options            │
│    - Reduced downtime                   │
│    - Partial redeployment support       │
└─────────────────────────────────────────┘
```

---

## 8. Quick Reference

### Commands

```bash
# Check service health
docker ps

# View frontend logs
docker logs watch-party-frontend-1

# View backend logs
docker logs watch-party-backend-1

# Manual destroy (backend only)
cd /srv/watch-party
DESTROY_TARGET=backend bash scripts/deployment/destroy-services.sh

# Manual destroy (frontend only)
cd /srv/watch-party
DESTROY_TARGET=frontend bash scripts/deployment/destroy-services.sh

# Manual destroy (complete)
cd /srv/watch-party
DESTROY_TARGET=both bash scripts/deployment/destroy-services.sh
```

### Files Modified

```
✏️  Modified Files:
    - .github/workflows/destroy.yml
    - scripts/deployment/setup-aws-environment.sh
    - frontend/.env.example
    - backend/docs/deployment/DEPLOYMENT.md

📄 New Files:
    - scripts/deployment/destroy-services.sh
    - DEPLOYMENT_FIXES_SUMMARY.md
    - DEPLOYMENT_FIXES_VISUAL_GUIDE.md (this file)
```

---

## Need Help?

1. **Frontend still unhealthy?**
   - Check if `.env.local` has `BACKEND_URL`
   - Verify backend container is running and healthy
   - Check Docker network connectivity

2. **Destroy not working?**
   - Verify you typed "destroy" correctly
   - Check selected target option
   - Review backup artifact after workflow

3. **Questions?**
   - Check DEPLOYMENT_FIXES_SUMMARY.md
   - Review backend/docs/deployment/DEPLOYMENT.md
   - Open an issue on GitHub
