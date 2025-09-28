# Environment Setup Guide

This document explains how to set up environment variables for the Watch Party application.

## Overview

The application uses separate environment files for frontend and backend:

- **Backend**: `backend/.env` (comprehensive Django/Python configuration)
- **Frontend**: `frontend/.env.local` (Next.js configuration)

## Quick Setup

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend configuration
nano backend/.env

# Frontend is pre-configured, but you can customize
nano frontend/.env.local
```

## Backend Environment (`backend/.env`)

### Key Configuration Areas:

1. **Database** (Docker containers or external AWS RDS)
2. **Redis** (Docker container or AWS ElastiCache) 
3. **AWS Services** (uses IAM role MyAppRole - no keys needed)
4. **Authentication** (JWT secrets, OAuth providers)
5. **Email** (SMTP configuration)
6. **Payment** (Stripe keys if using billing)
7. **Security** (CORS, CSRF, SSL settings)

### Critical Settings for Production:

```bash
# Generate new secret keys
SECRET_KEY=your-unique-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
JWT_REFRESH_SECRET_KEY=your-jwt-refresh-secret-key

# Domains
ALLOWED_HOSTS=35.181.116.57,be-watch-party.brahim-elhouss.me,watch-party.brahim-elhouss.me
CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me

# Database (for Docker deployment)
DATABASE_URL=postgresql://watchparty:watchparty123@db:5432/watchparty

# Redis (for Docker deployment)  
REDIS_URL=redis://redis:6379/0

# AWS (uses IAM role - no keys needed)
USE_S3=true
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

## Frontend Environment (`frontend/.env.local`)

Pre-configured with correct API endpoints:

```bash
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws

# Optional customizations
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## AWS Integration Notes

- **No AWS access keys needed** - uses IAM role `MyAppRole`
- **Database/Redis credentials** managed via AWS Secrets Manager when using external AWS services
- **S3 access** provided automatically via IAM role
- **Region**: `eu-west-3` (matches your existing setup)

## Docker vs External Services

The configuration supports both:

1. **Docker containers** (default for development/simple production)
   - PostgreSQL container
   - Redis container
   - Self-contained deployment

2. **External AWS services** (for production scale)
   - AWS RDS PostgreSQL
   - AWS ElastiCache Redis
   - AWS S3 for media storage

Switch by updating the DATABASE_URL and REDIS_URL in `backend/.env`.

## Security Checklist

- [ ] Generate new SECRET_KEY and JWT keys
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Set up CORS_ALLOWED_ORIGINS correctly
- [ ] Configure email SMTP (if using notifications)
- [ ] Add OAuth client IDs/secrets (if using social auth)
- [ ] Set up Stripe keys (if using payments)
- [ ] Verify AWS IAM role permissions
- [ ] Configure Sentry DSN (if using error tracking)

## Need Help?

Check the comprehensive `.env.example` files for all available options and documentation.