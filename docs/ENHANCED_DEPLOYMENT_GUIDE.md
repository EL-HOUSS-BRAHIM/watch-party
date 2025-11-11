# Enhanced Deployment Workflow Guide

## Overview

This project now uses a **multi-environment manual deployment system** with GitHub Container Registry (GHCR) caching, email notifications, and automated staging cleanup. Deployments are triggered manually through GitHub Actions, eliminating automatic deployments on every push.

## Key Features

- ✅ **Manual Deployments**: No auto-deploy on push, full control over releases
- ✅ **Multi-Environment**: Separate production and staging environments
- ✅ **GHCR Caching**: Fast builds (8-12 min) with Docker layer caching
- ✅ **Email Notifications**: Deployment status sent to `bross.or.of.1@gmail.com`
- ✅ **Version Rollback**: Rollback to any of the last 10 versions
- ✅ **Auto-Cleanup**: Staging stops after 24 hours of inactivity
- ✅ **Selective Rebuilds**: Deploy only changed services (backend/frontend/nginx)

## Environments

### Production
- **Frontend**: https://watch-party.brahim-elhouss.me
- **Backend**: https://be-watch-party.brahim-elhouss.me
- **Database**: `watchparty_prod` on AWS RDS cluster
- **Redis**: Database 0 on Valkey cluster
- **Ports**: Backend 8000, Frontend 3000, Nginx 80/443

### Staging
- **Frontend**: https://staging-watch-party.brahim-elhouss.me
- **Backend**: https://staging-be-watch-party.brahim-elhouss.me
- **Database**: `watchparty_staging` on AWS RDS cluster
- **Redis**: Database 1 on Valkey cluster
- **Ports**: Backend 8003, Frontend 3001, Nginx 8080/8443
- **Auto-cleanup**: Stops after 24h inactivity

## Deployment Workflows

### 1. Deploy to Production

**Trigger**: Manual (GitHub Actions > Deploy to Production)

**Inputs**:
- **Services**: `all`, `backend`, `frontend`, or `nginx`
- **Force Rebuild**: Rebuild without cache (default: false)

**Steps**:
1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch: `master`
5. Choose services to deploy
6. Optionally enable force rebuild
7. Click "Run workflow"

**Duration**: 8-12 minutes (with cache), 15-20 minutes (without cache)

**What happens**:
- Builds Docker images with GHCR layer caching
- Pushes images to GHCR: `ghcr.io/el-houss-brahim/watch-party-{service}:production-{sha}`
- SSH to Lightsail, pulls images
- Deploys with `docker-compose.yml`
- Runs migrations if needed
- Performs health checks
- Sends email notification (success/failure)
- Cleans up old GHCR images (keeps last 10)

### 2. Deploy to Staging

**Trigger**: Manual (GitHub Actions > Deploy to Staging)

**Inputs**:
- **Services**: `all`, `backend`, `frontend`, or `nginx`
- **Force Rebuild**: Rebuild without cache (default: false)

**Steps**:
1. Go to GitHub Actions tab
2. Select "Deploy to Staging" workflow
3. Click "Run workflow"
4. Select your feature branch (any branch)
5. Choose services to deploy
6. Click "Run workflow"

**Duration**: 8-12 minutes (with cache), 15-20 minutes (without cache)

**What happens**:
- Same as production but:
  - Uses `docker-compose.staging.yml`
  - Tags images with `staging-{sha}`
  - Deploys to staging subdomain
  - Records activity timestamp (for auto-cleanup)

**Note**: Staging auto-stops after 24 hours of no HTTP requests to staging subdomains.

### 3. Rollback Deployment

**Trigger**: Manual (GitHub Actions > Rollback Deployment)

**Inputs**:
- **Environment**: `production` or `staging`
- **Version**: Git SHA or `latest`

**Steps**:
1. Go to GitHub Actions tab
2. Select "Rollback Deployment" workflow
3. Click "Run workflow"
4. Select environment
5. Enter git SHA (short or full) or `latest`
6. Click "Run workflow"

**Duration**: 5-8 minutes

**What happens**:
- Lists last 10 available versions from GHCR
- Pulls specified version images
- Redeploys containers
- Runs health checks
- Sends rollback confirmation email

**Finding Version SHAs**:
```bash
# From git history
git log --oneline -10

# From GHCR (requires GitHub CLI)
gh api /users/el-houss-brahim/packages/container/watch-party-backend/versions | jq -r '.[].metadata.container.tags[]' | grep production
```

### 4. Staging Auto-Cleanup

**Trigger**: Automatic (every 4 hours) or Manual

**What happens**:
- Checks Nginx logs for staging subdomain requests
- Checks last deployment timestamp
- If no activity for 24+ hours: stops staging containers
- Sends cleanup notification email
- Resources freed (CPU, memory)

