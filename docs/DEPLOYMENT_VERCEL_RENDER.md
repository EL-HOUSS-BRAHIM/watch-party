# Deployment Guide: Vercel + Render + Resend

## Overview

- Frontend: Vercel (`frontend/`)
- Backend API + workers: Render (`backend/`)
- Email: Resend (SMTP)
- Database: Managed PostgreSQL (`DATABASE_URL`)

## 1) Deploy Frontend to Vercel

1. Import the repository in Vercel.
2. Set Root Directory to `frontend`.
3. Configure env vars:
   - `NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com`
   - `NEXT_PUBLIC_WS_URL=wss://<your-render-backend>.onrender.com/ws`
   - `NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>.vercel.app`
4. Deploy.

## 2) Deploy Backend to Render

1. In Render, create services from `render.yaml`.
2. Set backend env vars (from `backend/.env.example`):
   - `DATABASE_URL` (PostgreSQL)
   - `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`
   - `SECRET_KEY`, `JWT_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`
   - `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`
3. Ensure `ENABLE_AWS_SECRETS_MANAGER=False`.
4. Trigger deploy.

## 3) Configure Resend SMTP

Set these backend env vars:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=re_xxxxxxxxxxxxxxxxx
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Watch Party <noreply@yourdomain.com>
```

## 4) Post-deploy Verification

1. Open frontend and verify login/registration.
2. Verify API health endpoint: `/health/`.
3. Trigger an email flow (verification/reset).
4. Check worker and beat logs for Celery task execution.

## 5) Important Note on MongoDB Atlas

This backend uses Django ORM with PostgreSQL and is not a MongoDB-native app.
If you want Atlas, use it for side services only, not as a replacement for the main relational database unless you plan a major rewrite.