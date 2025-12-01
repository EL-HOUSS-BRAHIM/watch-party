# 🤖 Agent Onboarding Guide – Watch Party

This document equips any new AI agent, model, or automated assistant with the context, credentials, and workflows required to be productive inside the Watch Party monorepo.

> **Debug account:** `admin@watchparty.local` / `admin123!` (has full dashboard, watch party, and integrations access in dev and staging seed data.)
> **Deployment server:** `ssh deploy@35.181.116.57` (use it if you want to deploy directly or for debugging also make sure you only execute commands from out side the server using ssh don't ever open it or you will lose terminal detection for output.)
> **Front-end domain:** `https://watch-party.brahim-elhouss.me`
> **Back-end domain:** `https://be-watch-party.brahim-elhouss.me`
---

## 1. Project Snapshot

| Area | Details |
| --- | --- |
| Product | Social video platform for synchronized watch parties, personal libraries, and live interactions |
| Repos | Monorepo with `frontend` (Next.js 15 / React 19 / TypeScript) and `backend` (Django 4.2 / DRF / Channels / Celery) |
| Data Stores | PostgreSQL 13+, Redis/Valkey 6+ (cache + Celery broker), AWS S3 (media/static) |
| Realtime | Django Channels + WebSockets (watch parties, chat, presence) |
| Background Jobs | Celery workers + beat for transcoding, notifications, analytics fan-out |
| Video Processing | Custom pipeline + optional S3 upload via `S3VideoUploadView`; Google Drive import + proxy |
| Deployment | Docker + docker-compose (prod/staging/dev); GitHub Actions deploy to AWS Lightsail | 
| Auth | JWT (REST) + session cookies; OAuth integrations (Google Drive, Discord, GitHub, Stripe) |

---

## 2. Feature Map

- **Watch Parties**: schedule/join/live sync, chat, reactions, polls, playback sync, host controls.
- **Video Library**: upload (direct or S3 pre-signed), import from URL, manage visibility, transcoding status cards, thumbnails.
- **Google Drive Integration**: OAuth, browsing, import, streaming proxy (`/api/videos/gdrive/*`).
- **User System**: profiles, avatars, friendships, notifications, privacy settings, verification, premium flags.
- **Analytics & Dashboards**: engagement heatmaps, retention curves, trending stats (`backend/apps/videos/enhanced_views.py`, `video_analytics` endpoints).
- **Admin/Moderation**: video moderation status, audit logs, deployment health dashboards.
- **Infra Ops**: scripts for deployment (`backend/deploy_*.sh`, root `docker-compose.*`), configuration docs under `docs/`.

---

## 3. File + Directory Landmarks

| Path | Why it matters |
| --- | --- |
| `frontend/app/dashboard/videos/page.tsx` | Main video management UI (uploads, Drive import, streaming buttons). |
| `frontend/hooks/useVideos.ts` | Encapsulates video and Google Drive data fetching + mutations. |
| `frontend/lib/api-client.ts` | Central typed API helper (auth headers, error handling). Update here for new endpoints. |
| `frontend/components/` | Shadcn-based UI primitives (cards, icon buttons, forms). |
| `backend/apps/videos/views.py` | Core REST endpoints: uploads, Google Drive flows, streaming URLs, proxies. |
| `backend/apps/watchparties/` | Party creation, websocket coordination, host controls, chat. |
| `backend/apps/users/` | Auth, profiles, social graph, notification prefs. |
| `backend/apps/integrations/services/google_drive.py` | Drive service wrapper (list/upload/delete/stream). |
| `backend/config/settings/` | Environment-specific settings + installed apps. |
| `backend/scripts/` | Deployment helpers, endpoint scaffolding, cron utilities. |
| `docs/` | Knowledge base: deployment, auth, color redesign, etc. New guides belong here. |
| `docker-compose*.yml` | Compose configs for prod/staging/dev + AWS tailored version. |

---

## 4. Dependencies & Tooling

### Backend (Python / pip)
- Django 4.2, Django REST Framework, django-filter, django-cors-headers
- Channels + Daphne, Celery + redis/valkey, psycopg2-binary
- boto3 / django-storages (S3), google-api-python-client (Drive), stripe, sentry-sdk
- pytest + pytest-django, factory-boy for tests

### Frontend (Node / npm / pnpm)
- Next.js 15.5.4, React 19, TypeScript 5
- TailwindCSS 3, clsx, tailwind-merge, shadcn/ui components
- React Query (`@tanstack/react-query`), Video.js, Axios (legacy), Testing Library + Jest 30, Playwright (E2E)

### Services
- PostgreSQL 13+ (`DATABASE_URL`)
- Redis 6+ for cache + Celery broker (`REDIS_URL`)
- AWS S3 bucket + CloudFront/CDN (configured via env)
- Optional: Valkey/Redis via AWS ElastiCache; Lightsail host for Docker

---

## 5. Environment & MCP Settings

When onboarding a new agent/model (e.g., MCP server):
1. **Workspace root**: `/home/bross/Desktop/watch-party` (or repo root in your environment).
2. **Python env**: activate `backend/venv` or use `pip install -r backend/requirements/development.txt`.
3. **Node env**: `cd frontend && npm install` (pnpm 10 supported, but npm scripts used in CI).
4. **MCP recommended settings**:
   - **Default shell**: `zsh` (matches developer environment).
   - **Run commands from repo root** unless noted.
   - **Auto-run tests**: `cd frontend && npx jest <suite>` for UI changes; `cd backend && pytest` for API changes.
   - **Preferred editors**: VS Code with TODO management + diff tools.
   - **Secrets handling**: never check in `.env` values; use `backend/.env` + `frontend/.env.local` templates.
5. **Access tokens**: rely on cookies/JWT managed by `frontend/lib/api-client.ts`; server-side requests happen via `NEXT_PUBLIC_API_URL`.
6. **Observability**: logs under `backend/logs/`, Celery output via `start-celery-worker.sh`/`start-celery-beat.sh`.

---

## 6. Setup Workflow

### Backend Quickstart
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
cp .env.example .env  # fill DB, Redis, AWS, OAuth keys
python manage.py migrate
python manage.py createsuperuser  # optional, admin account already seeded
python manage.py runserver 0.0.0.0:8001
```
Supporting services:
- Celery worker: `./start-celery-worker.sh`
- Celery beat: `./start-celery-beat.sh`
- Channels/Daphne: `./start-daphne.sh`
- Static build (prod): `python manage.py collectstatic`

### Frontend Quickstart
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev  # Next.js dev server on :3000
```
- Build: `npm run build`
- Lint: `npm run lint`
- Unit tests: `npm test` or targeted `npx jest path/to/test`
- Playwright E2E: `npm run test:e2e`

### Combined Dev Script
```bash
./scripts/dev-setup.sh  # boots backend + frontend concurrently
```

---

## 7. Critical Workflows & Reference Endpoints

| Feature | Frontend Touchpoints | Backend Touchpoints |
| --- | --- | --- |
| Google Drive import | `videosApi.uploadFromGDrive`, `useVideos.ts`, `dashboard/videos/page.tsx` buttons with aria labels | `GoogleDriveMoviesView.post`, Drive service, `VideoSerializer` |
| Google Drive upload to Drive | `videosApi.getGDriveVideos` grid, `handleImport`/`handleStream` handlers | `GoogleDriveMovieUploadView` (multipart), `get_drive_service()` |
| Direct uploads | `videosApi.create`, file-drop UI in `dashboard/videos/page.tsx` | `VideoUploadView`, `VideoUploadCompleteView` |
| Watch party sync | `frontend/app/watch-parties/*`, WebSocket hooks | `backend/apps/watchparties/consumers.py`, Channels routing |
| Analytics dashboards | `frontend/app/dashboard/analytics/*` | `video_analytics`, `trending_videos_analytics`, etc. |
| Authentication | `frontend/app/(auth)`, `authApi` helpers | `backend/apps/auth/views.py`, JWT issuance |

Backend API docs served at `/api/docs/` (Swagger) and `/api/redoc/`.

---

## 8. Testing & Quality Gates

| Layer | Command |
| --- | --- |
| Backend unit/integration | `cd backend && pytest` |
| Frontend unit | `cd frontend && npm test` |
| Frontend lint | `cd frontend && npm run lint` |
| E2E (Playwright) | `cd frontend && npm run test:e2e` |
| API contract | `backend/test_all_routes.py` & `test_schema.yml` |

Policy: Run affected tests after touching runnable code; keep builds green before closing a task.

---

## 9. Operational Notes

- **Docker**: `docker-compose.yml` for prod parity; `.dev`, `.staging`, `.aws` variants for alternate infra.
- **Scripts**: `backend/deploy_*.sh`, `setup_ssl_remote.sh`, `update_server_config.sh` handle server prep.
- **Logs**: default to `backend/logs/`. Django + Celery loggers preconfigured via `settings/logging.py`.
- **Static files**: stored under `backend/static/` (source) and `backend/staticfiles/` (collected).

---

## 10. When in Doubt

1. Search `docs/` for domain-specific runbooks (authentication, deployments, UX improvements, etc.).
2. Check `backend/apps/<domain>/tests/` for expected behaviors.
3. Use the debug admin account to reproduce UI issues quickly.
4. Inspect API traffic via `frontend/lib/api-client.ts` to understand headers/payloads.
5. Keep this guide updated when adding large features; it’s the canonical onboarding reference for future agents.

Happy shipping! 🚀