**Manual cleanup**:
1. Go to GitHub Actions tab
2. Select "Staging Auto-Cleanup" workflow
3. Click "Run workflow"
4. Enable "Force cleanup" (optional)
5. Click "Run workflow"

**Restarting staging after cleanup**:
Just run "Deploy to Staging" workflow again!

## GitHub Secrets Required

Add these secrets in GitHub repository settings (Settings > Secrets and variables > Actions):

### AWS Credentials
- `AWS_ACCESS_KEY_ID`: AWS IAM access key
- `AWS_SECRET_ACCESS_KEY`: AWS IAM secret key

### Lightsail SSH
- `LIGHTSAIL_HOST`: `35.181.208.71` (or your Lightsail IP)
- `LIGHTSAIL_SSH_KEY`: Private SSH key for `deploy` user

### Email Notifications (SES SMTP)
- `SES_SMTP_USERNAME`: AWS SES SMTP username (fallback)
- `SES_SMTP_PASSWORD`: AWS SES SMTP password (fallback)

**Note**: SES credentials are primarily fetched from AWS Secrets Manager (`watch-party/ses-smtp`) and rotate every 30 minutes. GitHub secrets are fallback only.

### GitHub Container Registry
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions (no setup needed)

## Local Setup

### Prerequisites
- Docker and Docker Compose installed
- AWS CLI configured (`aws configure`)
- Access to AWS RDS, Valkey, S3, SES

### Setup Staging Database
```bash
# Create watchparty_staging database on RDS
./scripts/setup-staging-database.sh

# Or manually with psql
PGPASSWORD="..." psql -h all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com \
  -U watchparty_admin -d watchparty_prod \
  -c "CREATE DATABASE watchparty_staging;"
```

### Environment Variables

**backend/.env** (production):
```bash
DATABASE_URL=postgresql://watchparty_admin:***@all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432/watchparty_prod?sslmode=require
REDIS_URL=rediss://default:***@clustercfg.watch-party-valkey-001.rnipvl.memorydb.eu-west-3.amazonaws.com:6379/0
# Other settings...
```

**Staging overrides** (in docker-compose.staging.yml):
```bash
STAGING_DATABASE_URL=postgresql://watchparty_admin:***@all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432/watchparty_staging?sslmode=require
STAGING_REDIS_URL=rediss://default:***@clustercfg.watch-party-valkey-001.rnipvl.memorydb.eu-west-3.amazonaws.com:6379/1
```

## Manual Deployment Commands

For testing or emergency deployments, you can SSH to Lightsail:

### Production Deployment
```bash
ssh deploy@35.181.208.71
cd ~/watch-party

# Pull latest code
git pull origin master

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u el-houss-brahim --password-stdin

# Deploy all services
export ENVIRONMENT=production
export SERVICES=all
bash scripts/deployment/deploy-services.sh

# Or deploy specific service
export SERVICES=backend
bash scripts/deployment/deploy-services.sh
```

### Staging Deployment
```bash
ssh deploy@35.181.208.71
cd ~/watch-party

# Checkout feature branch
git fetch origin
git checkout feature-branch

# Deploy staging
export ENVIRONMENT=staging
export SERVICES=all
bash scripts/deployment/deploy-services.sh
```

### Health Checks
```bash
# Check production health
bash scripts/deployment/health-check.sh production

# Check staging health
bash scripts/deployment/health-check.sh staging
```

### View Logs
```bash
# Production logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Staging logs
docker-compose -f docker-compose.staging.yml logs -f backend-staging
docker-compose -f docker-compose.staging.yml logs -f frontend-staging
```

## AWS Secrets Manager Integration

### Current Secrets (Auto-Rotating)
- `rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae`: RDS credentials (rotates every 30 min)
- `watch-party-valkey-001-auth-token`: Valkey/Redis auth token (rotates every 30 min)
- `watch-party/ses-smtp`: SES SMTP credentials (rotates every 30 min)

### Environment-Specific Secrets (To Be Created)
```bash
# Create Stripe secret (production)
aws secretsmanager create-secret \
  --name watch-party/production/stripe \
  --secret-string '{"secret_key":"sk_live_..."}' \
  --region eu-west-3

# Create Stripe secret (staging)
aws secretsmanager create-secret \
  --name watch-party/staging/stripe \
  --secret-string '{"secret_key":"sk_test_..."}' \
  --region eu-west-3

# Create Google OAuth secret (production)
aws secretsmanager create-secret \
  --name watch-party/production/google-oauth \
  --secret-string '{"client_id":"...","client_secret":"..."}' \
  --region eu-west-3

# Create Google OAuth secret (staging)
aws secretsmanager create-secret \
  --name watch-party/staging/google-oauth \
  --secret-string '{"client_id":"...","client_secret":"..."}' \
  --region eu-west-3
```

These secrets will be automatically fetched and rotated by the backend's credential rotation service.

## GHCR Image Management

### Image Naming Convention
- Production: `ghcr.io/el-houss-brahim/watch-party-backend:production-{sha}`
- Staging: `ghcr.io/el-houss-brahim/watch-party-backend:staging-{sha}`
- Latest: `ghcr.io/el-houss-brahim/watch-party-backend:production-latest`

### Manual Cleanup
```bash
# Cleanup old production images (keeps last 10)
bash scripts/deployment/cleanup-ghcr-images.sh production 10

# Cleanup old staging images (keeps last 5)
bash scripts/deployment/cleanup-ghcr-images.sh staging 5
```

### View Available Images
```bash
# Using Docker
docker run --rm quay.io/skopeo/stable:latest list-tags \
  docker://ghcr.io/el-houss-brahim/watch-party-backend

# Using GitHub CLI
gh api /users/el-houss-brahim/packages/container/watch-party-backend/versions | \
  jq -r '.[].metadata.container.tags[]'
```

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs for detailed error
2. SSH to Lightsail and check container logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```
3. Run health checks manually:
   ```bash
   bash scripts/deployment/health-check.sh production
   ```

### Email Notifications Not Received
1. Check spam folder
2. Verify SES SMTP credentials in AWS Secrets Manager:
   ```bash
   aws secretsmanager get-secret-value --secret-id watch-party/ses-smtp
   ```
3. Check GitHub Actions logs for SMTP errors

### GHCR Authentication Failed
1. Ensure `GITHUB_TOKEN` has package write permissions
2. Repository Settings > Actions > General > Workflow permissions: "Read and write permissions"

### Staging Not Auto-Stopping
1. Check cron schedule (runs every 4 hours)
2. Manually trigger "Staging Auto-Cleanup" workflow
3. Check Nginx logs for staging activity:
   ```bash
   sudo grep "staging-watch-party.brahim-elhouss.me" /var/log/nginx/staging-access.log | tail -20
   ```

### Migration Failures
1. SSH to Lightsail
2. Run migrations manually:
   ```bash
   docker exec backend python manage.py migrate
   # Or for staging
   docker exec backend-staging python manage.py migrate
   ```
3. Check migration status:
   ```bash
   docker exec backend python manage.py showmigrations
   ```

## Performance Optimizations

### Build Times
- **With GHCR cache**: 8-12 minutes
- **Without cache** (force rebuild): 15-20 minutes
- **Single service** (backend only): 5-8 minutes
- **Rollback**: 5-8 minutes (no build, just deploy)

### Optimization Tips
1. Deploy only changed services (backend/frontend/nginx instead of all)
2. Use GHCR cache (don't force rebuild unless necessary)
3. Stage changes on staging first, then promote to production
4. Keep staging stopped when not in use (auto-cleanup helps)

## Best Practices

### Development Workflow
1. Create feature branch from `master`
2. Develop and test locally
3. Push branch to GitHub
4. Deploy to staging: GitHub Actions > Deploy to Staging > Select your branch
5. Test on https://staging-watch-party.brahim-elhouss.me
6. Merge to `master` when ready
7. Deploy to production: GitHub Actions > Deploy to Production

### Emergency Rollback
If production deployment fails:
1. Go to GitHub Actions > Rollback Deployment
2. Select `production` environment
3. Enter previous working SHA (check git log)
4. Execute rollback (5-8 minutes)

### Monitoring Production
- Backend health: https://be-watch-party.brahim-elhouss.me/health/
- Frontend health: https://watch-party.brahim-elhouss.me
- Check email for deployment notifications
- Monitor GitHub Actions for workflow status

### Cost Optimization
- Staging auto-stops after 24h (saves ~40-50% resources)
- GHCR cleanup keeps only 10 versions (saves storage costs)
- Manual deployments prevent unnecessary builds on every push

## Migration from Old Workflow

### What Changed
- ❌ Removed: Auto-deploy on push to `master`
- ✅ Added: Manual deployment via GitHub Actions
- ✅ Added: GHCR caching for faster builds
- ✅ Added: Email notifications
- ✅ Added: Staging environment support
- ✅ Added: Version-based rollback
- ✅ Added: Staging auto-cleanup

### Old Deploy Script (Deprecated)
The old `.github/workflows/deploy.yml` has been replaced with:
- `.github/workflows/deploy-production.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/rollback.yml`
- `.github/workflows/staging-cleanup.yml`

### Credentials Security Enhancement
- ✅ Removed hardcoded `DATABASE_URL` from `docker-compose.yml`
- ✅ Added environment-specific secret rotation
- ✅ Migrated to AWS Secrets Manager for sensitive credentials

## Support

For issues or questions:
- Check GitHub Actions logs for deployment details
- Review email notifications for deployment status
- SSH to Lightsail for direct container access
- Check health check script output for diagnostics

**Deployment Owner**: bross.or.of.1@gmail.com
